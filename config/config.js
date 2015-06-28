module.exports = {
    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
    },

    streaming: {
        interval: parseInt(process.env.STREAMING_INTERVAL),
    },

    redis: {
        url: process.env.REDISCLOUD_URL,
        key_prefix: process.env.REDIS_KEY_PREFIX || '',
    }
};