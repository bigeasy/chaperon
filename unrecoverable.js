var Monotonic = require('monotonic')
var assert = require('assert')

module.exports = function (colleagues) {
    assert(colleagues.length, 'colleagues required')
    var islandId = colleagues.filter(function (colleague) {
// TODO: Seems like a bad condition, report unhealthy until naturalized.
        return colleague.islandId != null
            && colleague.promise != '0/0'
    }).map(function (colleague) {
        return colleague.islandId
    }).sort(function (a, b) {
        return +a - +b
    }).pop()
    if (islandId == null) {
        return true
    }
    var islanders = colleagues.filter(function (colleague) {
        return colleague.islandId == islandId
            && colleague.promise != '0/0'
    })
    var parliament = islanders.sort(function (a, b) {
        return Monotonic.compare(b.promise, a.promise)
    })[0].parliament
    return islanders.filter(function (colleague) {
        return ~parliament.indexOf(colleague.colleagueId)
    }).length < Math.ceil(parliament.length / 2)
}
