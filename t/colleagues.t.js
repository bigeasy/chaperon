require('proof')(1, require('cadence')(prove))

function prove (async, assert) {
    var cadence = require('cadence')
    var Colleagues = require('../colleagues')
    var UserAgent = require('vizsla')
    var coalesce = require('nascent.coalesce')

    var Dispatcher = require('inlet/dispatcher')

    function Service () {
        var dispatcher = new Dispatcher(this)
        dispatcher.dispatch('GET /dummy', 'dummy')
        dispatcher.dispatch('GET /discover', 'discover')
        dispatcher.dispatch('GET /conduit', 'conduit')
        dispatcher.dispatch('GET /conduit/island/1/health', 'colleague')
        this.dispatcher = dispatcher
    }

    Service.prototype.discover = cadence(function (async) {
        return [['10.2.77.6:8486']]
    })

    Service.prototype.conduit = cadence(function (async) {
        return { paths: [ '/island/1', '/island/2' ] }
    })

    var responses = [{
        requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
        island: 'island',
        republic: 1,
        startedAt: 1,
        id: '1',
        government: {
            majority: [ '1', '2' ],
            minority: [ '3' ],
            constituents: [],
            promise: '4/0'
        }
    }]
    Service.prototype.colleague = cadence(function (async) {
        return coalesce(responses.shift(), null)
    })

    var service = new Service
    var ua = new UserAgent(service.dispatcher.createWrappedDispatcher())
    var colleagues = new Colleagues({
        ua: ua,
        mingle: 'http://127.0.0.1:8080/discover',
        conduit: 'http://%s/conduit'
    })

    async(function () {
        colleagues.get(async())
    }, function (colleagues) {
        assert(colleagues, [{
            island: 'island',
            republic: 1,
            startedAt: 1,
            id: '1',
            url: 'http://10.2.77.6:8486/conduit/island/1/',
            government: {
                majority: [ '1', '2' ],
                minority: [ '3' ],
                constituents: [],
                promise: '4/0'
            }
        }], 'colleagues')
    })
}
