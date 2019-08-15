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

client.keys("USDARS:santander:*", function (error, keys) {
    console.log("Keys obtained, starting...");

    keys.sort();

    var fixed_close = {};

    async.mapSeries(
        keys,
        function (key, callback) {
            client.get(key, function (error, value) {
                console.log("Analyzing\n  ", key, "\n  ", value);
        
                object = JSON.parse(value);

                var fix = null;

                if (key.endsWith(":last")) {
                    fix = fix_last(object);
                } else {
                    fix = fix_daily(object, fixed_close);
                }

                if (fix) {
                    console.log("  !! Fixing with\n  ", JSON.stringify(object), "\n");
                    client.set(key, JSON.stringify(object), function (error, res) {
                        callback(error, value);
                    });
                } else {
                    console.log("  - Data is ok");
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

function fix_daily(object, fixed_close) {
    var fix = null;

    for (var x in {"bid":"", "ask":""}) {
        if (object[x].open === null &&
            object[x].close === null &&
            (object[x].low === 0 || object[x].low === null) &&
            (object[x].high === 0 || object[x].high === null)) {
            continue;
        }

        if (object[x].open === 0) {
            console.log("   * Found a zero open", x);
            if (fixed_close[x]) {
                object[x].open = fixed_close[x];
                fixed_close[x] = null;
                fix = object;
            }
        }
        if (object[x].close === 0) {
            console.log("   * Found a zero close", x);
            if (object[x].open) {
                object[x].close = object[x].open;
                fixed_close[x] = object[x].open;
                fix = object;
            }
        }
        if (object[x].open === null && object[x].close > 0) {
            console.log("   * Found an invalid open", x);
            object[x].open = object[x].close;
            fix = object;
        }
        if (object[x].close === null && object[x].open > 0) {
            console.log("   * Found an invalid close", x);
            object[x].close = object[x].open;
            fix = object;
        }
        if ((object[x].high < Math.max(object[x].open, object[x].close)) ||
            (object[x].high === 0))  {
            console.log("   * Found an invalid high", x);
            if (object[x].open && object[x].close) {
                object[x].high = Math.max(object[x].open, object[x].close);
                fix = object;
            } else if (object[x].open) {
                object[x].high = object[x].open;
                fix = object;
            }
        }
        if ((object[x].low < Math.min(object[x].open, object[x].close)) ||
            (object[x].low === 0))  {
            console.log("   * Found an invalid low", x);
            if (object[x].open && object[x].close) {
                object[x].low = Math.min(object[x].open, object[x].close);
                fix = object;
            } else if (object[x].open) {
                object[x].low = object[x].open;
                fix = object;
            }
        }
    }

    return fix;
}

function fix_last(object) {
    var fix = null;

    for (var x in {"bid":"", "ask":""}) {
        fix = fix_daily(object.daily);

        if (fix) {
            object.daily = fix;
        }

        if (object.spot[x] === null && object.daily[x].close > 0) {
            console.log("   * Found an invalid", x);
            object.spot[x] = object.daily[x].close;
            fix = object;
        }
    }

    return fix;
}