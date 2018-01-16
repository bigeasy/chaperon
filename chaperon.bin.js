#!/usr/bin/env node

/*

    ___ usage ___ en_US ___
    compassion colleague child <child options>

    options:

        -b, --bind <address:port>
            address and port to bind to

        -m, --mingle <url>
            discovery url

        -s, --stable <seconds>
            how long to wait to determine that the collection of hosts is stable

        -i, --interval <seconds>
            how often to query the population

        --help
            display help message

    ___ $ ___ en_US ___

        bind is required:
            the `--bind` argument is a required argument

        name is required:
            the `--name` argument is a required argument
    ___ . ___

 */
require('arguable')(module, require('cadence')(function (async, program) {
    var http = require('http')

    var Destructible = require('destructible')

    var Shuttle = require('prolific.shuttle')
    var abend = require('abend')
    var http = require('http')
    var delta = require('delta')
    var coalesce = require('extant')

    var logger = require('prolific.logger').createLogger('chaperon')

    var shuttle = Shuttle.shuttle(program, logger)

    var destructible = new Destructible('chaperon')

    program.on('shutdown', destructible.destroy.bind(destructible))

    program.helpIf(program.ultimate.help)
    program.required('mingle', 'bind')
    program.validate(require('arguable/bindable'), 'bind')

    var bind = program.ultimate.bind

    var Vizsla = require('vizsla')
    var Gatherer = require('./gatherer')
    var Colleagues = require('./colleagues')
    var Middleware = require('./middleware')

    var Actuator = require('./actuator')
    var actuator = new Actuator(new Vizsla())

    var destroyer = require('server-destroy')

    var colleagues = new Colleagues({
        ua: new Vizsla,
        mingle: program.ultimate.mingle
    })

    var gatherer = new Gatherer({
        stableAfter: coalesce(program.ultimate.stable, 30) * 1000
    })

    destructible.addDestructor('shuttle', shuttle, 'close')

    var middleware = new Middleware({
        colleagues: colleagues,
        gatherer: gatherer,
        actuator: actuator
    })

    var Isochronous = require('isochronous')

    var interval = coalesce(+program.ultimate.interval, 5) * 1000
    var isochronous = new Isochronous(middleware, 'probe', 1000)
    destructible.addDestructor('isochronous', isochronous, 'stop')

    isochronous.run(destructible.monitor('isochronous'))

    var server = http.createServer(middleware.reactor.middleware)
    destroyer(server)
    async(function () {
        server.listen(bind.port, bind.address, async())
    }, function () {
        logger.info('started', { parameters: program.ultimate, $vargs: program.vargs })
        destructible.addDestructor('http', server, 'destroy')
        delta(destructible.monitor('server')).ee(server).on('close')
        program.ready.unlatch()
    }, function () {
        destructible.completed.wait(async())
    })
}))
