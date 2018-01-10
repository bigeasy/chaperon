require('proof')(4, require('cadence')(prove))

function prove (async, okay) {
    var Reactor = require('reactor')
    var cadence = require('cadence')

    function Service () {
        this.reactor = new Reactor(this, function (dispatcher) {
            dispatcher.dispatch('/bootstrap', 'bootstrap')
            dispatcher.dispatch('/join', 'join')
        })
    }

    Service.prototype.bootstrap = cadence(function (async) {
        return 200
    })

    Service.prototype.join = cadence(function (async) {
        return 200
    })

    var service = new Service

    var UserAgent = require('vizsla')
    var Interlocutor = require('interlocutor')

    var ua = new UserAgent().bind({ http: new Interlocutor(service.reactor.middlware) })

    var cadence = require('cadence')
    var got = [cadence(function (async) {
        var error = new Error
        error.statusCode = 503
        throw error
    }), cadence(function (async) {
        return null
    })]

    var Middleware = require('../middleware')
    var middleware = new Middleware({
        colleagues: {
            get: function (callback) {
                got.shift()(callback)
            }
        },
        gatherer: {
            gather: function () {
                return {
                    halted: {
                        name: 'halted',
                        stable: true,
                        uninitialized: [{
                            republic: null,
                            recoverable: true,
                            colleagues: [{
                                island: 'island',
                                startedAt: 0,
                                republic: null,
                                rejoining: 1,
                                id: '1',
                                government: { majority: [], minority: [] }
                            }, {
                                island: 'island',
                                startedAt: 0,
                                republic: null,
                                id: '2',
                                government: { majority: [], minority: [] }
                            }]
                        }],
                        recoverable: [],
                        unrecoverable: []
                    },
                    island: {
                        name: 'island',
                        stable: true,
                        uninitialized: [{
                            republic: null,
                            recoverable: true,
                            colleagues: [{
                                island: 'island',
                                startedAt: 0,
                                republic: null,
                                id: '1',
                                government: { majority: [], minority: [] }
                            }, {
                                island: 'island',
                                startedAt: 0,
                                republic: null,
                                id: '2',
                                government: { majority: [], minority: [] }
                            }]
                        }],
                        recoverable: [],
                        unrecoverable: []
                    }
                }
            }
        },
        actuator: {
            actUpon: cadence(function () {})
        }
    })
    async(function () {
        middleware.index(async())
    }, function (statusCode) {
        okay(statusCode, 200, 'index')
        middleware.health(async())
    }, function (health) {
        okay(health, {
            http: { occupied: 0, waiting: 0, rejecting: 0, turnstiles: 24 },
            gathered: null,
            actions: []
        }, 'health')
        middleware.halted(null, 'island', async())
    }, function (statusCode, headers, body) {
        okay(body, 'No\n', 'not halted')
        middleware.probe(async())
    }, function () {
        middleware.probe(async())
    }, function () {
        middleware.halted(null, 'halted', async())
    }, function (statusCode, headers, body) {
        okay(body, 'Yes\n', 'not halted')
    })
}
