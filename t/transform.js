// Do not immigrate if leader is not present. This health report represents a
// government where the leader has crashed, so the new colleague is not able to
// join because we can't figure out the leader. We're waiting for the current
// government to elect a new leader.
//
// Note that this example from staging is in a really bad state because only
// majority member has apparently never synchronized, but the test case is still
// valid.
[ { machine:
     { location: '127.0.0.1:8486',
       health:
        { instanceId: 0,
          colleagues: [ { islandName: 'memento', colleagueId: '1' } ] } },
    colleagues:
     [ { startedAt: 14750233770000,
         requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
         islandName: 'memento',
         colleagueId: '1',
         islandId: null,
         government: null } ] } ]
module.exports = {
    mingle: {
        uptime: 1998,
        machines:
        [{
            location: '10.2.77.6:8486',
            health:
            {
                instanceId: 1,
                colleagues:
                [{
                    islandName: 'bucketizer',
                    colleagueId: 'emissary-nest-0kq4o'
                }]
            },
        }, {
            location: '10.2.9.6:8486',
            health:
            {
                instanceId: 0,
                colleagues:
                [{
                    islandName: 'bucketizer',
                    colleagueId: 'emissary-nest-21qhh'
                }]
            },
        }, {
            location: '10.2.91.7:8486',
            health:
            {
                instanceId: 0,
                colleagues:
                [{
                    islandName: 'bucketizer',
                    colleagueId: 'emissary-nest-fhz08'
                }]
            }
        }]
    },
    colleagues: {
        '[bucketizer]emissary-nest-fhz08':
        {
            startedAt: 1475023391,
            requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
            islandName: 'bucketizer',
            islandId: null,
            colleagueId: 'emissary-nest-fhz08',
            government: null
        },
        '[bucketizer]emissary-nest-0kq4o':
        {
            startedAt: 1475023430,
            requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
            islandName: 'bucketizer',
            islandId: 1467398192058,
            colleagueId: 'emissary-nest-0kq4o',
            government:
            {
                majority: [ 'emissary-nest-fhz08', 'emissary-nest-21qhh' ],
                minority: [ 'emissary-nest-0kq4o' ],
                constituents: [],
                promise: '4/0'
            }
        },
        '[bucketizer]emissary-nest-21qhh':
        {
            startedAt: 1475023442,
            requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
            islandName: 'bucketizer',
            islandId: 1467398192058,
            colleagueId: 'emissary-nest-21qhh',
            government:
            {
                promise: '0/0',
                minority: [],
                majority: []
            }
        }
    }
}
