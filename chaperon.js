// Last time you came back to this project, you couldn't understand why it is a
// separate process and not a library run by the Colleague. No reason. Only that
// it is doing something rather different, so it may as well run in it's own
// process, because with Node.js processes are like threads. If there is a
// problem with discovery, in production, we'll see problems with this process
// and not with the colleague or the procsses it monitors.
//
// It's seperate because it is a seperate utility. It runs in it's own process.
// It uses HTTP because that's our default RPC protocol.

//

// TODO Things like this need a careful name auditing.
// TODO What is that supposed to mean; "name auditing?"
var cadence = require('cadence')
var logger = require('prolific.logger').createLogger('chaperon')
var unrecoverable = require('./unrecoverable')
var immigration = require('./immigration')
var util = require('util')
var assert = require('assert')
var transform = require('./transform')
var concat = [].concat
var log = logger.trace.bind(logger)
var Monotonic = require('monotonic').asString
var Dispatcher = require('inlet/dispatcher')

function Chaperon (ua, uptime, health) {
    this._ua = ua
    this._uptime = uptime
    this._stableAfter = 900
    this._duraiton = 0
    this._stability = {}
    this._health = health
    this._participating = {}
    var dispatcher = new Dispatcher(this)
    dispatcher.dispatch('GET /', 'index')
    dispatcher.dispatch('POST /action', 'action')
    dispatcher.dispatch('GET /health', 'health')
    this.dispatcher = dispatcher
}

Chaperon.prototype.index = cadence(function () {
    return 'Compassion Chaperon API\n'
})

function Group (groupBy, collection, array) {
    var groups = []
    array.forEach(function (element) {
        var group = groups.filter(function (group) {
            return group[groupBy] == element[groupBy]
        }).shift()
        if (!group) {
            group = {}
            group[groupBy] = element[groupBy]
            group[collection] = []
            groups.push(group)
        }
        group[collection].push(element)
    })
    this.array = groups
    this.map = {}
    this.null = null
    this.array.forEach(function (group) {
        if (group[groupBy] == null) {
            this.null = group
        } else {
            this.map[group[groupBy]] = group
        }
    }, this)
}

function comparator (keys) {
    return function (a, b) {
        var compare = 0
        for (var i = 0, I = keys.length; i < I; i++) {
            var key = keys[i]
            var compare = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0
            if (compare != 0) {
                break
            }
        }
        return compare
    }
}

// If we have been stable in machine count and availablity for more than thirty
// seconds, then if we have an unrecoverable Paxos island, let's reboot the
// consensus, otherwise look for machines that are not part of stable island..

Chaperon.prototype._maybeAction = function (colleagues, request, now) {
    var colleagues = colleagues.filter(function (colleague) {
        return colleague.islandName = request.islandName
    })
    var stablity = this._stability[request.islandName]
    if (stablity == null) {
        stablity = this._stability[request.islandName] = { lastChecked: null, previous: [] }
    }
    var current = colleagues.slice().map(function (colleague) {
        return { key: colleague.key, startedAt: colleague.startedAt }
    }).sort(comparator('key', 'startedAt'))
    if (current.length == stablity.previous.length
        && current.filter(function (colleague, index) {
            return stablity.previous[index] != null
                && stablity.previous[index].key == colleague.key
                && stablity.previous[index].startedAt == colleague.startedAt
        }).length == current.length) {
        stablity.duration = now - stablity.lastChecked
    } else {
        stablity.duration = 0
    }
    stablity.lastChecked = now
    stablity.previous = current
    if (this._stableAfter <= stablity.duration) {
        return this._action(colleagues, request)
    } else {
        return { name: 'unstable', vargs: [] }
    }
}

Chaperon.prototype._action = function (colleagues, request) {
    var instances = colleagues.filter(function (colleague) {
        return colleague.colleagueId == request.colleagueId
    })
    switch (instances.length) {
    case 1:
        if (instances[0].startedAt != null) {
            if (instances[0].islandId != request.islandId) {
                return { name: 'garbled', vargs: [] }
            }
            return reachable(instances[0])
        }
    case 0:
        return { name: 'unreachable', vargs: [] }
    default:
        return { name: 'duplicates', vargs: [instances] }
    }

    function reachable (instance) {
        var instances = new Group('islandId', 'colleagues', colleagues)
        instances.array.filter(function (instance) {
            instance.unrecoverable = instance.islandId == null
                || unrecoverable(instance.colleagues)
        })
        // Check for split brain. Let's hope this doesn't happen. Get all of the
        // island instances that are recoverable and assert that there is only
        // one such island instance.
        var recoverable = instances.array.filter(function (instance) {
            return ! instance.unrecoverable
        })
        if (recoverable.length > 1) {
            logger.error('splitBrain', { $instances: recoverable })
            recoverable.forEach(function (instance) { instance.splitBrain = true })
            if (request.islandId == null) {
                return { name: 'splitBrain', vargs: [] }
            } else if (instances.map[request.islandId].splitBrain) {
                return { name: 'splitBrain', vargs: [] }
            }
        }
        if (request.islandId == null) {
            if (recoverable.length == 0) {
                var oldest = instances.null.colleagues.sort(function (a, b) {
                    return a.startedAt - b.startedAt
                }).shift()
                if (oldest.colleagueId == request.colleagueId) {
                    return { name: 'bootstrap', vargs: [] }
                } else {
                    return { name: 'unstable', vargs: [] }
                }
            } else {
                var leaderId = recoverable[0].colleagues.sort(function (a, b) {
                    return Monotonic.compare(b.promise, a.promise)
                })[0].parliament[0]
                var leader = recoverable[0].colleagues.filter(function (colleague) {
                    return colleague.colleagueId == leaderId
                }).shift()
                return {
                    name: 'join',
                    vargs: [{
                        location: leader.location,
                        islandId: leader.islandId,
                        islandName: leader.islandName,
                        colleagueId: leader.colleagueId
                    }]
                }
            }
        } else if (instances.map[request.islandId].unrecoverable) {
            return { name: 'unrecoverable', vargs: [] }
        } else {
            return { name: 'recoverable', vargs: [] }
        }
    }
}

Chaperon.prototype.action = cadence(function (async, request) {
    var colleagues = {}
    async(function () {
        this._uptime.get(async())
    }, function (response) {
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
                            log: log,
                            nullify: true
                        }, async())
                    }, function (body) {
                        if (body != null) {
                            var key = '[' + colleague.islandName + ']' + colleague.colleagueId
                            colleagues[key] = body
                        }
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
        logger.trace('transform', { $request: request.body, $response: response, $transformed: transformed })
        var action = this._maybeAction(transformed, request.body, Date.now())
        logger.trace('action', {
            action: { name: action.name, $vargs: action.vargs },
            $colleague: request.body
        })
        return action
    })
})

Chaperon.prototype.health = cadence(function () {
    var health = { http: this.dispatcher.turnstile.health }
    logger.info('health', health)
    return health
})

module.exports = Chaperon
