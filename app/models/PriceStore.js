var redis = require('redis'),
    url = require('url'),
    config = require('../../config/config');

function to_hour_key(date) {
    var zp2 = function (n) { return ('0'+n).slice(-2); };

    return "".concat(date.getUTCFullYear(), ".",
                     zp2(date.getUTCMonth()+1), ".",
                     zp2(date.getUTCDate()), ".",
                     zp2(date.getUTCHours()));
}

function from_hour_key(key) {
    var tokens = key.split(".");
    var date = new Date(0);

    date.setUTCFullYear(parseInt(tokens[0]));
    date.setUTCMonth(parseInt(tokens[1])-1);
    date.setUTCDate(parseInt(tokens[2]));
    date.setUTCHours(parseInt(tokens[3]));

    return date;
}

function to_day_key(date) {
    var zp2 = function (n) { return ('0'+n).slice(-2); };

    return "".concat(date.getUTCFullYear(), ".",
                     zp2(date.getUTCMonth()+1), ".",
                     zp2(date.getUTCDate()));
}

function from_day_key(key) {
    var tokens = key.split(".");
    var date = new Date(0);

    date.setUTCFullYear(parseInt(tokens[0]));
    date.setUTCMonth(parseInt(tokens[1])-1);
    date.setUTCDate(parseInt(tokens[2]));

    return date;
}

/**
 */
function PriceStore() {
    var redisURL = url.parse(config.redis.url),
        client = redis.createClient(redisURL.port,
                                    redisURL.hostname,
                                    {no_ready_check: true});

    client.auth(redisURL.auth.split(':')[1]);
    console.log("PriceStore: connected to " + redisURL.hostname);

    this.client = client;
    this.interval = config.streaming.interval;
}

PriceStore.instance = null;

PriceStore.getInstance = function () {
    if (!PriceStore.instance) {
        PriceStore.instance = new PriceStore();
    }

    return PriceStore.instance;
};

PriceStore.deleteInstance = function () {
    if (PriceStore.instance) {
        PriceStore.instance = null;
    }
};

PriceStore.prototype.lastKey = function(exchange, symbol) {
    return "".concat("last1:", symbol, ":", exchange);
};

PriceStore.prototype.seriesKey = function(exchange, symbol, freq, date) {
    return "".concat("series1:", symbol, ":", exchange, ":", freq, ":", date);
};

PriceStore.prototype.delta = function(last, next, date_func) {
    if (last === null) {
        return {
            date: date_func(next.updated_on),
            bid: {open: next.bid,
                  high: next.bid,
                  low: next.bid,
                  close: next.bid},
            ask: {open: next.ask,
                  high: next.ask,
                  low: next.ask,
                  close: next.ask},
        };
    } else if (last.date !== date_func(next.updated_on)) {
        return {
            date: date_func(next.updated_on),
            bid: {open: last.bid.close,
                  high: Math.max(last.bid.close, next.bid),
                  low: Math.min(last.bid.close, next.bid),
                  close: next.bid},
            ask: {open: last.ask.close,
                  high: Math.max(last.ask.close, next.ask),
                  low: Math.min(last.ask.close, next.ask),
                  close: next.ask},
        };
    } else {
        return {
            date: date_func(next.updated_on),
            bid: {open: last.bid.open,
                  high: Math.max(last.bid.high, next.bid),
                  low: Math.min(last.bid.low, next.bid),
                  close: next.bid},
            ask: {open: last.ask.open,
                  high: Math.max(last.ask.high, next.ask),
                  low: Math.min(last.ask.low, next.ask),
                  close: next.ask},
        };
    }
};

PriceStore.prototype.listener = function(error, response) {
    var self = this;

    if (error !== null) {
        console.log("PriceStore: WARNING ignoring error:", error);
        return;
    }

    var last_key = self.lastKey(response.data.exchange, response.data.symbol),
        hourly_key = self.seriesKey(
                        response.data.exchange,
                        response.data.symbol,
                        "hourly",
                        to_hour_key(response.data.updated_on)
                     ),
        daily_key = self.seriesKey(
                        response.data.exchange,
                        response.data.symbol,
                        "daily",
                        to_day_key(response.data.updated_on)
                     );

    self.client.get(last_key, function (error, last_val) {
        if (error) {
            console.log("PriceStore: ERROR getting", last_key, error);
        }

        var last = last_val ? JSON.parse(last_val) : null;

        var value = {
            spot: response.data,
            hourly: self.delta(last ? last.hourly : null, response.data, to_hour_key),
            daily: self.delta(last ? last.daily : null, response.data, to_day_key),
        };

        self.client.mset(last_key, JSON.stringify(value),
                         hourly_key, JSON.stringify(value.hourly),
                         daily_key, JSON.stringify(value.daily),
            function (error, ret) {
                if (error) {
                    console.log("PriceStore: ERROR saving", last_key, value, error);
                } else {
                    console.log("PriceStore: saved", last_key, hourly_key, daily_key, ":", ret);
                }
            }
        );
    });
};

PriceStore.prototype.getPrices = function(exchange, symbol, start, end, callback) {
    var self = this;

    var query = this.seriesKey(exchange, symbol, 'hourly', '*');

    this.client.keys(query, function (error, keys) {
        if (error)
            return callback(error);

        if(keys.length === 0)
            return callback(null, []);

        keys.sort();

        self.client.mget(keys, function (error, values) {
            if (error)
                return callback(error);

            callback(null, values.map(function (value) {
                value = JSON.parse(value);
                return {
                    date: from_hour_key(value.date),
                    bid: value.bid,
                    ask: value.ask
                };
            }));
        });
    });
};

PriceStore.prototype.getLastPrice = function(exchange, symbol, callback) {
    this.client.get(this.lastKey(exchange, symbol), function (error, value) {
        if (error) {
            callback(error);
            return;
        }
        if (value === null) {
            callback({
                exception: "NOT FOUND",
                info: {
                    exchange: exchange,
                    symbol: symbol
                }
            });
            return;
        }
        callback(null, JSON.parse(value).spot);
    });
};

module.exports = PriceStore;