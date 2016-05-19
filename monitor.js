var cadence = require('cadence')

function Monitor (options, uptime) {
    this._ua = options.ua
    this._uptime = uptime
}

// If we have been stable in machine count and availablity for more than thirty
// seconds, then if we have an unrecoverable Paxos island, let's reboot the
// consensus, otherwise look for machines that are not part of stable island..

Monitor.prototype._check = cadence(function (async, uptime) {
    async([function () {
        async(function () {
            uptime.get(url, async())
        }, function (response) {
            if (response.uptime < 30000) {
                return
            }
            if (unrecoverable(response.machines)) {
                var machines = response.machines.slice().sort(function (a, b) {
                    return a.uptime - b.uptime
                })
                var leader = machines.pop(), islandId = Date.now()
                async(function () {
                    this._ua.bootstrap(leader.url, islandId, async())
                }, function () {
                    async.forEach(function (immigrant) {
                        this._ua.join(immigrant.url, leader.url, islandId, async())
                    })(machines)
                })
            } else {
                var immigrate = immigration(response.machines), leader = immigrate.leader
                async.forEach(function (immigrant) {
                    this._ua.join(immigrant.url, leader.url, leader.islandId, async())
                })(immigrate.immigrants)
            }
        }, function () {
            return []
        })
    }, function (error) {
        logger.error('check', { stack: error.stack })
    }])
})

Monitor.prototype.check = cadence(function (async) {
    this._check(this._uptime, async())
})

module.exports = Monitor
