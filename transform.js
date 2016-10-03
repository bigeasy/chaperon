module.exports = function (response) {
    var colleagues = [].concat.apply([], response.mingle.machines.map(function (machine) {
        return machine.health ? machine.health.colleagues.map(function (colleague) {
            var key = '[' + colleague.islandName + ']' + colleague.colleagueId
            var health = response.colleagues[key]
            var promise = null, islandId = null, parliament = [], startedAt = null
            if (health != null) {
                islandId = health.islandId
                startedAt = health.startedAt
                var government = health.government
                if (government != null) {
                    promise = government.promise
                    parliament = government.majority.concat(government.minority)
                }
            }
            return {
                location: machine.location,
                key: key,
                startedAt: startedAt,
                islandName: colleague.islandName,
                colleagueId: colleague.colleagueId,
                islandId: islandId,
                promise: promise,
                parliament: parliament
            }
        }) : []
    }))
    return colleagues
}
