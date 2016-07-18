require('proof')(4, prove)

function prove (assert) {
    var unrecoverable = require('../unrecoverable')
    assert(unrecoverable([{ health: { islandId: null } }]), 'stable with no island')
    assert(unrecoverable([
        {
            islandId: '0',
            promise: '1/0'
        },
        {
            islandId: '1',
            colleagueId: '1',
            promise: '3/0',
            parliament: [ '1', '4', '5' ]
        },
        {
            islandId: '1',
            colleagueId: '2',
            promise: '2/0'
        },
        {
            islandId: '1',
            colleagueId: '3',
            promise: '2/0'
        }
    ]), 'no quorum')
    assert(!unrecoverable([
       { location: '10.2.77.6:8486',
         key: '[bucketizer]emissary-nest-0kq4o',
         uptime: 772647,
         islandName: 'bucketizer',
         colleagueId: 'emissary-nest-0kq4o',
         islandId: 1467398192058,
         promise: '4/0',
         leader: 'emissary-nest-fhz08',
         parliament:
          [ 'emissary-nest-fhz08',
            'emissary-nest-21qhh',
            'emissary-nest-0kq4o' ] },
       { location: '10.2.9.6:8486',
         key: '[bucketizer]emissary-nest-21qhh',
         uptime: 691602,
         islandName: 'bucketizer',
         colleagueId: 'emissary-nest-21qhh',
         islandId: 1467398192058,
         promise: '4/0',
         leader: 'emissary-nest-fhz08',
         parliament:
          [ 'emissary-nest-fhz08',
            'emissary-nest-21qhh',
            'emissary-nest-0kq4o' ] },
       { location: '10.2.91.7:8486',
         key: '[bucketizer]emissary-nest-fhz08',
         uptime: 685438,
         islandName: 'bucketizer',
         colleagueId: 'emissary-nest-fhz08',
         islandId: null,
         promise: null,
         leader: null,
         parliament: null } ]), 'collapsed')
    assert(!unrecoverable([
        {
            islandId: '0',
            promise: '1/0'
        },
        {
            islandId: '1',
            colleagueId: '1',
            promise: '3/0',
            parliament: [ '1', '2', '3' ]
        },
        {
            islandId: '1',
            colleagueId: '2',
            promise: '3/0',
            parliament: [ '1', '2', '3' ]
        },
        {
            islandId: '1',
            colleagueId: '3',
            promise: '3/0',
            parliament: [ '1', '2', '3' ]
        }
    ]), 'quorum')
}
