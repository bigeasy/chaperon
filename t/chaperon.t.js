require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var Chaperon = require('../chaperon')
    var chaperon
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
                colleagueId: 'colleague-1',
            }]
        }
    })

    Service.prototype.health = cadence(function (async) {
        return {
            requests: { occupied: 1, waiting: 0, rejecting: 0, turnstiles: 24 },
            islandName: 'island',
            islandId: 1467398192058,
            startedAt: 1467398192058,
            colleagueId: 'colleague-1',
            government:
            {
                majority: [ 'colleague-1', 'colleague-2' ],
                minority: [ 'colleague-3' ],
                constituents: [],
                promise: '4/0'
            }
        }
    })

    var service = new Service
    var ua = new UserAgent(service.dispatcher.createWrappedDispatcher())
    var Uptime = require('mingle.uptime')
    var uptime = new Uptime('http://127.0.0.1:8080/discover', 'http://%s/colleagues', ua)
    var chaperon = new Chaperon(ua, uptime, 'http://%s/health')

    async(function () {
        chaperon.action({
            body: {
                colleagueId: 'colleague-1',
                islandName: 'island',
                islandId: 1467398192058,
                startedAt: 1467398192058
            }
        }, async())
    }, function (results) {
        assert(results, { name: 'unstable', vargs: [] }, 'action')
    })
}
