require('proof')(1, prove)

function prove (assert) {
    var immigration = require('../immigration')
    var outcome = immigration([
        {
            islandId: '0'
        },
        {
            islandId: '1',
            colleagueId: '1',
            promise: '3/0',
            leader: '1'
        },
        {
            islandId: '1',
            colleagueId: '2',
            promise: '3/0',
            majority: '1'
        },
        {
            islandId: '1',
            colleagueId: '3',
            promise: '3/0',
            leader: '1'
        }
    ])
    assert(outcome, {
        immigrants: [{ islandId: '0' }],
        leader: {
            islandId: '1',
            colleagueId: '1',
            promise: '3/0',
            leader: '1'
        }
    }, 'immigration')
}
