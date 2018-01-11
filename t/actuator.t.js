require('proof')(2, require('cadence')(prove))

function prove (async, okay) {
    var cadence = require('cadence')
    var Reactor = require('reactor')

    function Service () {
        this.reactor = new Reactor(this, function (dispatcher) {
            dispatcher.dispatch('POST /colleague/1/bootstrap', 'bootstrap')
            dispatcher.dispatch('POST /colleague/2/join', 'join')
        })
    }

    Service.prototype.bootstrap = cadence(function (async, request) {
        okay(request.body, {
            republic: 0,
            url: { self: 'http://127.0.0.1/colleague/1/' }
        }, 'bootstrapped')
        return 200
    })

    Service.prototype.join = cadence(function (async, request) {
        okay(request.body, {
            republic: 0,
            url: {
                self: 'http://127.0.0.1/colleague/2/',
                leader: 'http://127.0.0.1/colleague/1/'
            }
        }, 'join')
        return 200
    })

    var service = new Service

    var UserAgent = require('vizsla')
    var Interlocutor = require('interlocutor')
    var ua = new UserAgent().bind({
        http: new Interlocutor(service.reactor.middleware)
    })

    var Actuator = require('../actuator')
    var actuator = new Actuator(ua)

    async(function () {
        actuator.actuate({
            action: 'bootstrap',
            url: {
                self: 'http://127.0.0.1/colleague/1/'
            },
            colleague: { startedAt: 0 }
        }, async())
    }, function () {
        actuator.actuate({
            action: 'join',
            url: {
                self: 'http://127.0.0.1/colleague/2/',
                leader: 'http://127.0.0.1/colleague/1/'
            },
            republic: 0
        }, async())
    })
}
