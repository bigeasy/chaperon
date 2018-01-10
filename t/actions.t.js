require('proof')(8, prove)

function prove (okay) {
    var Chaperon = require('../chaperon')
    var now = 0
    var chaperon = new Chaperon({
        colleagues: {
            get: function (callback) { callback(null, []) }
        },
        stableAfter: 1,
        Date: { now: function () { return now } }
    })

    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: false,
        }
    }), { island: [] },  'unstable action')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: true,
            uninitialized: [],
            recoverable: [],
            unrecoverable: []
        }
    }), { island: [] }, 'empty action')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: true,
            uninitialized: [{
                republic: null,
                recoverable: true,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    id: '1',
                    government: { majority: [], minority: [] }
                }, {
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    id: '2',
                    government: { majority: [], minority: [] }
                }]
            }],
            recoverable: [],
            unrecoverable: []
        }
    }), {
        island: [{
            action: 'bootstrap',
            colleague: {
                island: 'island',
                id: '1',
                startedAt: 0,
                republic: null,
                government: { majority: [], minority: [] }
            }
        }]
    }, 'bootstrap')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: true,
            uninitialized: [],
            recoverable: [],
            unrecoverable: []
        }
    }), { island: [] }, 'empty action')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: true,
            uninitialized: [{
                republic: null,
                recoverable: true,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    id: '1',
                    url: 'http://127.0.0.1:8486/colleague/1',
                    government: { majority: [], minority: [] }
                }, {
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    id: '2',
                    url: 'http://127.0.0.1:8486/colleague/2',
                    government: { majority: [], minority: [] }
                }]
            }],
            recoverable: [{
                republic: 1,
                recoverable: true,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: 1,
                    id: '3',
                    url: 'http://127.0.0.1:8486/colleague/3',
                    government: { promise: 'a/0', majority: [ '3' ], minority: [] }
                }, {
                    island: 'island',
                    startedAt: 0,
                    republic: 1,
                    id: '4',
                    url: 'http://127.0.0.1:8486/colleague/4',
                    government: { promise: 'a/0', majority: [ '3' ], minority: [] }
                }]
            }],
            unrecoverable: []
        }
    }), {
        island: [{
            action: 'join',
            republic: 1,
            url: {
                self: 'http://127.0.0.1:8486/colleague/1',
                leader: 'http://127.0.0.1:8486/colleague/3'
            },
            colleague: {
                island: 'island',
                id: '1',
                url: 'http://127.0.0.1:8486/colleague/1',
                startedAt: 0,
                republic: null,
                government: { majority: [], minority: [] }
            }
        }, {
            action: 'join',
            republic: 1,
            url: {
                self: 'http://127.0.0.1:8486/colleague/2',
                leader: 'http://127.0.0.1:8486/colleague/3'
            },
            colleague: {
                island: 'island',
                id: '2',
                url: 'http://127.0.0.1:8486/colleague/2',
                startedAt: 0,
                republic: null,
                government: { majority: [], minority: [] }
            }
        }]
    }, 'join')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: true,
            uninitialized: [],
            recoverable: [{
                republic: 1,
                recoverable: true,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: 1,
                    id: '3',
                    url: 'http://127.0.0.1:8486/colleague/3',
                    government: { promise: 'a/0', majority: [ '3' ], minority: [] }
                }]
            }, {
                republic: 2,
                recoverable: true,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: 2,
                    id: '4',
                    url: 'http://127.0.0.1:8486/colleague/4',
                    government: { promise: 'a/0', majority: [ '4' ], minority: [] }
                }]
            }],
            unrecoverable: []
        }
    }), {
        island: null
    }, 'split brain')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: true,
            uninitialized: [{
                republic: null,
                recoverable: true,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    rejoining: 1,
                    id: '1',
                    government: { majority: [], minority: [] }
                }, {
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    id: '2',
                    government: { majority: [], minority: [] }
                }]
            }],
            recoverable: [],
            unrecoverable: []
        }
    }), {
        island: null,
    }, 'bootstrap with rejoining')
    okay(chaperon._actions({
        island: {
            name: 'island',
            stable: true,
            uninitialized: [{
                republic: null,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: null,
                    rejoining: 1,
                    id: '1',
                    government: { majority: [], minority: [] }
                }]
            }],
            recoverable: [{
                republic: 2,
                recoverable: true,
                colleagues: [{
                    island: 'island',
                    startedAt: 0,
                    republic: 2,
                    id: '2',
                    government: { majority: [ '2' ], minority: [] }
                }]
            }],
            unrecoverable: []
        }
    }), {
        island: null,
    }, 'join with wrong rejoining')
}
