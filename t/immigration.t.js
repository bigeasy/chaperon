require('proof')(1, prove)

function prove (assert) {
    var immigration = require('../immigration')
    var outcome = immigration([
        {
            health: {
                islandId: '0'
            }
        },
        {
            health: {
                islandId: '1',
                legislatorId: '1',
                government: {
                    promise: '3/0',
                    majority: [ '1', '2' ],
                    minority: [ '3' ]
                }
            }
        },
        {
            health: {
                islandId: '1',
                legislatorId: '2',
                government: {
                    promise: '3/0',
                    majority: [ '1', '2' ],
                    minority: [ '3' ]
                }
            }
        },
        {
            health: {
                islandId: '1',
                legislatorId: '3',
                government: {
                    promise: '3/0',
                    majority: [ '1', '2' ],
                    minority: [ '3' ]
                }
            }
        }
    ])
    assert(outcome, {
        immigrants: [{ health: { islandId: '0' } }],
        leader: {
            health: {
                islandId: '1',
                legislatorId: '1',
                government: {
                    promise: '3/0',
                    majority: [ '1', '2' ],
                    minority: [ '3' ]
                }
            }
        }
    }, 'immigration')
}
