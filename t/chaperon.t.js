require('proof/redux')(14, require('cadence')(prove))

function prove (async, assert) {
    var Chaperon = require('../chaperon')
    var now = 0
    var chaperon = new Chaperon({
        colleagues: {
            get: function (callback) { callback(null, []) }
        },
        stableAfter: 1,
        Date: { now: function () { return now } }
    })
    var Dispatcher = require('inlet/dispatcher')
    var UserAgent = require('vizsla')
    var cadence = require('cadence')

    async(function () {
        chaperon.index(async())
    }, function (index) {
        assert(index, 'Compassion Chaperon API\n', 'index')
        chaperon.health(async())
    }, function (health) {
        assert(health, {
            http: { occupied: 0, waiting: 0, rejecting: 0, turnstiles: 24 }
        }, 'index')
        chaperon.action({}, async())
    }, function (results) {
        assert(results, { name: 'unreachable' }, 'no islands')
        assert(chaperon._action({
            island: [{
                island: 'island',
                id: '1',
                republic: 1
            }]
        }, {
            island: 'island',
            republic: 0,
            id: '1'
        }), { name: 'unstable' }, 'unstable')
        now++
        assert(chaperon._action({
            island: [{
                island: 'island',
                id: '1',
                republic: 1
            }] }, {
            island: 'island',
            republic: 0,
            id: '1'
        }), { name: 'garbled' }, 'garbled')
        chaperon._action({
            island: [{
                island: 'island',
                id: '1',
                republic: 0
            }, {
                island: 'island',
                id: '1',
                republic: 0
            }]
        }, {
            island: 'island',
            republic: 0,
            id: '1'
        })
        now++
        assert(chaperon._action({
            island: [{
                island: 'island',
                id: '1',
                republic: 0
            }, {
                island: 'island',
                id: '1',
                republic: 0
            }]
        }, {
            island: 'island',
            republic: 0,
            id: '1'
        }), { name: 'duplicated' }, 'duplicated')
        chaperon._action({
            island: [{
                island: 'island',
                id: '1',
                republic: 0
            }, {
                island: 'island',
                id: '2',
                republic: 0
            }, {
                island: 'island',
                id: '3',
                republic: 0
            }, {
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: 0,
            id: '1'
        })
        now++
        assert(chaperon._action({
            island: [{
                island: 'island',
                id: '1',
                republic: 0
            }, {
                island: 'island',
                id: '2',
                republic: 0
            }, {
                island: 'island',
                id: '3',
                republic: 0
            }, {
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: 0,
            id: '5'
        }), { name: 'unreachable' }, 'unreachable')
        assert(chaperon._action({
            island: [{
                island: 'island',
                id: '1',
                republic: 0,
                government: {
                    majority: [ '1' ],
                    minority: []
                }
            }, {
                promise: '1/0',
                island: 'island',
                id: '2',
                republic: 1,
                government: {
                    majority: [ '2' ],
                    minority: []
                }
            }, {
                promise: '2/0',
                island: 'island',
                id: '3',
                republic: 1,
                government: {
                    majority: [ '2' ],
                    minority: []
                }
            }, {
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: 0,
            id: '1'
        }), { name: 'splitBrain' }, 'split brain')
        assert(chaperon._action({
            island: [{
                island: 'island',
                id: '1',
                republic: 0,
                government: {
                    majority: [ '1' ],
                    minority: []
                }
            }, {
                promise: '1/0',
                island: 'island',
                id: '2',
                republic: 1,
                government: {
                    majority: [ '2' ],
                    minority: []
                }
            }, {
                promise: '2/0',
                island: 'island',
                id: '3',
                republic: 1,
                government: {
                    majority: [ '2' ],
                    minority: []
                }
            }, {
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: null,
            id: '4'
        }), { name: 'unstable' }, 'split brain unstable')
        assert(chaperon._action({
            island: [{
                startedAt: 1,
                island: 'island',
                id: '1',
                republic: null,
                government: {
                    majority: [ '1' ],
                    minority: []
                }
            }, {
                startedAt: 1,
                promise: '1/0',
                island: 'island',
                id: '2',
                republic: null,
                government: {
                    majority: [ '2' ],
                    minority: []
                }
            }, {
                startedAt: 1,
                promise: '2/0',
                island: 'island',
                id: '3',
                republic: null,
                government: {
                    majority: [ '2' ],
                    minority: []
                }
            }, {
                startedAt: 0,
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: null,
            id: '4'
        }), { name: 'bootstrap' }, 'bootstrap')
        // Island needs a bootstrap, but not by us because we're older than
        // everyone else.
        assert(chaperon._action({
            island: [{
                startedAt: 1,
                island: 'island',
                id: '1',
                republic: null,
                government: null
            }, {
                startedAt: 1,
                promise: '1/0',
                island: 'island',
                id: '2',
                republic: null,
                government: null
            }, {
                startedAt: 1,
                promise: '2/0',
                island: 'island',
                id: '3',
                republic: null,
                government: null
            }, {
                startedAt: 2,
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: null,
            id: '4'
        }), { name: 'unstable' }, 'bootstrap unstable')
        // Join an existing island.
        assert(chaperon._action({
            island: [{
                startedAt: 1,
                location: 'x',
                promise: '4/0',
                island: 'island',
                id: '1',
                republic: 0,
                government: {
                    majority: [ '1' ],
                    minority: []
                }
            }, {
                startedAt: 1,
                promise: '3/0',
                island: 'island',
                id: '2',
                republic: 0,
                government: null
            }, {
                startedAt: 1,
                island: 'island',
                id: '3',
                republic: null,
                government: null
            }, {
                startedAt: 2,
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: null,
            id: '4'
        }), {
            name: 'join',
            republic: 0,
            leader: {
                id: '1',
                location: 'x'
            }
        }, 'join')
        // Unrecoverable.
        assert(chaperon._action({
            island: [{
                startedAt: 1,
                location: 'x',
                promise: '4/0',
                island: 'island',
                id: '1',
                republic: 0,
                government: {
                    majority: [ '8' ],
                    minority: []
                }
            }, {
                startedAt: 1,
                promise: '3/0',
                island: 'island',
                id: '2',
                republic: 0,
                government: null
            }, {
                startedAt: 1,
                island: 'island',
                id: '3',
                republic: null,
                government: null
            }, {
                startedAt: 2,
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: 0,
            id: '1'
        }), {
            name: 'unrecoverable'
        }, 'unrecoverable')
        assert(chaperon._action({
            island: [{
                startedAt: 1,
                location: 'x',
                promise: '4/0',
                island: 'island',
                id: '1',
                republic: 0,
                government: {
                    majority: [ '1' ],
                    minority: []
                }
            }, {
                startedAt: 1,
                promise: '3/0',
                island: 'island',
                id: '2',
                republic: 0,
                government: null
            }, {
                startedAt: 1,
                island: 'island',
                id: '3',
                republic: null,
                government: null
            }, {
                startedAt: 2,
                island: 'island',
                id: '4',
                republic: null,
                government: null
            }]
        }, {
            island: 'island',
            republic: 0,
            id: '1'
        }), {
            name: 'recoverable'
        }, 'recoverable')
    })
}
