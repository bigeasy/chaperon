// Gather up all the active colleagues by first finding all the active conduits
// through resource discovery, then querying the active conduits for active
// colleagues.

// Common utilities.
var url = require('url')
var util = require('util')
var path_ = require('path')
var coalesce = require('extant')

// Control-flow utilities.
var cadence = require('cadence')

var logger = require('prolific.logger').createLogger('chaperon')

var raiseify = require('vizsla/raiseify')
var jsonify = require('vizsla/jsonify')

// Create a client with the given user agent that will query the Mingle end
// point URL at `mingle`. The `conduit` and `colleague` arguments are string
// formats used to create the URLs to query the conduit and colleague
// respectively.

//
function Colleagues (options) {
    this._ua = options.ua
    this._mingle = options.mingle
    this._conduit = options.conduit
    this._colleague = options.colleague
}

// Fetch an array of all the active colleagues.

//
Colleagues.prototype.get = cadence(function (async) {
    var colleagues = []
    async(function () {
        if (Array.isArray(this._mingle)) {
            return [ this._mingle ]
        } else {
            this._ua.fetch({
                url: this._mingle,
                gateways: [ raiseify(), jsonify({}) ]
            }, async())
        }
    }, function (got) {
            console.log('GOT!!!', got)
        async.map(function (conduitUrl) {
            console.log('CONDUITS!!!', conduitUrl)
            async(function () {
                this._ua.fetch({
                    url: url.resolve(conduitUrl, './health'),
                    gateways: [ raiseify(), jsonify({}) ]
                }, async())
            }, function (conduit) {
                logger.info('conduit', { url: conduitUrl, $response: conduit })
                async.map(function (path) {
                    var parsed = url.parse(url.resolve(conduitUrl + '/', './' +  path + '/'))
                    parsed.path = parsed.pathname = path_.normalize(String(parsed.pathname))
                    var colleagueUrl = url.format(parsed)
                    async(function () {
                        this._ua.fetch({
                            url: url.resolve(colleagueUrl, 'health'),
                            gateways: [ raiseify(), jsonify({}) ]
                        }, async())
                    }, function (got) {
                        colleagues.push({
                            island: got.island,
                            republic: got.republic,
                            id: got.id,
                            startedAt: got.startedAt,
                            url: colleagueUrl,
                            promise: got.government.promise,
                            government: got.government
                        })
                    })
                })(coalesce(coalesce(conduit, { paths: [] }).paths, []))
            })
        })(got)
    }, function () {
        return [ colleagues ]
    })
})

module.exports = Colleagues
