var Monotonic = require('monotonic')

module.exports = function (machines) {
    var islandId = machines.filter(function (machine) {
        return machine.islandId != null
    }).map(function (machine) {
        return machine.islandId
    }).sort(function (a, b) {
        return +a - +b
    }).pop()
    var islanders = machines.filter(function (machine) {
        return machine.islandId == islandId
    })
    var leaderId = islanders.map(function (machine) {
        return machine.goverment
    }).sort(function (a, b) {
        return Monotonic.compare(a.promise, b.promise)
    }).pop().majority[0]
    return {
        immigrants: machines.filter(function (machine) {
            return machine.islandId != islandId
        }),
        leader: islanders.filter(function (machine) {
            return machine.legislatorId == leaderId
        }).pop()
    }
}
