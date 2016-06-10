var cadence = require('cadence')
var logger = require('prolific.logger').createLogger('bigeasy.reinstate')
var unrecoverable = require('./unrecoverable')
var immigration = require('./immigration')
var util = require('util')
var assert = require('assert')

function Monitor (ua, url, uptime) {
    assert(url && uptime, 'constructor')
    this._ua = ua
    this._url = url
    this._uptime = uptime
    this._stableAfter = 900
    this._duraiton = 0
    this._previous = []
    this._lastChecked = null
}

Monitor.prototype._steadfast = function  (previous, next) {
    previous = previous.map(function (colleague) {
        return String(colleague.colleagueId)
    }).sort()
    next = next.map(function (colleague) {
        return String(colleague.colleagueId)
    }).sort()
    return next.filter(function (id, index) {
        return previous[index] == id
    }).length == next.length
}

// If we have been stable in machine count and availablity for more than thirty
// seconds, then if we have an unrecoverable Paxos island, let's reboot the
// consensus, otherwise look for machines that are not part of stable island..

Monitor.prototype.check = cadence(function (async) {
    async(function () {
        this._uptime.get(async())
    }, function (response) {
        console.log(response)
        if (response.uptime < this._stableAfter) {
            return []
        }
// TODO Second uptime.
        var colleagues = [].concat.apply([], response.machines.map(function (machine) {
            return machine.health.colleagues.map(function (colleague) {
                return {
                    location: machine.location,
                    islandName: colleague.islandName,
                    colleagueId: colleague.colleagueId,
                    health: colleague.health
                }
            })
        }))
        var islands = colleagues.map(function (colleague) {
            return colleague.islandName
        }).filter(function (islandNames, index, set) {
            return set.indexOf(islandNames) == index
        }).map(function (islandName) {
            return {
                name: islandName,
                colleagues: colleagues.filter(function (colleague) {
                    return colleague.islandName == islandName
                }).sort(function (a, b) {
                    return a.uptime - b.uptime
                })
            }
        })
        var now = Date.now()
        async.forEach(function (island) {
            if (island.colleagues.length == 0 ||
                island.colleagues.filter(function (colleague) {
                    return colleague.health != null
                }).length != island.colleagues.length ||
                !this._steadfast(this._previous, island.colleagues)
            ) {
                this._duration = 0
            } else {
                this._duration += now - this._lastChecked
            }
            this._lastChecked = now
            this._previous = island.colleagues
            console.log(island.name, this._duration, this._stableAfter)
            if (this._duration < this._stableAfter) {
                return []
            }
            if (unrecoverable(island.colleagues)) {
                var leader = island.colleagues.pop(), islandId = Date.now()
                async(function () {
                    console.log(util.format(this._url, leader.location))
                    this._ua.fetch({
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
                    }, async())
                }, function (body, response) {
                    console.log(response.statusCode)
                    async.forEach(function (immigrant) {
                        this._ua.fetch({
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
                        }, async())
                    })(island.colleagues)
                })
            } else {
                var immigrate = immigration(island.colleagues), leader = immigrate.leader
                console.log(immigrate)
                async.forEach(function (immigrant) {
                    async(function () {
                        this._ua.fetch({
                            url: util.format(this._url, immigrant.location)
                        }, {
                            url: '/join',
                            post: {
                                islandName: island.name,
                                islandId: leader.health.islandId,
                                colleagueId: immigrant.colleagueId,
                                properties: {
                                    location: immigrant.location,
                                    islandName: island.name,
                                    colleagueId: immigrant.colleagueId
                                },
                                liaison: {
                                    location: immigrate.leader.location,
                                    islandName: island.name,
                                    colleagueId: immigrate.leader.colleagueId
                                }
                            },
                            nullify: true
                        }, async())
                    }, function (body, response) {
                        console.log(response.statusCode)
                    })
                })(immigrate.immigrants)
            }
        })(islands)
    })
})

module.exports = Monitor
