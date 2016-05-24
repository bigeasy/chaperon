var Monotonic = require('monotonic')

module.exports = function (colleagues) {
    var islandId = colleagues.filter(function (colleague) {
        return colleague.health != null && colleague.health.islandId != null
    }).map(function (colleague) {
        return colleague.health.islandId
    }).sort(function (a, b) {
        return +a - +b
    }).pop()
    var islanders = colleagues.filter(function (colleague) {
        return colleague.health.islandId == islandId
    })
    var leaderId = islanders.map(function (colleague) {
        return colleague.health.government
    }).sort(function (a, b) {
        return Monotonic.compare(a.promise, b.promise)
    }).pop().majority[0]
    return {
        immigrants: colleagues.filter(function (colleague) {
            return colleague.health.islandId != islandId
        }),
        leader: islanders.filter(function (colleague) {
            return colleague.health.legislatorId == leaderId
        }).pop()
    }
}
