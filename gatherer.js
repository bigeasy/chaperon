// Return the first not null-like value.
var coalesce = require('extant')

// Determine when the population has settled down.
var Uptime = require('mingle.uptime')

// Most-recently used cache.
var Cache = require('magazine')

var recoverable = require('./recoverable')

function Gatherer (options) {
    options = coalesce(options, {})
    this._uptimes = new Cache().createMagazine()
    this._Date = coalesce(options.Date, Date)
    this._stableAfter = options.stableAfter
}

function group (groupBy, collection, list) {
    var groups = {}, array = []
    list.forEach(function (element) {
        var group = array.filter(function (group) {
            return group[groupBy] == element[groupBy]
        }).shift()
        if (!group) {
            group = {}
            group[groupBy] = element[groupBy]
            group[collection] = []
            array.push(group)
        }
        group[collection].push(element)
    })
    groups.array = array
    groups.map = {}
    groups.null = null
    groups.array.forEach(function (group) {
        if (group[groupBy] == null) {
            groups.null = group
        } else {
            groups.map[group[groupBy]] = group
        }
    }, groups)
    return groups
}

Gatherer.prototype.gather = function (colleagues) {
    var islands = group('island', 'colleagues', colleagues).map
    var gathered = {}
    // Deterimine the actions for each island.
    for (var islandName in islands) {
        var island = islands[islandName]
        gathered[islandName] = {
            name: islandName,
            stable: false,
            okay: true,
            uninitialized: null,
            recoverable: null,
            unrecoverable: null
        }
        // See if the colleagues that make up this island have stabilized.
        var uptime = this._uptimes.get(island.island, new Uptime({ Date: this._Date }))
        if (uptime.calculate(island.colleagues) < this._stableAfter) {
            continue
        }
        gathered[islandName].stable = true
        var republics = group('republic', 'colleagues', island.colleagues).array
        gathered[islandName].uninitialized = republics.filter(function (republic) {
            return republic.republic == null
        })
        var republics = republics.filter(function (republic) {
            return republic.republic != null
        })
        // We're going to assume that we would not have started a new republic
        // if the old was had become unrecoverable. Could be a chance that we
        // actually have two functioning republics, so we'd want to make log
        // this state since it is split brain. I've not seen it in the wild yet
        // so I'm not overly converned about it at the moment.
        gathered[islandName].recoverable = republics.filter(function (republic) {
            return republic.recoverable = recoverable(republic.colleagues)
        })
        gathered[islandName].unrecoverable = republics.filter(function (republic) {
            return ! republic.recoverable
        })
    }
    this._uptimes.expire(1000 * 60 * 15)
    return gathered
}

module.exports = Gatherer
