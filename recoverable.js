var Monotonic = require('monotonic')
var assert = require('assert')

module.exports = function (colleagues) {
    assert(colleagues.length, 'colleagues required')
    var republic = colleagues.filter(function (colleague) {
// TODO: Seems like a bad condition, report unhealthy until naturalized.
        return colleague.republic != null
            && colleague.promise != '0/0'
    }).map(function (colleague) {
        return colleague.republic
    }).sort(function (a, b) {
        return +a - +b
    }).pop()
    if (republic == null) {
        return false
    }
    var republicans = colleagues.filter(function (colleague) {
        return colleague.republic == republic
            && colleague.promise != '0/0'
    })
    var government = republicans.sort(function (a, b) {
        return Monotonic.compare(b.government.promise, a.government.promise)
    })[0].government
    var parliament = government.majority.concat(government.minority)
    return republicans.filter(function (colleague) {
        return ~parliament.indexOf(colleague.id)
    }).length >= Math.ceil(parliament.length / 2)
}
