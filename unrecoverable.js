var Monotonic = require('monotonic')

module.exports = function (machines) {
    if (machines.length == 0) {
        return false
    }
    var islandId = machines.filter(function (machine) {
        return machine.islandId != null
    }).map(function (machine) {
        return machine.islandId
    }).sort(function (a, b) {
        return +a - +b
    }).pop()
    if (islandId == null) {
        return true
    }
    var islanders = machines.filter(function (machine) {
        return machine.islandId == islandId
    })
    var goverment = islanders.map(function (machine) {
        return machine.goverment
    }).sort(function (a, b) {
        return Monotonic.compare(a.promise, b.promise)
    }).pop()
    var parliament = goverment.majority.concat(goverment.minority)
    return islanders.filter(function (machine) {
        return ~parliament.indexOf(machine.legislatorId)
    }).length < Math.ceil(parliament.length / 2)
}
