require('proof')(4, prove)

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
}
