var Monotonic = require('monotonic')
var assert = require('assert')

module.exports = function (colleagues) {
    assert(colleagues.length, 'colleagues required')
    var islandId = colleagues.filter(function (colleague) {
// TODO: Seems like a bad condition, report unhealthy until naturalized.
        return colleague.health.islandId != null
            && colleague.health.government.promise != '0/0'
    }).map(function (colleague) {
        return colleague.health.islandId
    }).sort(function (a, b) {
        return +a - +b
    }).pop()
    if (islandId == null) {
        return true
    }
    var islanders = colleagues.filter(function (colleague) {
        return colleague.health.islandId == islandId
    })
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
