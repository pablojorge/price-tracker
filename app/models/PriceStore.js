var redis = require('redis'),
    url = require('url'),
    config = require('../../config/config');

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

PriceStore.prototype.seriesKey = function(exchange, symbol) {
    return "series:".concat("symbol:", symbol, ":exchange:", exchange);
};

PriceStore.prototype.listener = function(error, response) {
    var self = this;

    if (error !== null) {
        console.log("PriceStore: WARNING ignoring error:", error);
        return;
    }

    var key = this.seriesKey(response.data.exchange, response.data.symbol),
        value = {
            date: response.data.updated_on * 1,
            bid: response.data.bid,
            ask: response.data.ask
        };

    // Fetch the last element from this series:
    this.client.lindex(key, -1, function (error, last) {
        last = (last === null ? last : JSON.parse(last));

        if (self.keepPrice(last, value)) {
            value = JSON.stringify(value);
            self.client.rpush(key, value, function (error, index) {
                if (error) {
                    console.log("PriceStore: ERROR saving", key, value, error);
                } else {
                    console.log("PriceStore: saved", key, value, "at pos", index);
                }
            });
        }
    });
};

PriceStore.prototype.keepPrice = function(last, value) {
    // If there are no previous values, keep it:
    if (last === null)
        return true;

    // If it's too recent, discard it:
    if ((value.date - last.date) < this.interval * 1000)
        return false;

    // If either the bid price or the ask price changed, keep it:
    if ((last.bid && value.bid) && last.bid !== value.bid ||
        (last.ask && value.ask) && last.ask !== value.ask)
        return true;

    return false;
};

PriceStore.prototype.getPrices = function(exchange, symbol, start, end, callback) {
    this.client.lrange(this.seriesKey(exchange, symbol), 0, -1, function (error, values) {
        if (error) {
            callback(error);
            return;
        }
        callback(null, values.map(function (value) {
            value = JSON.parse(value);
            value.date = new Date(value.date);
            return value;
        }));
    });
};

module.exports = PriceStore;