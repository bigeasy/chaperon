require('proof/redux')(1, prove)

function prove (assert) {
    var transform = require('../transform')
    var badness = require('./badness')
    console.log(transform(badness)[0].colleagues)
    assert(transform(badness), [{
        name: 'bucketizer',
        colleagues:
        [ { location: '10.2.77.6:8486',
            key: '[bucketizer]emissary-nest-0kq4o',
            islandName: 'bucketizer',
            uptime: 772647,
            colleagueId: 'emissary-nest-0kq4o',
            islandId: 1467398192058,
            promise: '4/0',
            leader: 'emissary-nest-fhz08',
            parliament: [ 'emissary-nest-fhz08', 'emissary-nest-21qhh', 'emissary-nest-0kq4o' ] },
          { location: '10.2.9.6:8486',
            key: '[bucketizer]emissary-nest-21qhh',
            islandName: 'bucketizer',
            uptime: 691602,
            colleagueId: 'emissary-nest-21qhh',
            islandId: 1467398192058,
            promise: '0/0',
            leader: null,
            parliament: [] },
          { location: '10.2.91.7:8486',
            key: '[bucketizer]emissary-nest-fhz08',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-fhz08',
            uptime: 685438,
            islandId: null,
            promise: null,
            leader: null,
            parliament: null } ] } ], 'transform')
}
