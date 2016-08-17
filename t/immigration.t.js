require('proof/redux')(1, prove)

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
    return
    var outcome = immigration(
     [ { location: '10.2.11.3:8486',
         key: '[bucketizer]emissary-nest-4025030258-9rv4z',
         uptime: 2380398,
         islandName: 'bucketizer',
         colleagueId: 'emissary-nest-4025030258-9rv4z',
         islandId: 1468965759092,
         promise: '1/0',
         leader: 'emissary-nest-4025030258-9rv4z',
         parliament: [ 'emissary-nest-4025030258-9rv4z' ] },
       { location: '10.2.30.4:8486',
         key: '[bucketizer]emissary-nest-4025030258-482dq',
         uptime: 2221521,
         islandName: 'bucketizer',
         colleagueId: 'emissary-nest-4025030258-482dq',
         islandId: null,
         promise: null,
         leader: null,
         parliament: null },
       { location: '10.2.78.6:8486',
         key: '[bucketizer]emissary-nest-4025030258-8gong',
         uptime: 2164073,
         islandName: 'bucketizer',
         colleagueId: 'emissary-nest-4025030258-8gong',
         islandId: null,
         promise: null,
         leader: null,
         parliament: null } ])
    console.log(outcome)
}
