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

// Common utilities.
var coalesce = require('nascent.coalesce')
var util = require('util')

var ascension = require('ascension')

// Control-flow utilities.
var cadence = require('cadence')

var Monotonic = require('monotonic').asString


var logger = require('prolific.logger').createLogger('chaperon')
var unrecoverable = require('./unrecoverable')

var Uptime = require('mingle.uptime')

// Bind an object to Sencha Connect middleware.
var Dispatcher = require('inlet/dispatcher')

// Most-recently used cache.
var Cache = require('magazine')

function Chaperon (options) {
    this._colleagues = options.colleagues
    this._stableAfter = options.stableAfter || 2000
    this._Date = coalesce(options.Date, Date)
    this._uptimes = new Cache().createMagazine()
    var dispatcher = new Dispatcher(this)
    dispatcher.dispatch('GET /', 'index')
    dispatcher.dispatch('POST /action', 'action')
    dispatcher.dispatch('GET /health', 'health')
    this.dispatcher = dispatcher
}

Chaperon.prototype.index = cadence(function () {
    return 'Compassion Chaperon API\n'
})

function group (groupBy, collection, list) {
    var groups = {}, array = []
    list.forEach(function (element) {
        var group = array.filter(function (group) {
            return group[groupBy] == element[groupBy]
        }).shift()
        if (!group) {
            group = {}
            group[groupBy] = element[groupBy]
            group[collection] = []
            array.push(group)
        }
        group[collection].push(element)
    })
    groups.array = array
    groups.map = {}
    groups.null = null
    groups.array.forEach(function (group) {
        if (group[groupBy] == null) {
            groups.null = group
        } else {
            groups.map[group[groupBy]] = group
        }
    }, groups)
    return groups
}

var byStartedAtThenId = ascension([ Number, String ], function (object) {
    return [ object.startedAt, object.id ]
})

Chaperon.prototype._action = function (colleagues, request) {
    // Group into islands.
    var islands = group('island', 'colleagues', colleagues).map
    // Get the colleagues for the requested island.
    if (islands[request.island] == null) {
        return { name: 'unreachable' }
    }
    var island = islands[request.island]
    // See if the colleagues that make up this island have stabilized.
    var uptime = this._uptimes.get(island.island, new Uptime({ Date: this._Date }))
    if (uptime.calculate(island.colleagues) < this._stableAfter) {
        return { name: 'unstable' }
    }
    // Clear out after fifteen minutes.
    this._uptimes.expire(1000 * 60 * 15)
    // See if we can find the requesting colleague over the network and make
    // sure that no other colleague is using its id.
    var instances = island.colleagues.filter(function (colleague) {
        return colleague.id == request.id
    })
    switch (instances.length) {
    case 1:
        if (instances[0].republic != request.republic) {
            return { name: 'garbled' }
        }
        break
    case 0:
        return { name: 'unreachable' }
    default:
        return { name: 'duplicated' }
    }
    var instance = instances.shift()
    // Keeping with our island metaphor, we group an estabished running instance
    // of Paxos into Republics. If Paxos becomes unrecoverable, we form a new
    // Republic.
    //
    // Check for split brain. Let's hope this doesn't happen. Group the
    // instances by island id, which is an island lifetime. Check if the
    // colleagues associated with a specific island lifetime are recoverable.
    // There should only be one that is recoverable. If there is more than one,
    // then we have more than one functioning island.

    //
    var republics = group('republic', 'colleagues', island.colleagues)
    var recoverable = republics.array.filter(function (republic) {
        return republic.republic != null && !unrecoverable(republic.colleagues)
    }).map(function (republic) {
        return republic.republic
    })
    if (recoverable.length > 1) {
        logger.error('splitBrain', {
            $republics: recoverable, $colleagues: colleagues, $request: request
        })
        if (request.republic != null && ~recoverable.indexOf(request.republic)) {
            return { name: 'splitBrain' }
        } else {
            return { name: 'unstable' }
        }
    }
    // Looking to join.

    //
    if (request.republic == null) {
        if (recoverable.length == 0) {
            // If there is no island established, it is bootstrapped by the
            // instance that has been running the longest. If that's not us, we
            // wait. Note that, yes, two instances can start at the same
            // millisecond, so let's hope that we detect any sort of split brain
            // created by that event.
            var oldest = republics.null.colleagues.sort(byStartedAtThenId).shift()
            if (oldest.id == request.id) {
                return {
                    name: 'bootstrap',
                    url: {
                        self: instance.url
                    }
                }
            }
            return { name: 'unstable' }
        }
        // Find the leader of the current island by first selecting the
        // colleague with the greated promise and using the leader id
        // specified in that government to find the leader.
        var republic = republics.map[recoverable[0]]
        var leaderId = republic.colleagues.sort(function (a, b) {
            return Monotonic.compare(b.promise, a.promise)
        })[0].government.majority[0]
        var leader = republic.colleagues.filter(function (colleague) {
            return colleague.id == leaderId
        }).shift()
        // Ask that leader to immigrate us.
        return {
            name: 'join',
            republic: leader.republic,
            url: {
                self: instance.url,
                leader: leader.url
            }
        }
    }

    if (recoverable.length == 0) {
        // We are part of an island that is unrecoverable.
        return { name: 'unrecoverable' }
    }

    // We are up and running.
    return { name: 'recoverable' }
}

Chaperon.prototype.action = cadence(function (async, request) {
    var colleagues = {}
    async(function () {
        this._colleagues.get(async())
    }, function (colleagues) {
        var action = this._action(colleagues, request.body)
        logger.info('action', { $action: action })
        return action
    })
})

Chaperon.prototype.health = cadence(function () {
    var health = { http: this.dispatcher.turnstile.health }
    logger.info('health', health)
    return health
})

module.exports = Chaperon
