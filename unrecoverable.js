var Monotonic = require('monotonic')

module.exports = function (island) {
    var islandId = island.colleagues.filter(function (colleague) {
        return colleague.health.islandId != null
    }).map(function (colleague) {
        return colleague.health.islandId
    }).sort(function (a, b) {
        return +a - +b
    }).pop()
    if (islandId == null) {
        return true
    }
    var islanders = island.colleagues.filter(function (colleague) {
        return colleague.health.islandId == islandId
    })
    console.log(islanders)
    var goverment = islanders.map(function (colleague) {
        return colleague.health.government
    }).sort(function (a, b) {
        return Monotonic.compare(a.promise, b.promise)
    }).pop()
    var parliament = goverment.majority.concat(goverment.minority)
    return islanders.filter(function (colleague) {
        return ~parliament.indexOf(colleague.health.legislatorId)
    }).length < Math.ceil(parliament.length / 2)
}
