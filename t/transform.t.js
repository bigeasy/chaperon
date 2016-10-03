require('proof/redux')(1, prove)

function prove (assert) {
    var transform = require('../transform')
    var data = require('./transform')
    var expected = [{
        location: '10.2.91.7:8486',
        key: '[bucketizer]emissary-nest-fhz08',
        colleagueId: 'emissary-nest-fhz08',
        islandName: 'bucketizer',
        startedAt: 1475023391,
        islandId: null,
        promise: null,
        parliament: []
    }, {
        location: '10.2.77.6:8486',
        key: '[bucketizer]emissary-nest-0kq4o',
        islandName: 'bucketizer',
        startedAt: 1475023430,
        colleagueId: 'emissary-nest-0kq4o',
        islandId: 1467398192058,
        promise: '4/0',
        parliament: [ 'emissary-nest-fhz08', 'emissary-nest-21qhh', 'emissary-nest-0kq4o' ]
    }, {
        location: '10.2.9.6:8486',
        key: '[bucketizer]emissary-nest-21qhh',
        islandName: 'bucketizer',
        startedAt: 1475023442,
        colleagueId: 'emissary-nest-21qhh',
        islandId: 1467398192058,
        promise: '0/0',
        parliament: []
    } ]
    assert(transform(data).sort(function (a, b) {
        return a.startedAt - b.startedAt
    }), expected, 'compare')
}
