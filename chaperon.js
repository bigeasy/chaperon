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
var coalesce = require('extant')
var util = require('util')

var ascension = require('ascension')

// Control-flow utilities.
var cadence = require('cadence')

var Monotonic = require('monotonic').asString


var logger = require('prolific.logger').createLogger('chaperon')
var unrecoverable = require('./unrecoverable')
var recoverable = require('./recoverable')

var Uptime = require('mingle.uptime')

// Bind an object to Sencha Connect middleware.
var Reactor = require('reactor')

// Most-recently used cache.
var Cache = require('magazine')

function Chaperon (options) {
    this._colleagues = options.colleagues
    this._stableAfter = options.stableAfter
    this._Date = coalesce(options.Date, Date)
    this._uptimes = new Cache().createMagazine()
    this.reactor = new Reactor(this, function (dispatcher) {
        dispatcher.dispatch('GET /', 'index')
        dispatcher.dispatch('POST /action', 'action')
        dispatcher.dispatch('GET /health', 'health')
    })
}

Chaperon.prototype.index = cadence(function () {
    return [ 200, { 'content-type': 'text/plain' }, 'Compassion Chaperon API\n' ]
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

Chaperon.prototype._gathered = function (colleagues) {
    var islands = group('island', 'colleagues', colleagues).map
    var gathered = {}
    // Deterimine the actions for each island.
    for (var islandName in islands) {
        var island = islands[islandName]
        gathered[islandName] = {
            name: islandName,
            stable: false,
            uninitialized: null,
            recoverable: null,
            unrecoverable: null
        }
        // See if the colleagues that make up this island have stabilized.
        var uptime = this._uptimes.get(island.island, new Uptime({ Date: this._Date }))
        if (uptime.calculate(island.colleagues) < this._stableAfter) {
            continue
        }
        gathered[islandName].stable = true
        var republics = group('republic', 'colleagues', island.colleagues).array
        gathered[islandName].uninitialized = republics.filter(function (republic) {
            return republic.republic == null
        })
        var republics = republics.filter(function (republic) {
            return republic.republic != null
        })
        // We're going to assume that we would not have started a new republic
        // if the old was had become unrecoverable. Could be a chance that we
        // actually have two functioning republics, so we'd want to make log
        // this state since it is split brain. I've not seen it in the wild yet
        // so I'm not overly converned about it at the moment.
        gathered[islandName].recoverable = republics.filter(function (republic) {
            return republic.recoverable = recoverable(republic.colleagues)
        })
        gathered[islandName].unrecoverable = republics.filter(function (republic) {
            return ! republic.recoverable
        })
    }
    this._uptimes.expire(1000 * 60 * 15)
    return gathered
}

Chaperon.prototype._actions = function (islands) {
    var actions = []
    for (var name in islands) {
        var island = islands[name]
        if (!island.stable) {
            continue
        }
    }
    return actions
}

Chaperon.prototype.x = function (colleagues, request) {
    // Group into islands.
    var islands = group('island', 'colleagues', colleagues).map
    // Get the colleagues for the requested island.
    if (islands[request.island] == null) {
        return { name: 'unreachable' }
    }
    for (var islandName in islands) {
        var island = islands[islandName]
        // See if the colleagues that make up this island have stabilized.
        var uptime = this._uptimes.get(island.island, new Uptime({ Date: this._Date }))
        if (uptime.calculate(island.colleagues) < this._stableAfter) {
            island.stable = false
            continue
        }
    }
    // Clear out uptimes after fifteen minutes.
    // Return out calculations.
    return islands
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
        return republic.republic != null
        // && !unrecoverable(republic.colleagues)
    })
    if (recoverable.length > 1) {
        return { name: 'splitBrain' }
    }
    /*
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
    */
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
        var republic = republics.map[recoverable[0].republic]
        var leaderId = republic.colleagues.sort(function (a, b) {
            return Monotonic.compare(b.promise, a.promise)
        })[0].government.majority[0]
        var leader = republic.colleagues.filter(function (colleague) {
            return colleague.id == leaderId
        }).shift()
        if (leader == null) {
            return { name: 'unrecoverable' }
        }
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
    recoverable = recoverable.filter(function (republic) {
        return !unrecoverable(republic.colleagues)
    })

    if (recoverable.length == 0) {
        // We are part of an island that is unrecoverable.
        return { name: 'unrecoverable' }
    }

    var republic = republics.map[recoverable[0].republic]
    var colleagues = republic.colleagues.sort(function (a, b) {
        return Monotonic.compare(a.promise, b.promise)
    })

    // We are up and running.
    return {
        name: 'recoverable',
        copacetic: colleagues[0].promise == colleagues[colleagues.length - 1].promise
    }
}

Chaperon.prototype.action = cadence(function (async, request) {
    var colleagues = {}
    async(function () {
        this._colleagues.get(async())
    }, function (colleagues) {
        logger.info('request', { $colleagues: colleagues, $request: request.body })
        var action = this._action(colleagues, request.body)
        logger.info('action', { $action: action, copacetic: !! action.copacetic })
        return action
    })
})

Chaperon.prototype.health = cadence(function () {
    var health = { http: this.reactor.turnstile.health }
    logger.info('health', health)
    return health
})

module.exports = Chaperon
