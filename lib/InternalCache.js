var messages = require('../public/lib/messages.js');

/**
 */
function InternalCache(ttl) {
    this.ttl = ttl;
    this.entries = {};
}

InternalCache.prototype.setEntry = function (entry, value) {
    this.entries[entry] = {
        timestamp: new Date(),
        age: function() {
            return ((new Date()) - this.timestamp) / 1000;
        },
        value: value.toString(),
    };
    return value;
};

InternalCache.prototype.getEntry = function (entry, callback) {
    cached = this.entries[entry];

    if (cached !== undefined) {
        if (cached.age() > this.ttl) {
            delete this.entries[entry];
            callback(undefined, null);
        }
        callback(undefined, messages.Response.fromString(cached.value));
    } else {
        callback(undefined, null);
    }
};

module.exports = InternalCache;