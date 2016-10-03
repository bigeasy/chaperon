require('proof/redux')(13, prove)

function prove (assert) {
    var Chaperon = require('../chaperon')
    var transform = require('../transform')
    var chaperon = new Chaperon(null, 'http://%s', null)
    var recoverable = require('./recoverable')
    var pending = require('./pending')
    var colleague = {
        islandName: 'island',
        islandId: null,
        colleagueId: 'colleague-5'
    }
    function createIsland (defaults, start, stop, setIslandId) {
        var recoverable = []
        for (var i = start; i < stop; i++) {
            var colleague = {
                location: '10.2.91.' + i + ':8486',
                startedAt: (1475020 + i) * 1000,
                key: '[island]colleague-' + i,
                islandName: 'island',
                colleagueId: 'colleague-' + i,
                islandId: null,
                promise: '0/0',
                parliament: []
            }
            for (var key in defaults) {
                colleague[key] = defaults[key]
            }
            recoverable.push(colleague)
        }
        if (setIslandId) {
            var islandId = recoverable.slice().sort(function (a, b) {
                return a.startedAt - b.startedAt
            })[0].startedAt
            recoverable.forEach(function (colleague) {
                colleague.islandId = islandId
            })
        }
        return recoverable
    }
    var recoverable = createIsland({
        promise: '4/0',
        parliament: [ 'colleague-1', 'colleague-2', 'colleague-3' ]
    }, 0, 5, true)
    assert(chaperon._maybeAction(recoverable, colleague, 0), {
        name: 'unstable', vargs: []
    }, 'unstable')
    assert(chaperon._maybeAction(recoverable, colleague, 1000), {
        name: 'unreachable', vargs: []
    }, 'stable')
    var colleagues = recoverable.concat(createIsland({}, 5, 6))
    colleagues[5].startedAt = null
    assert(chaperon._action(colleagues, colleague), {
        name: 'unreachable', vargs: []
    }, 'health unreachable')
    var colleagues = recoverable.concat(createIsland({}, 5, 6), createIsland({}, 5, 6))
    assert(chaperon._action(colleagues, colleague),
    { name: 'duplicates',
      vargs:
       [ [ { location: '10.2.91.5:8486',
             startedAt: 1475025000,
             key: '[island]colleague-5',
             islandName: 'island',
             colleagueId: 'colleague-5',
             islandId: null,
             promise: '0/0',
             parliament: [] },
           { location: '10.2.91.5:8486',
             startedAt: 1475025000,
             key: '[island]colleague-5',
             islandName: 'island',
             colleagueId: 'colleague-5',
             islandId: null,
             promise: '0/0',
             parliament: [] } ] ]
    }, 'duplicates')
    colleagues.pop()
    colleagues[5].startedAt = colleagues[4].startedAt + 1
    assert(chaperon._action(colleagues, colleague), {
        name: 'join',
        vargs: [{
            location: '10.2.91.1:8486',
            islandId: 1475020000,
            islandName: 'island',
            colleagueId: 'colleague-1'
        }]
    }, 'join')
    assert(chaperon._action(colleagues, colleagues[0]), {
        name: 'recoverable', vargs: []
    }, 'recoverable')
    var unrecoverable = createIsland({
        promise: '4/0',
        parliament: [ 'colleague-4', 'colleague-5', 'colleague-6' ]
    }, 0, 5, true)
    assert(chaperon._action(unrecoverable, unrecoverable[0]), {
        name: 'unrecoverable', vargs: []
    }, 'unrecoverable')
    function colleagueId (colleague) {
        return colleague.colleagueId
    }
    var splitBrain = createIsland({
            promise: '4/0',
            parliament: [ 'colleague-1', 'colleague-2', 'colleague-3' ]
        }, 0, 5, true)
        .concat(createIsland({
            promise: '4/0',
            parliament: [ 'colleague-6', 'colleague-7', 'colleague-8' ]
        }, 5, 10, true))
        .concat(createIsland({}, 10, 11))
    assert(chaperon._action(splitBrain, splitBrain[10]), { name: 'splitBrain', vargs: [] }, 'join split brain')
    assert(chaperon._action(splitBrain, splitBrain[0]), { name: 'splitBrain', vargs: [] }, 'participate split brain')
    splitBrain = splitBrain.concat(createIsland({
        promise: '4/0',
        parliament: [ 'colleague-20', 'colleague-21', 'colleague-22' ]
    }, 11, 13, true))
    assert(chaperon._action(splitBrain, splitBrain[11]), {
        name: 'unrecoverable', vargs: []
    }, 'not in split brain')
    var pending = createIsland({}, 0, 5)
    assert(chaperon._action(pending.slice().reverse(), pending[0]), {
        name: 'bootstrap', vargs: []
    }, 'bootstrap')
    assert(chaperon._action(pending, pending[1]), {
        name: 'unstable', vargs: []
    }, 'pending join')
    // This caught an error where I was popping the participant from an array
    // with the latest version in order to get the latest government, then
    // trying to find the leader's entry when it was the only entry in the array
    // that had just been popped.
    assert(chaperon._action([{
        "location":"127.0.0.1:8486",
        "key":"[island]1",
        "startedAt":1475160795422,
        "islandName":"island",
        "colleagueId":"1",
        "islandId":1475160795422,
        "promise":"1/0",
        "parliament":["1"]
    }, {
        "location":"127.0.0.1:8486",
        "key":"[island]2",
        "startedAt":1475161181144,
        "islandName":"island",
        "colleagueId":"2",
        "islandId":null,
        "promise":"0/0",
        "parliament":[]
    }], {
        "colleagueId":"2",
        "islandName":"island",
        "islandId":null,
        "startedAt":1475161181144
    }), {
        name: 'join',
        vargs: [{
            location: '127.0.0.1:8486',
            islandId: 1475160795422,
            islandName: 'island',
            colleagueId: '1'
        }]
    }, 'another join')
}
