// Bind an object to Sencha Connect middleware.
var Reactor = require('reactor')

var url = require('url')

var cadence = require('cadence')

function Middleware (options) {
    this._gatherer = options.gatherer
    this._chaperon = options.chaperon
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
    async(function () {
        this._colleagues.get(async())
    }, function (colleagues) {
        this._gathered = this._gatherer.gather(colleagues)
        this._actions = this._chaperon.stragize(gathered)
        logger.info('probe.colleagues', { $colleagues: colleagues })
        logger.info('probe.gathered', { $gathered: this._gathered })
        logger.info('probe.actions', { $actions: this._actions })
        async.forEach(function (action) {
            switch (action.action) {
            case 'bootstrap':
                this._ua.fetch({
                    url: url.resolve(action.url.self, 'bootstrap'),
                    post: {
                        republic: action.colleague.createdAt,
                        url: action.url
                    },
                    gateways: [ raiseify(), jsonify({}) ]
                }, async())
                break
            case 'join':
                this._ua.fetch({
                    url: url.resolve(action.url.self, 'join'),
                    post: {
                        republic: action.republic,
                        url: action.url
                    },
                    gateways: [ raiseify(), jsonify({}) ]
                }, async())
                break
            }
        })(this._actions)
    })
})

Middleware.prototype.halted = cadence(function (async, request, island) {
    return this._actions[island] === null ? 'Yes\n' : 'No\n'
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
