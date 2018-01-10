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

// Generate a sort function.
var ascension = require('ascension')

var cadence = require('cadence')

var Monotonic = require('monotonic').asString

var logger = require('prolific.logger').createLogger('chaperon')

function Chaperon () {
}

var byStartedAtThenId = ascension([ Number, String ], function (object) {
    return [ object.startedAt, object.id ]
})

// The chaperon is going to make a best effort get newly booted islanders onto
// an island, or to get a newly booted islander to form an island if none
// exists. It takes the place of the sysadmin that would issue commands to
// bootstrap a new consensus and to tell new participants to join an existing
// consensus. It is not meant to be a consensus alogrithm in itself. It cannot
// make intelligent decisions about all failure cases.
//
// The chaperon polls the discovery end point to get a collection of network
// conduits. It then polls the network conduits to get a collection of
// partipants. It waits for a while to ensure that that the collection of
// participants is stable. It then makes a decision based on what the
// participants have to say for themselves.
//
// If the chaperon cannot get a healthy response from all the network conduits
// then it will not make a decision and instead wait for the network conduits to
// become stable.
//
// We are going to poll every member returned by discovery, so if the list of
// network conduits returned discovery endpoint is missing a conduit, the
// chaperon is going to make a bad decision.
//
// TODO Split brain is unrecoverable. The Chaperon will detect it. It is an
// unlikely state, it seems, but I'm not certain. It is definately a possiblity
// if the discovery end point returns an incomplete list of network conduits.
// We're probably going to want to look for this state in the logs in case we
// miss it in the chaperon.
//
// TODO Describe the `rejoining` property which will cause the chaperon to halt
// if it the chaperon is either forming a new consensus or if the consensus id
// is not the same as the consensus id indicated by the `rejoining` property.
//
// TODO Clever word for `uninitialized` which could be instead `booted` or
// `arriving` or something.

//
Chaperon.prototype.actions = function (islands) {
    var actions = {}
    // Chose an action for each island. A null list of actions indicates that
    // the island has halted.

    //
    for (var name in islands) {
        var island = islands[name]

        // An array of actions to take keyed by island name.
        actions[name] = []

        // If the island is not stable there is no action to take.
        if (!island.stable) {
            continue
        }

        // If the there are no current recoverable consensuses then we are going
        // to bootstrap a new conensus.
        if (island.recoverable.length == 0) {
            if (island.uninitialized.length != 0) {
                // If anyone of are participants believes it is going to rejoin an
                // existing consensus then we halt.
                if (island.uninitialized[0].colleagues.filter(function (colleague) {
                    return colleague.rejoining != null
                }).length != 0) {
                    actions[name] = null
                } else {
                    var oldest = island.uninitialized[0].colleagues.slice().sort(byStartedAtThenId).shift()
                    actions[name].push({ action: 'bootstrap', colleague: oldest })
                }
            }
        // This is split brain. Not really sure what the right answer is. It
        // is a bad state that has different meanings for different
        // applications.
        //
        // Split brain could occur if an entire island is unreachable to the
        // Chaperon when a new participant arrives. That new participant
        // would become a dictator. The missing island becomes reachable and
        // now we have a split brain. This is unlikely on a local network,
        // so I don't have any real world experience with it.
        //
        // For now we are going to return halted and count on our
        // environment to handle this, maybe by waking the admin.
        } else if (island.recoverable.length > 1) {
            actions[name] = null
        // TODO (Not true yet.) Otherwise we should tell any arriving
        // participants to join the current consensus. We tell the participant
        // to join by messaging the leader. This is a race condition since
        // leadership can change. If the consensus is under new leadership when
        // the participant trys to arrive it will crash restart.
        } else if (
            island.uninitialized.length != 0 &&
            island.uninitialized[0].colleagues.filter(function (colleague) {
                return !(
                    colleague.rejoining == null ||
                    colleague.rejoining == island.recoverable[0].republic
                )
            }).length != 0
        ) {
            actions[name] = null
        } else {
            var leaderId = island.recoverable[0].colleagues.sort(function (a, b) {
                return Monotonic.compare(b.government.promise, a.government.promise)
            })[0].government.majority[0]
            var leader = island.recoverable[0].colleagues.filter(function (colleague) {
                return colleague.id == leaderId
            }).shift()
            island.uninitialized[0].colleagues.forEach(function (colleague) {
                actions[name].push({
                    action: 'join',
                    republic: leader.republic,
                    url: {
                        self: colleague.url,
                        leader: leader.url
                    },
                    colleague: colleague
                })
            })
        }
    }
    return actions
}

module.exports = Chaperon
