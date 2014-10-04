var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Virtex
 */

function VirtexPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

VirtexPriceRequester.config = {
    exchange: 'virtex',
    symbol_map: {
        "BTCUSD" : "BTC-USD",
        "LTCUSD" : "LTC-USD",
    },
    url_template: 'https://api.virtex.com/v1/market/ticker?market=<<SYMBOL>>',
};

VirtexPriceRequester.prototype = Object.create(PriceRequester.prototype);
VirtexPriceRequester.prototype.constructor = VirtexPriceRequester;

VirtexPriceRequester.prototype.processResponse = function (response, body) {
    var ticker = JSON.parse(body),
        bid = parseFloat(ticker.bid),
        ask = parseFloat(ticker.ask),
        updated_on = new Date();

    return new messages.Price(this.getExchange(),
                              this.symbol,
                              bid,
                              ask,
                              updated_on, {
                                  volume: parseFloat(ticker.volume)
                              });
};
/**/

module.exports = {
    register: function () {
        var VirtexStreamer = Streamer(VirtexPriceRequester,
                                      config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(VirtexPriceRequester.config.exchange,
                                     VirtexPriceRequester);
        registry.streamers.register(VirtexStreamer.config.exchange,
                                    VirtexStreamer);
    }
};
