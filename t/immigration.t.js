require('proof')(1, prove)

function prove (assert) {
    var immigration = require('../immigration')
    var outcome = immigration([
        {
            islandId: '0'
        },
        {
            islandId: '1',
            legislatorId: '1',
            goverment: {
                promise: '3/0',
                majority: [ '1', '2' ],
                minority: [ '3' ]
            }
        },
        {
            islandId: '1',
            legislatorId: '2',
            goverment: {
                promise: '3/0',
                majority: [ '1', '2' ],
                minority: [ '3' ]
            }
        },
        {
            islandId: '1',
            legislatorId: '3',
            goverment: {
                promise: '3/0',
                majority: [ '1', '2' ],
                minority: [ '3' ]
            }
        }
    ])
    assert(outcome, {
        immigrants: [{ islandId: '0' }],
        leader: {
            islandId: '1',
            legislatorId: '1',
            goverment: {
                promise: '3/0',
                majority: [ '1', '2' ],
                minority: [ '3' ]
            }
        }
    }, 'immigration')
}
