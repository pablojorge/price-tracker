var redis = require('redis'),
    url = require('url'),

    redisURL = url.parse(process.env.REDISCLOUD_URL),
    client = redis.createClient(redisURL.port, 
                                redisURL.hostname, 
                                {no_ready_check: true});

client.auth(redisURL.auth.split(':')[1])

client.keys("*", function (error, reply) {
    console.log("Keys:");

    for (index in reply) {
        key = reply[index];
        client.ttl(key, function (key) {
            return function (error, reply) {
                console.log("  '%s', ttl: %d", key, reply);
            }
        }(key));
    }

    client.flushdb(function (error, reply) {
        console.log("DB flushed");
        process.exit()
    });
});


