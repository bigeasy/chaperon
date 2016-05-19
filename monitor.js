function Monitor (options, uptime) {
    this._Date = options.Date
    this._ua = options.ua
    this._uptime = uptime
    // this._uptime = new Uptime(options.uptimeUrl, options.healthPath)
}

// If we have been stable in machine count and availablity for more than thirty
// seconds, then if we have an unrecoverable Paxos space, let's reboot the
// consensus.

// TODO What do you do if you cannot invoke bootstrap? Wait?
// TODO Isochronous will not run two at the same time, right?
Monitor.prototype.check = cadence(function (async, uptime) {
    async(function () {
        uptime.get(url, async())
    }, function (response) {
        if (response.uptime < 30000 || !unrecoverable(response.machines)) {
            return
        }
        var machines = response.machines.slice().sort(function (a, b) {
            return a.uptime - b.uptime
        })
        var bootstrapper = machines.pop()
        async(function () {
            this._ua.bootstrap(bootstrapper.url, this._Date.now(), async())
        }, function () {
            async.forEach(function (machine) {
                this._ua.bootstrap(bootstrapper.url, this._Date.now(), async())
            })(machines)
        })
    }, function () {
        return []
    })
})
