require('proof')(4, prove)

function prove (okay) {
    var Gatherer = require('../gatherer')
    var now = 0
    var gatherer = new Gatherer({
        Date: { now: function () { return now } },
        stableAfter: 1
    })
    var colleagues = [{
        island: 'island',
        id: '1',
        republic: 1,
        government: {
            promise: '2/0',
            majority: [ '1' ],
            minority: []
        }
    }, {
        island: 'island',
        id: '2',
        republic: 1,
        government: {
            promise: '2/0',
            majority: [ '1' ],
            minority: []
        }
    }]
    var islands = gatherer.gather(colleagues, 0)
    okay(islands['island'].stable === false, 'unstable')
    now++
    var islands = gatherer.gather(colleagues, 0)

    okay(islands['island'].stable, 'stable')
    okay(islands['island'], {
        name: 'island',
        stable: true,
        okay: true,
        uninitialized: [],
        recoverable: [{
            republic: 1,
            recoverable: true,
            colleagues: [{
                island: 'island',
                republic: 1,
                id: '1',
                government: { promise: '2/0', majority: [ '1' ], minority: [] }
            }, {
                island: 'island',
                republic: 1,
                id: '2',
                government: { promise: '2/0', majority: [ '1' ], minority: [] }
            }]
        }],
        unrecoverable: []
    }, 'gathered')
    var colleagues = [{
        island: 'island',
        id: '1',
        republic: null,
        government: {
            majority: [ '1' ],
            minority: []
        }
    }]
    var islands = gatherer.gather(colleagues, 0)
    now++
    var islands = gatherer.gather(colleagues, 0)
    okay(islands['island'], {
        name: 'island',
        stable: true,
        okay: true,
        uninitialized: [{
            republic: null,
            colleagues: [{
                island: 'island',
                republic: null,
                id: '1',
                government: { majority: [ '1' ], minority: [] }
            }]
        }],
        recoverable: [],
        unrecoverable: []
    }, 'gathered null')
}
