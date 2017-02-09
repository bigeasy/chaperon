require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var bin = require('../chaperon.bin')
    var io
    async(function () {
        io = bin({
            mingle: 'http://127.0.0.1:8686',
            conduit: 'http://%/health',
            colleague: 'http://%s%s/health',
            bind: '8088'
        }, async())
    }, function () {
        assert(true, 'started')
        io.emit('SIGTERM')
    })
}
