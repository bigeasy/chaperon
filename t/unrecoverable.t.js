require('proof')(3, prove)

function prove (assert) {
    var unrecoverable = require('../unrecoverable')
    assert(unrecoverable([{ health: { islandId: null } }]), 'stable with no island')
    assert(unrecoverable([
        {
            health: {
                islandId: '0',
                government: { promise: '1/0' }
            }
        },
        {
            health: {
                islandId: '1',
                legislatorId: '1',
                government: {
                    promise: '3/0',
                    majority: [ '1', '4' ],
                    minority: [ '5' ]
                }
            }
        },
        {
            health: {
                islandId: '1',
                legislatorId: '2',
                government: { promise: '2/0' }
            }
        },
        {
            health: {
                islandId: '1',
                legislatorId: '3',
                government: { promise: '2/0' }
            }
        }
    ]), 'no quorum')
    assert(!unrecoverable([
        {
            health: {
                islandId: '0',
                government: { promise: '1/0' }
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
    ]), 'quorum')
}
