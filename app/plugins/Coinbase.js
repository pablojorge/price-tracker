var async = require('async'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Coinbase
 */

function CoinbasePriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

CoinbasePriceRequester.config = {
    exchange: 'coinbase',
    symbol_map: {
        "BTCUSD" : undefined
    },
    url_template: 'http://coinbase.com/api/v1/prices/spot_rate',
};

CoinbasePriceRequester.prototype = Object.create(PriceRequester.prototype);
CoinbasePriceRequester.prototype.constructor = CoinbasePriceRequester;

// We must override doRequest() because two different requests are needed
// to get the buy and sell prices
CoinbasePriceRequester.prototype.doRequest = function (callback) {
    var _this = this;

    async.map(
        ['http://coinbase.com/api/v1/prices/sell',
         'http://coinbase.com/api/v1/prices/buy'],
        function (item, cb) {
            _this.__doRequest(
                item, 
                function (resp) {
                    cb(null, resp);
                },
                function (err) {
                    cb(err);
                }
            );
        },
        function (err, results) {
            if (err !== null) {
                callback({
                    exception: err,
                    info: {
                        exchange: _this.getExchange(),
                        symbol: _this.symbol,
                    }
                });                
            }

            // Yes, we want to invert 'buy' and 'sell' here:
            callback(null,
                     new messages.Price(_this.getExchange(), 
                                        _this.symbol, 
                                        results[0], 
                                        results[1]));
        }
    );
};

CoinbasePriceRequester.prototype.processResponse = function (response, body) {
    return parseFloat(JSON.parse(body).amount);
};
/**/

module.exports = {
    register: function (requesters, streamers, options) {
        var CoinbaseStreamer = Streamer(CoinbasePriceRequester,
                                        config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(CoinbasePriceRequester.config.exchange,
                                     CoinbasePriceRequester);
        registry.streamers.register(CoinbaseStreamer.config.exchange,
                                    CoinbaseStreamer);
    }
};
