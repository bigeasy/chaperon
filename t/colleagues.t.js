require('proof')(3, require('cadence')(prove))

function prove (async, okay) {
    var cadence = require('cadence')
    var Colleagues = require('../colleagues')
    var UserAgent = require('vizsla')
    var Interlocutor = require('interlocutor')
    var coalesce = require('extant')

    var Reactor = require('reactor')

    function Service () {
        this.reactor = new Reactor(this, function (dispatcher) {
            dispatcher.dispatch('GET /dummy', 'dummy')
            dispatcher.dispatch('GET /discover', 'discover')
            dispatcher.dispatch('GET /conduit/health', 'conduit')
            dispatcher.dispatch('GET /conduit/island/1/health', 'colleague')
            dispatcher.dispatch('GET /conduit/island/2/health', 'colleague')
        })
    }

    Service.prototype.discover = cadence(function (async) {
        return [[ 'http://10.2.77.6:8486/conduit/' ]]
    })

    Service.prototype.conduit = cadence(function (async) {
        return { paths: [ '/island/1', '/island/2' ] }
    })

    var responses = [{
        requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
        island: 'island',
        startedAt: 1,
        id: '1',
        government: {
            republic: 1,
            majority: [ '1', '2' ],
            minority: [ '3' ],
            constituents: [],
            promise: '4/0'
        }
    }]
    Service.prototype.colleague = cadence(function (async) {
        return responses.shift() || 503
    })

    var service = new Service
    var ua = new UserAgent().bind({ http: new Interlocutor(service.reactor.middleware) })
    var colleagues = new Colleagues({
        ua: ua,
        mingle: 'http://127.0.0.1:8080/discover',
        conduit: 'http://%s/conduit/'
    })

    async([function () {
        colleagues.get(async())
    }, function (error) {
        okay(error.statusCode, 503, 'caught error')
        responses = [{
            requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
            island: 'island',
            startedAt: 1,
            id: '1',
            government: {
                republic: 1,
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }, {
            requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
            z: 1,
            island: 'island',
            startedAt: 2,
            id: '2',
            government: {
                republic: 1,
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }]
    }], function () {
        colleagues.get(async())
    }, function (colleagues) {
        okay(colleagues, [{
            republic: 1,
            island: 'island',
            startedAt: 1,
            id: '1',
            url: 'http://10.2.77.6:8486/conduit/island/1/',
            promise: '4/0',
            government: {
                republic: 1,
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }, {
            republic: 1,
            island: 'island',
            startedAt: 2,
            id: '2',
            url: 'http://10.2.77.6:8486/conduit/island/2/',
            promise: '4/0',
            government: {
                republic: 1,
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }], 'discovery from mingle')
        responses = [{
            requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
            island: 'island',
            startedAt: 1,
            id: '1',
            government: {
                republic: 1,
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }, {
            requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
            island: 'island',
            startedAt: 2,
            id: '2',
            government: {
                republic: 1,
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }]
        colleagues = new Colleagues({
            ua: ua,
            mingle: [ 'http://10.2.77.6:8486/conduit/' ]
        })
        colleagues.get(async())
    }, function (colleagues) {
        okay(colleagues, [{
            republic: 1,
            island: 'island',
            startedAt: 1,
            id: '1',
            url: 'http://10.2.77.6:8486/conduit/island/1/',
            promise: '4/0',
            government: {
                republic: 1,
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }, {
            republic: 1,
            island: 'island',
            startedAt: 2,
            id: '2',
            url: 'http://10.2.77.6:8486/conduit/island/2/',
            promise: '4/0',
            government: {
                republic: 1,
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }], 'discovery as array ')
    })
}
