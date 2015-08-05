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

client.keys("USDARS:lanacion:*", function (error, keys) {
    console.log("Keys obtained, starting...");

    keys.sort();

    var fixed_close = {};

    async.mapSeries(
        keys,
        function (key, callback) {
            if (key.endsWith(":last")) {
                return callback(null, null);
            }
            client.get(key, function (error, value) {
                var fix = null;
                object = JSON.parse(value);
                for (var x in {"bid":"", "ask":""}) {
                    if (object[x].open === null &&
                        object[x].close === null &&
                        (object[x].low === 0 || object[x].low === null) &&
                        (object[x].high === 0 || object[x].high === null)) {
                        continue;
                    }

                    if (object[x].open === 0) {
                        console.log("Found a zero open", x, "\n  ", key, "\n  ", value);
                        if (fixed_close[x]) {
                            object[x].open = fixed_close[x];
                            fixed_close[x] = null;
                            fix = object;
                        }
                    }
                    if (object[x].close === 0) {
                        console.log("Found a zero close", x, "\n  ", key, "\n  ", value);
                        if (object[x].open) {
                            object[x].close = object[x].open;
                            fixed_close[x] = object[x].open;
                            fix = object;
                        }
                    }
                    if (object[x].open === null && object[x].close > 0) {
                        object[x].open = object[x].close;
                        fix = object;
                    }
                    if (object[x].high < Math.max(object[x].open, object[x].close)) {
                        console.log("Found an invalid high", x, "\n  ", key, "\n  ", value);
                        if (object[x].open && object[x].close) {
                            object[x].high = Math.max(object[x].open, object[x].close);
                            fix = object;
                        }
                    }
                    if (object[x].high === 0) {
                        console.log("Found a zero high", x, "\n  ", key, "\n  ", value);
                        if (object[x].open && object[x].close) {
                            object[x].high = Math.max(object[x].open, object[x].close);
                            fix = object;
                        }
                    }
                    if (object[x].low === 0) {
                        console.log("Found a zero low", x, "\n  ", key, "\n  ", value);
                        if (object[x].open && object[x].close) {
                            object[x].low = Math.min(object[x].open, object[x].close);
                            fix = object;
                        }
                    }
                }
                if (fix) {
                    console.log("Fixing with\n  ", key, "\n  ", JSON.stringify(object), "\n");
                    client.set(key, JSON.stringify(object), function (error, res) {
                        callback(error, value);
                    });
                } else {
                    callback(error, value);
                }
            });
        },
        function (err, results) {
            console.log("Finished!");
            process.exit(0);
        }
    );
});
