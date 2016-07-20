// TODO Things like this need a careful name auditing.
// TODO What is that supposed to mean; "name auditing?"
var cadence = require('cadence')
var logger = require('prolific.logger').createLogger('bigeasy.reinstate')
var unrecoverable = require('./unrecoverable')
var immigration = require('./immigration')
var util = require('util')
var assert = require('assert')
var transform = require('./transform')
var concat = [].concat

function Monitor (ua, url, uptime, health) {
    this._ua = ua
    this._url = url
    this._uptime = uptime
    this._stableAfter = 900
    this._duraiton = 0
    this._previous = []
    this._lastChecked = null
    this._health = health
}

Monitor.prototype._steadfast = function  (previous, next) {
    next = next.sort(function (a, b) {
        return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
    })
    return next.filter(function (colleague, index) {
        return previous[index] != null
            && previous[index].key == colleague.key
            && previous[index].uptime < colleague.uptime
    }).length == next.length
}

// If we have been stable in machine count and availablity for more than thirty
// seconds, then if we have an unrecoverable Paxos island, let's reboot the
// consensus, otherwise look for machines that are not part of stable island..

Monitor.prototype._evaluate = function (islands, now) {
    var operations = []
    var current = concat.apply([], islands.map(function (island) {
        return island.colleagues.map(function (colleague) {
            return {
                key: colleague.key,
                uptime: colleague.uptime == null ? -1 : colleague.uptime
            }
        })
    }))
    if (this._steadfast(this._previous, current)) {
        this._duration += now - this._lastChecked
    } else {
        this._duration = 0
    }
    this._lastChecked = now
    this._previous = current
    if (this._duration < this._stableAfter) {
        return []
    }
    islands.forEach(function (island) {
        if (unrecoverable(island.colleagues)) {
            var leader = island.colleagues.pop(), islandId = now
            operations.push([
                {
                    url: util.format(this._url, leader.location)
                }, {
                    url: '/bootstrap',
                    post: {
                        islandName: island.name,
                        islandId: islandId,
                        colleagueId: leader.colleagueId,
                        properties: {
                            location: leader.location,
                            islandName: island.name,
                            colleagueId: leader.colleagueId
                        }
                    }
                }
            ])
            island.colleagues.forEach(function (immigrant) {
                operations.push([
                    {
                        url: util.format(this._url, leader.location)
                    }, {
                        url: '/join',
                        post: {
                            islandName: island.name,
                            islandId: islandId,
                            colleagueId: immigrant.colleagueId,
                            properties: {
                                location: immigrant.location,
                                islandName: island.name,
                                colleagueId: immigrant.colleagueId
                            },
                            liaison: {
                                location: leader.location,
                                islandName: island.name,
                                colleagueId: leader.colleagueId
                            }
                        }
                    }
                ])
            }, this)
        } else {
            var immigrate = immigration(island.colleagues), leader = immigrate.leader
            console.log(require('util').inspect(immigrate, { depth: null }))
            immigrate.immigrants.forEach(function (immigrant) {
                operations.push([
                    {
                        url: util.format(this._url, immigrant.location)
                    }, {
                        url: '/join',
                        post: {
                            islandName: island.name,
                            islandId: leader.islandId,
                            colleagueId: immigrant.colleagueId,
                            properties: {
                                location: immigrant.location,
                                islandName: island.name,
                                colleagueId: immigrant.colleagueId
                            },
                            liaison: {
                                location: leader.location,
                                islandName: island.name,
                                colleagueId: leader.colleagueId
                            }
                        }
                    }
                ])
            }, this)
        }
    }, this)
    console.log(require('util').inspect(operations, { depth: null }))
    return operations
}

Monitor.prototype._operate = cadence(function (async, operations) {
    async.map(function (operation) {
        async(function () {
            this._ua.fetch(operation, { nullify: true }, async())
        }, function (body) {
            return [ body ]
        })
    })(operations)
})

Monitor.prototype._operations = cadence(function (async) {
    var colleagues = {}
    async(function () {
        this._uptime.get(async())
    }, function (response) {
        console.log('here', response)
        async(function () {
            async.forEach(function (machine) {
                if (machine.health == null) {
                    return []
                }
                async.forEach(function (colleague) {
                    async(function () {
                        this._ua.fetch({
                            url: util.format(this._health, machine.location),
                            post: colleague,
                            nullify: true
                        }, async())
                    }, function (body) {
                        colleagues['[' + colleague.islandName + ']' + colleague.colleagueId] = body
                    })
                })(machine.health.colleagues)
            })(response.machines)
        }, function () {
            return {
                mingle: response,
                colleagues: colleagues
            }
        })
    }, function (response) {
        var transformed = transform(response)
        var evaluation = this._evaluate(transformed, Date.now())
        console.log(require('util').inspect(evaluation, { depth: null }))
        return [ evaluation ]
    })
})

Monitor.prototype.check = cadence(function (async) {
    async(function () {
        this._operations(async())
    }, function (operations) {
        this._operate(operations, async())
    })
})

module.exports = Monitor
