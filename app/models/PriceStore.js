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
        value = JSON.stringify({
            date: response.data.updated_on * 1,
            bid: response.data.bid,
            ask: response.data.ask
        });

    // Fetch the last element from this series:
    this.client.lindex(key, -1, function (error, last) {
        last = (last === null ? last : JSON.parse(last));

        // Store the received data only if it differs from the previous one:
        if (last === null ||
            ((last.bid && response.data.bid) && last.bid !== response.data.bid) ||
            ((last.ask && response.data.ask) && last.ask !== response.data.ask)) {
            console.log("PriceStore: saving", key, value);
            self.client.rpush(key, value, function (error, index) {
                if (error) {
                    console.log("ERROR saving in PriceStore:", error);
                }
            });
        }
    });
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