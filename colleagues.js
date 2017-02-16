// Gather up all the active colleagues by first finding all the active conduits
// through resource discovery, then querying the active conduits for active
// colleagues.

// Common utilities.
var url = require('url')
var util = require('util')
var coalesce = require('nascent.coalesce')

// Control-flow utilities.
var cadence = require('cadence')


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
        this._ua.fetch({ url: this._mingle, nullify: true }, async())
    }, function (got) {
        async.map(function (host) {
            var conduitUrl = util.format(this._conduit, host)
            async(function () {
                this._ua.fetch({ url: conduitUrl, nullify: true }, async())
            }, function (conduit) {
                async.map(function (path) {
                    var colleagueUrl = util.format(this._colleague, host, path)
                    async(function () {
                        this._ua.fetch({ url: colleagueUrl, nullify: true }, async())
                    }, function (got) {
                        if (got == null) {
                            return
                        }
                        colleagues.push({
                            startedAt: got.startedAt,
                            id: got.id,
                            island: got.island,
                            republic: got.republic,
                            government: got.government
                        })
                    })
                })(coalesce(coalesce(conduit, { paths: [] }).paths, []))
            })
        })(coalesce(got, []))
    }, function () {
        return [ colleagues ]
    })
})

module.exports = Colleagues
