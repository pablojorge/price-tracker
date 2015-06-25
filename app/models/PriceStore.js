var redis = require('redis'),
    url = require('url'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    helpers = require('../../public/lib/helpers.js');

var Broadcaster = require('../models/Broadcaster.js');

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

    this.broadcaster = Broadcaster.getInstance();
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
    return "".concat(symbol, ":", exchange, ":", "last");
};

PriceStore.prototype.seriesKey = function(exchange, symbol, freq, date) {
    return "".concat(symbol, ":", exchange, ":", freq, ":", date);
};

PriceStore.prototype.accumulate = function(last, current, date_func) {
    if (last === null) {
        return {
            date: date_func(current.updated_on),
            bid: {open: current.bid,
                  high: current.bid,
                  low: current.bid,
                  close: current.bid},
            ask: {open: current.ask,
                  high: current.ask,
                  low: current.ask,
                  close: current.ask},
        };
    } else if (last.date !== date_func(current.updated_on)) {
        return {
            date: date_func(current.updated_on),
            bid: {open: last.bid.close,
                  high: Math.max(last.bid.close, current.bid),
                  low: Math.min(last.bid.close, current.bid),
                  close: current.bid},
            ask: {open: last.ask.close,
                  high: Math.max(last.ask.close, current.ask),
                  low: Math.min(last.ask.close, current.ask),
                  close: current.ask},
        };
    } else {
        return {
            date: date_func(current.updated_on),
            bid: {open: last.bid.open,
                  high: Math.max(last.bid.high, current.bid),
                  low: Math.min(last.bid.low, current.bid),
                  close: current.bid},
            ask: {open: last.ask.open,
                  high: Math.max(last.ask.high, current.ask),
                  low: Math.min(last.ask.low, current.ask),
                  close: current.ask},
        };
    }
};

PriceStore.prototype.merge = function(last, current) {
    if (last === null)
        return current;

    return helpers.merge(last, current);
};

PriceStore.prototype.addStatistics = function(last, value) {
    value = helpers.deepcopy(value);

    // Inject the delta properties:
    value.spot.custom.bid_delta = (value.daily.bid.close - value.daily.bid.open);
    value.spot.custom.ask_delta = (value.daily.ask.close - value.daily.ask.open);

    if (last === null)
        return value;

    if (value.spot.bid !== last.spot.bid || value.spot.ask !== last.spot.ask)
        value.spot.custom.last_change = value.spot.updated_on;

    return value;
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
            spot: self.merge(last ? last.spot : null, response.data),
            hourly: self.accumulate(last ? last.hourly : null, response.data, to_hour_key),
            daily: self.accumulate(last ? last.daily : null, response.data, to_day_key),
        };

        value = self.addStatistics(last, value);

        // Forward to the broadcaster:
        var message = new messages.Symbol();
        message.data = value.spot;
        self.broadcaster.listener(null, message);

        self.client.mset(last_key, JSON.stringify(value),
                         hourly_key, JSON.stringify(value.hourly),
                         daily_key, JSON.stringify(value.daily),
            function (error, ret) {
                if (error) {
                    console.log("PriceStore: ERROR saving", last_key, ":", error);
                } else {
                    console.log("PriceStore: saved", last_key, hourly_key, daily_key, ":", ret);
                }
            }
        );
    });
};

PriceStore.prototype.getPrices = function(exchange, symbol, start, end, callback) {
    var self = this;

    var query = this.seriesKey(exchange, symbol, 'daily', '*');

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
                    date: from_day_key(value.date),
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
        var message = new messages.Symbol();
        message.data = JSON.parse(value).spot;
        callback(null, message);
    });
};

module.exports = PriceStore;