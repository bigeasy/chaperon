var concat = [].concat

module.exports = function (response) {
    console.log(require('util').inspect(response, { depth: null }))
    var colleagues = concat.apply([], response.mingle.machines.map(function (machine) {
        return machine.health.colleagues.map(function (colleague) {
            var key = '[' + colleague.islandName + ']' + colleague.colleagueId
            var health = response.colleagues[key]
            var promise = null, leader = null, islandId = null, parliament = null, uptime = null
            if (health != null) {
                islandId = health.islandId
                uptime = health.uptime
                var government = health.government
                if (government != null) {
                    promise = government.promise
                    leader = government.majority[0] || null
                    parliament = government.majority.concat(government.minority)
                }
            }
            return {
                location: machine.location,
                key: key,
                uptime: uptime,
                islandName: colleague.islandName,
                colleagueId: colleague.colleagueId,
                islandId: islandId,
                promise: promise,
                leader: leader,
                parliament: parliament
            }
        })
    }))
    var outcome = colleagues.map(function (colleague) {
        return colleague.islandName
    }).filter(function (islandNames, index, set) {
        return set.indexOf(islandNames) == index
    }).map(function (islandName) {
        return {
            name: islandName,
            colleagues: colleagues.filter(function (colleague) {
                return colleague.islandName == islandName
            }).sort(function (a, b) {
                return b.uptime - a.uptime
            })
        }
    })
    console.log(require('util').inspect(outcome, { depth: null }))
    return outcome
}
