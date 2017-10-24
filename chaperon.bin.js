#!/usr/bin/env node

/*

    ___ usage ___ en_US ___
    compassion colleague child <child options>

    options:

        -b, --bind <address:port>
            address and port to bind to

        -m, --mingle <url>
            discovery url

        -s, --stable <url>
            how long ot wait to determine that the collection of hosts is stable

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

    var logger = require('prolific.logger').createLogger('chaperon')

    var shuttle = Shuttle.shuttle(program, logger)

    var destructible = new Destructible('chaperon')

    program.on('shutdown', destructible.destroy.bind(destructible))

    program.helpIf(program.ultimate.help)
    program.required('mingle', 'bind')
    program.validate(require('arguable/bindable'), 'bind')

    var bind = program.ultimate.bind

    var Isochronous = require('isochronous')
    var Vizsla = require('vizsla')
    var Chaperon = require('./chaperon')
    var Colleagues = require('./colleagues')

    var destroyer = require('server-destroy')

    var colleagues = new Colleagues({
        ua: new Vizsla,
        mingle: program.ultimate.mingle
    })

    var chaperon = new Chaperon({
        colleagues: colleagues,
        stableAfter: (+(program.ultimate.stable) || 30) * 1000
    })

    var isochronous = new Isochronous(chaperon, 'health', { interval: 30000 })
    isochronous.run(abend)

    destructible.addDestructor('isochronous', isochronous, 'stop')
    destructible.addDestructor('shuttle', shuttle, 'close')


    var server = http.createServer(chaperon.reactor.middleware)
    destroyer(server)
    async(function () {
        server.listen(bind.port, bind.address, async())
    }, function () {
        logger.info('started', { parameters: program.ultimate, $vargs: program.vargs })
        destructible.addDestructor('http', server, 'destroy')
        delta(async()).ee(server).on('close')
        program.ready.unlatch()
    })
}))
