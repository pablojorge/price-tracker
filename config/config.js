module.exports = {
    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
    },

    streaming: {
        interval: parseInt(process.env.STREAMING_INTERVAL),
    },

    cache: {
        type: process.env.CACHE,
        ttl: parseInt(process.env.CACHE_TTL),
    },

    redis: {
        url: process.env.REDISCLOUD_URL
    }
};