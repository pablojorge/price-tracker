var redis = require('redis'),
    url = require('url'),

    redisURL = url.parse(process.env.REDISCLOUD_URL),
    client = redis.createClient(redisURL.port, 
                                redisURL.hostname, 
                                {no_ready_check: true});

client.auth(redisURL.auth.split(':')[1]);

client.keys("*:last", function (error, keys) {
    keys.forEach(function(key) {
        client.get(key, function (error, value) {
            console.log("  '%s', %s", key, value);
        });
    });
});
