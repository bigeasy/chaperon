#!/usr/bin/env node

/*

    ___ usage ___ en_US ___
    compassion colleague child <child options>

    options:

        -d, --discovery <url>
            discovery url

        -c, --colleagues <url>
            colleagues url pattern

        -H, --health <url pattern>
            health url pattern

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

    var logger = require('prolific.logger').createLogger('bigeasy.reinstate.bin')

    Shuttle.shuttle(program, 1000, logger)

    program.helpIf(program.ultimate.help)
    program.required('discovery', 'health')

    var Vizsla = require('vizsla')
    var Monitor = require('./monitor')
    var Uptime = require('mingle.uptime')
    var uptime = new Uptime(program.ultimate.discovery, program.ultimate.colleagues, new Vizsla)
    var monitor = new Monitor(new Vizsla, 'http://%s', uptime, program.ultimate.health)

    var Isochronous = require('isochronous')
    var isochronous = new Isochronous({
        operation: { object: monitor, method: 'check' },
        interval: 1000
    })
    isochronous.run(abend)

    process.on('shutdown', isochronous.stop.bind(isochronous))

    logger.info('started')
}))
