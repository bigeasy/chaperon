#!/usr/bin/env node

/*

    ___ usage ___ en_US ___
    compassion colleague child <child options>

    options:

        -b, --bind <address:port>
            address and port to bind to

        -m, --mingle <url>
            discovery url

        -c, --conduit <url>
            conduit health url pattern

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

    var Shuttle = require('prolific.shuttle')
    var abend = require('abend')
    var http = require('http')

    var logger = require('prolific.logger').createLogger('chaperon')

    var shuttle = Shuttle.shuttle(program, logger)

    program.helpIf(program.ultimate.help)
    program.required('mingle', 'conduit', 'bind')
    program.validate(require('arguable/bindable'), 'bind')

    var bind = program.ultimate.bind

    var Isochronous = require('isochronous')
    var Vizsla = require('vizsla')
    var Chaperon = require('./chaperon')
    var Colleagues = require('./colleagues')

    var destroyer = require('server-destroy')

    var colleagues = new Colleagues({
        ua: new Vizsla,
        mingle: program.ultimate.mingle,
        conduit: program.ultimate.conduit
    })

    var chaperon = new Chaperon({
        colleagues: colleagues,
        stableAfter: 30 * 1000
    })

    var isochronous = new Isochronous({
        operation: { object: chaperon, method: 'health' },
        interval: 30000
    })
    isochronous.run(abend)

    program.on('shutdown', isochronous.stop.bind(isochronous))
    program.on('shutdown', shuttle.close.bind(shuttle))

    logger.info('started', { parameters: program.ultimate, $vargs: program.vargs })

    var server = http.createServer(chaperon.dispatcher.createWrappedDispatcher())
    destroyer(server)
    server.listen(bind.port, bind.address, async())
    program.on('shutdown', server.destroy.bind(server))
}))
