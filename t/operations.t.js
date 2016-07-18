require('proof')(4, prove)

function prove (assert) {
    var Monitor = require('../monitor')
    var transform = require('../transform')
    var monitor = new Monitor(null, 'http://%s', null)
    var badness = transform(require('./badness'))
    var operations = monitor._evaluate(badness, 0)
    assert(operations, [], 'operations')
    badness[0].colleagues.forEach(function (colleague) {
        colleague.uptime++
    })
    operations = monitor._evaluate(badness, 1000)
    assert(operations,
[ [ { url: 'http://10.2.91.7:8486' },
    { url: '/bootstrap',
      post:
       { islandName: 'bucketizer',
         islandId: 1000,
         colleagueId: 'emissary-nest-fhz08',
         properties:
          { location: '10.2.91.7:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-fhz08' } } } ],
  [ { url: 'http://10.2.91.7:8486' },
    { url: '/join',
      post:
       { islandName: 'bucketizer',
         islandId: 1000,
         colleagueId: 'emissary-nest-0kq4o',
         properties:
          { location: '10.2.77.6:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-0kq4o' },
         liaison:
          { location: '10.2.91.7:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-fhz08' } } } ],
  [ { url: 'http://10.2.91.7:8486' },
    { url: '/join',
      post:
       { islandName: 'bucketizer',
         islandId: 1000,
         colleagueId: 'emissary-nest-21qhh',
         properties:
          { location: '10.2.9.6:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-21qhh' },
         liaison:
          { location: '10.2.91.7:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-fhz08' } } } ] ],
    'operations')
    var recovering = transform(require('./recovering'))
    var operations = monitor._evaluate(recovering, 0)
    assert(operations, [], 'operations')
    recovering[0].colleagues.forEach(function (colleague) {
        colleague.uptime++
    })
    operations = monitor._evaluate(recovering, 1000)
    assert(operations, [], 'operations')
}
