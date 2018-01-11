var url = require('url')

var cadence = require('cadence')

var raiseify = require('vizsla/raiseify')
var jsonify = require('vizsla/jsonify')

function Actuator (ua) {
    this._ua = ua
}

Actuator.prototype.actuate = cadence(function (async, action) {
    switch (action.action) {
    case 'bootstrap':
        // TODO Make a note in documentation that network clocks need to be
        // roughly aligned. That or else maybe we hash some arbitrary stuff to
        // create a republic. Or maybe we hash some random stuff.
        this._ua.fetch({
            url: url.resolve(action.url.self, 'bootstrap'),
            post: {
                republic: action.colleague.startedAt,
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
})

module.exports = Actuator
