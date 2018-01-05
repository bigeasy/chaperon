require('proof')(5, prove)

function prove (okay) {
    var Chaperon = require('../chaperon')
    var now = 0
    var chaperon = new Chaperon({
        colleagues: {
            get: function (callback) { callback(null, []) }
        },
        stableAfter: 1,
        Date: { now: function () { return now } }
    })
    var colleagues = [{
        island: 'island',
        id: '1',
        republic: 1,
        government: {
            majority: [ '1' ],
            minority: []
        }
    }]
    var islands = chaperon._gathered(colleagues)
    console.log(islands.island)
    okay(islands['island'].stable === false, 'unstable')
    now++
    var islands = chaperon._gathered(colleagues)
    okay(islands['island'].stable, 'stable')
    okay(islands['island'], {
        name: 'island',
        stable: true,
        uninitialized: [],
        recoverable: [{
            republic: 1,
            recoverable: true,
            colleagues: [{
                island: 'island',
                republic: 1,
                id: '1',
                government: { majority: [ '1' ], minority: [] }
            }]
        }],
        unrecoverable: []
    }, 'gathered')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: false,
        }
    }), [],  'unstable')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: true,
            uninitialized: [{
                republic: null,
                recoverable: true,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    id: '1',
                    government: { majority: [], minority: [] }
                }, {
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    id: '2',
                    government: { majority: [], minority: [] }
                }]
            }],
            recoverable: [],
            unrecoverable: []
        }
    }), [{
        action: 'bootstrap',
        colleague: {
            island: 'island',
            id: '1',
            startedAt: 0,
            republic: null,
            government: { majority: [], minority: [] }
        }
    }], 'bootstrap')
}
