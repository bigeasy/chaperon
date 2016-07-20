require('proof')(5, prove)

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
    var immigration =
{ mingle:
   { uptime: 999,
     machines:
      [ { location: '10.2.11.3:8486',
          health:
           { instanceId: 0,
             colleagues:
              [ { islandName: 'bucketizer',
                  colleagueId: 'emissary-nest-4025030258-9rv4z' } ] } },
        { location: '10.2.30.4:8486',
          health:
           { instanceId: 0,
             colleagues:
              [ { islandName: 'bucketizer',
                  colleagueId: 'emissary-nest-4025030258-482dq' } ] } },
        { location: '10.2.78.6:8486',
          health:
           { instanceId: 0,
             colleagues:
              [ { islandName: 'bucketizer',
                  colleagueId: 'emissary-nest-4025030258-8gong' } ] } } ] },
  colleagues:
   { '[bucketizer]emissary-nest-4025030258-9rv4z':
      { uptime: 2380398,
        requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
        islandName: 'bucketizer',
        colleagueId: 'emissary-nest-4025030258-9rv4z',
        islandId: 1468965759092,
        government:
         { majority: [ 'emissary-nest-4025030258-9rv4z' ],
           minority: [],
           constituents: [],
           promise: '1/0' } },
     '[bucketizer]emissary-nest-4025030258-482dq':
      { uptime: 2221521,
        requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
        islandName: 'bucketizer',
        colleagueId: 'emissary-nest-4025030258-482dq',
        islandId: null,
        government: null },
     '[bucketizer]emissary-nest-4025030258-8gong':
      { uptime: 2164073,
        requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
        islandName: 'bucketizer',
        colleagueId: 'emissary-nest-4025030258-8gong',
        islandId: null,
        government: null } } }
    immigration = transform(immigration)
    operations = monitor._evaluate(immigration, 0)
    immigration[0].colleagues.forEach(function (colleague) {
        colleague.uptime++
    })
    operations = monitor._evaluate(immigration, 1000)
    assert(operations,
[ [ { url: 'http://10.2.30.4:8486' },
    { url: '/join',
      post:
       { islandName: 'bucketizer',
         islandId: 1468965759092,
         colleagueId: 'emissary-nest-4025030258-482dq',
         properties:
          { location: '10.2.30.4:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-4025030258-482dq' },
         liaison:
          { location: '10.2.11.3:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-4025030258-9rv4z' } } } ],
  [ { url: 'http://10.2.78.6:8486' },
    { url: '/join',
      post:
       { islandName: 'bucketizer',
         islandId: 1468965759092,
         colleagueId: 'emissary-nest-4025030258-8gong',
         properties:
          { location: '10.2.78.6:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-4025030258-8gong' },
         liaison:
          { location: '10.2.11.3:8486',
            islandName: 'bucketizer',
            colleagueId: 'emissary-nest-4025030258-9rv4z' } } } ] ], 'immigrate')
}
