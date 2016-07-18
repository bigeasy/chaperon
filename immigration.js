var Monotonic = require('monotonic')

module.exports = function (colleagues) {
    var islandId = colleagues.filter(function (colleague) {
        return colleague.islandId != null
    }).map(function (colleague) {
        return colleague.islandId
    }).sort(function (a, b) {
        return +a - +b
    }).pop()
    var islanders = colleagues.filter(function (colleague) {
        return colleague.islandId == islandId
    })
    var leaderId = islanders.filter(function (colleague) {
        return colleague.promise != '0/0'
    }).sort(function (a, b) {
        return Monotonic.compare(a.promise, b.promise)
    }).pop().leader
    var leader = islanders.filter(function (colleague) {
        return colleague.colleagueId == leaderId
    }).pop()
    var immigrants = leader == null ? [] : colleagues.filter(function (colleague) {
        return colleague.islandId != islandId
    })
    return { leader: leader, immigrants: immigrants }
}
