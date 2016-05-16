require('proof')(3, prove)

function prove (assert) {
    var unrecoverable = require('../unrecoverable')
    assert(!unrecoverable([]), 'no machines')
    assert(unrecoverable([{ islandId: null }]), 'stable with no island')
    assert(unrecoverable([
        {
            islandId: '0'
        },
        {
            islandId: '1',
            legislatorId: '1',
            goverment: {
                promise: '3/0',
                majority: [ '1', '4' ],
                minority: [ '5' ]
            }
        },
        {
            islandId: '1',
            legislatorId: '2',
            goverment: { promise: '2/0' }
        },
        {
            islandId: '1',
            legislatorId: '3',
            goverment: { promise: '2/0' }
        }
    ]), 'no quorum')
}
