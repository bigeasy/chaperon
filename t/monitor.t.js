require('proof')(7, require('cadence')(prove))

function prove (async, assert) {
    var Monitor = require('../monitor')
    var monitor
    async(function () {
        new Monitor(null, {
            get: function (callback) { callback(null, { uptime: 0 }) }
        }).check(async())
    }, function (response) {
        assert(!response, 'uptime')
        var count = 0
        new Monitor({
            bootstrap: function (location, islandId, callback) {
                assert(location, 'x', 'bootstrap')
                callback()
            },
            join: function (location, liaison, islandId, callback) {
                if (count++ == 0) {
                    assert(liaison, 'x', 'join')
                }
                callback()
            }
        }, {
            get: function (callback) {
                callback(null,
                {
                    uptime: 30001,
                    machines: [
                        {
                            uptime: 1,
                            islandId: '0'
                        },
                        {
                            uptime: 3,
                            islandId: '1',
                            legislatorId: '1',
                            goverment: {
                                promise: '3/0',
                                majority: [ '1', '4' ],
                                minority: [ '5' ]
                            }
                        },
                        {
                            uptime: 3,
                            islandId: '1',
                            legislatorId: '2',
                            goverment: { promise: '2/0' }
                        },
                        {
                            location: 'x',
                            uptime: 4,
                            islandId: '1',
                            legislatorId: '3',
                            goverment: { promise: '2/0' }
                        }
                    ]
                })
            }
        }).check(async())
    }, function (response) {
        assert(response, 'unrecoverable')
        new Monitor({
            bootstrap: function (location, islandId, callback) {
                assert(location, 'x', 'bootstrap')
                callback()
            },
            join: function (location, liaison, islandId, callback) {
                assert(location, 'x', 'immigrate location')
                assert(liaison, 'y', 'immigrate liaison')
                assert(islandId, '2', 'immigrate island id')
                callback()
            }
        }, {
            get: function (callback) {
                callback(null,
                {
                    uptime: 30001,
                    machines: [
                        {
                            uptime: 3,
                            location: 'y',
                            islandId: '2',
                            legislatorId: '1',
                            goverment: {
                                promise: '3/0',
                                majority: [ '1' ],
                                minority: [ ]
                            }
                        },
                        {
                            location: 'x',
                            uptime: 4,
                            islandId: '1',
                            legislatorId: '3',
                            goverment: { promise: '2/0' }
                        }
                    ]
                })
            }
        }).check(async())
    })
}