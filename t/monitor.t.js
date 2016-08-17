require('proof/redux')(2, require('cadence')(prove))

function prove (async, assert) {
    var Monitor = require('../monitor')
    var monitor
    var Dispatcher = require('inlet/dispatcher')
    var UserAgent = require('vizsla')
    var cadence = require('cadence')

    function Service () {
        var dispatcher = new Dispatcher(this)
        dispatcher.dispatch('GET /dummy', 'dummy')
        dispatcher.dispatch('GET /discover', 'discover')
        dispatcher.dispatch('GET /colleagues', 'colleagues')
        dispatcher.dispatch('POST /health', 'health')
        this.dispatcher = dispatcher
    }

    Service.prototype.dummy = cadence(function (async) {
        return { called: true }
    })

    Service.prototype.discover = cadence(function (async) {
        return [['10.2.77.6:8486']]
    })

    Service.prototype.colleagues = cadence(function (async) {
        return {
            instanceId: 1,
            colleagues:
            [{
                islandName: 'bucketizer',
                colleagueId: 'emissary-nest-0kq4o'
            }]
        }
    })

    Service.prototype.health = cadence(function (async) {
        console.log("FALLLLDSFS")
        return {
            uptime: 772647,
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
        }
    })

    var service = new Service
    var ua = new UserAgent(service.dispatcher.createWrappedDispatcher())
    var Uptime = require('mingle.uptime')
    var uptime = new Uptime('http://127.0.0.1:8080/discover', 'http://%s/colleagues', ua)
    var monitor = new Monitor(ua, 'http://%s', uptime, 'http://%s/health')

    async(function () {
        monitor._operate([{ url: 'http://127.0.0.1:8080/dummy' }], async())
    }, function (results) {
        assert(results, [{ called: true }], 'operate')
        monitor._operations(async())
    }, function (operations) {
        assert(operations, [], 'operations')
        monitor.check(async())
    })

}
