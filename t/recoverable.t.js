require('proof')(4, prove)

function prove (okay) {
    var recoverable = require('../recoverable')
    okay(!recoverable([{ republic: null }]), 'stable with no island')
    okay(!recoverable([
        {
            republic: '0',
            government: {
                promise: '1/0'
            }
        }, {
            republic: '1',
            id: '1',
            government: {
                promise: '3/0',
                majority: [ '1', '4' ],
                minority: [ '5' ]
            }
        }, {
            republic: '1',
            id: '2',
            government: {
                promise: '2/0'
            }
        }, {
            republic: '1',
            id: '3',
            government: {
                promise: '2/0'
            }
        }
    ]), 'no quorum')
    okay(recoverable([{
        location: '10.2.77.6:8486',
        key: '[bucketizer]emissary-nest-0kq4o',
        uptime: 772647,
        island: 'bucketizer',
        id: 'emissary-nest-0kq4o',
        republic: 1467398192058,
        leader: 'emissary-nest-fhz08',
        government: {
            promise: '4/0',
            majority: [ 'emissary-nest-fhz08', 'emissary-nest-21qhh' ],
            minority: [ 'emissary-nest-0kq4o' ]
         }
    }, {
        location: '10.2.9.6:8486',
        key: '[bucketizer]emissary-nest-21qhh',
        uptime: 691602,
        island: 'bucketizer',
        id: 'emissary-nest-21qhh',
        republic: 1467398192058,
        leader: 'emissary-nest-fhz08',
        government: {
            promise: '4/0',
            majority: [ 'emissary-nest-fhz08', 'emissary-nest-21qhh' ],
            minority: [ 'emissary-nest-0kq4o' ]
        }
    }, {
        location: '10.2.91.7:8486',
        key: '[bucketizer]emissary-nest-fhz08',
        uptime: 685438,
        island: 'bucketizer',
        id: 'emissary-nest-fhz08',
        republic: null,
        leader: null,
        government: {
            promise: '0/0'
        }
    }]), 'collapsed')
    okay(recoverable([{
            republic: '0',
            government: {
                promise: '1/0'
            }
        }, {
            republic: '1',
            id: '1',
            government: {
                promise: '3/0',
                majority: [ '1', '2' ],
                minority: ['3' ]
            }
        }, {
            republic: '1',
            id: '2',
            government: {
                promise: '3/0',
                majority: [ '1', '2' ],
                minority: ['3' ]
            }
        }, {
            republic: '1',
            id: '3',
            government: {
                promise: '3/0',
                majority: [ '1', '2' ],
                minority: ['3' ]
            }
        }
    ]), 'quorum')
}
