var messages = require('../common/messages.js');

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

/**
 */
function RedisCache(ttl, options) {
    var redisURL = url.parse(options.rediscloud_url),
        client = redis.createClient(redisURL.port, 
                                    redisURL.hostname, 
                                    {no_ready_check: true});

    client.auth(redisURL.auth.split(':')[1]);
    console.log("connected to " + redisURL.hostname);

    this.ttl = ttl;
    this.client = client;
}

RedisCache.prototype.setEntry = function (entry, value) {
    this.client.set(entry, value.toString());
    this.client.expire(entry, this.ttl);
    return value;
};

RedisCache.prototype.getEntry = function (entry, callback) {
    this.client.get(entry, function (error, value) {
        callback(error, messages.Response.fromString(value));                
    });
};

module.exports = InternalCache;