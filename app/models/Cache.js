var config = require('../../config/config'),
    InternalCache = require('./InternalCache.js'),
    RedisCache = require('./RedisCache.js');

function Cache() {}

Cache.instance = null;

Cache.getInstance = function () {
    if (!Cache.instance) {
        Cache.instance = new ({
            'internal' : InternalCache,
            'redis' : RedisCache
        }[config.cache.type])(config.cache.ttl);
    }

    return Cache.instance;
};

Cache.deleteInstance = function () {
    if (Cache.instance) {
        Cache.instance = null;
    }
};

module.exports = Cache;