var cadence = require('cadence')
var logger = require('prolific').createLogger('bigeasy.reinstate')
var unrecoverable = require('./unrecoverable')
var immigration = require('./immigration')

function Monitor (ua, uptime) {
    this._ua = ua
    this._uptime = uptime
}

// If we have been stable in machine count and availablity for more than thirty
// seconds, then if we have an unrecoverable Paxos island, let's reboot the
// consensus, otherwise look for machines that are not part of stable island..

Monitor.prototype.check = cadence(function (async) {
    async(function () {
        this._uptime.get(async())
    }, function (response) {
        if (response.uptime < 30000) {
            return [ false ]
        }
        if (unrecoverable(response.machines)) {
            var machines = response.machines.slice().sort(function (a, b) {
                return a.uptime - b.uptime
            })
            var leader = machines.pop(), islandId = Date.now()
            async(function () {
                this._ua.bootstrap(leader.location, islandId, async())
            }, function () {
                async.forEach(function (immigrant) {
                    this._ua.join(immigrant.location, leader.location, islandId, async())
                })(machines)
            }, function () {
                return [ true ]
            })
        } else {
            async(function () {
                var immigrate = immigration(response.machines), leader = immigrate.leader
                async.forEach(function (immigrant) {
                    this._ua.join(immigrant.location, leader.location, leader.islandId, async())
                })(immigrate.immigrants)
            }, function () {
                return [ true ]
            })
        }
    })
})

module.exports = Monitor
