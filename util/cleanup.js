var redis = require('redis'),
    url = require('url'),
    async = require('async'),

    redisURL = url.parse(process.env.REDISCLOUD_URL),
    client = redis.createClient(redisURL.port,
                                redisURL.hostname,
                                {no_ready_check: true});

String.prototype.endsWith = function (str) {
    return this.indexOf(str) === this.length - str.length;
};

client.auth(redisURL.auth.split(':')[1]);

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " PATTERN [\"delete\"]");
    process.exit(-1);
}

client.keys("*" + process.argv[2] + "*", function (error, keys) {
    console.log(keys.length + " keys obtained: \n", keys);

    async.mapSeries(
        keys,
        function (key, callback) {
            if (process.argv[3] == "delete") {
                console.log("Deleting", key);
                client.del(key, function (error, res) {
                    callback(error, res);
                });
            } else {
                callback(null, '');
            }
        },
        function (err, results) {
            console.log("Finished!");
            process.exit(0);
        }
    );
});
