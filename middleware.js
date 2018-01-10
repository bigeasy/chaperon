// Bind an object to Sencha Connect middleware.
var Reactor = require('reactor')

var url = require('url')

var cadence = require('cadence')

var actions = require('./actions')

var logger = require('prolific.logger').createLogger('chaperon')

function Middleware (options) {
    this._colleagues = options.colleagues
    this._gatherer = options.gatherer
    this._actuator = options.actuator
    this._gathered = null
    this._actions = []
    this.reactor = new Reactor(this, function (dispatcher) {
        dispatcher.dispatch('GET /', 'index')
        dispatcher.dispatch('GET /:island/halted', 'action')
        dispatcher.dispatch('GET /:island/health', 'health')
    })
}

Middleware.prototype.index = cadence(function () {
    return [ 200, { 'content-type': 'text/plain' }, 'Compassion Chaperon API\n' ]
})

Middleware.prototype.probe = cadence(function (async, request) {
    async([function () {
        async(function () {
            this._colleagues.get(async())
        }, function (colleagues) {
            this._gathered = this._gatherer.gather(colleagues)
            this._actions = actions(this._gathered)
            logger.info('probe.colleagues', { $colleagues: colleagues })
            logger.info('probe.gathered', { $gathered: this._gathered })
            logger.info('probe.actions', { $actions: this._actions })
            var flattened = []
            for (var island in this._actions) {
                if (this._actions[island]) {
                    flattened.push.apply(flattened, this._actions[island])
                }
            }
            async.forEach(function (action) {
                this._actuator.actUpon(action, async())
            })(flattened)
        })
    }, function (error) {
        logger.error('probe', { stack: error.stack, statusCode: error.statusCode })
    }])
})

Middleware.prototype.halted = cadence(function (async, request, island) {
    return [ 200, { 'content-type': 'text/plain' }, this._actions[island] === null ? 'Yes\n' : 'No\n' ]
})

Middleware.prototype.health = cadence(function (async, request, island) {
    var health = {
        http: this.reactor.turnstile.health,
        gathered: this._gathered,
        actions: this._actions
    }
    logger.info('health', health)
    return health
})

module.exports = Middleware
