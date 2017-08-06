module.exports = {
    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
    },

    streaming: {
        interval: parseInt(process.env.STREAMING_INTERVAL) || 30,
    },

    redis: {
        url: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
        key_prefix: process.env.REDIS_KEY_PREFIX || '',
    }
};