var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Bitfinex
 */

function BitfinexPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BitfinexPriceRequester.config = {
    exchange: 'bitfinex',
    symbol_map: {
        "BTCUSD" : "BTCUSD",
        "LTCUSD" : "LTCUSD",
    },
    url_template: 'https://api.bitfinex.com/v1/pubticker/<<SYMBOL>>',
};

BitfinexPriceRequester.prototype = Object.create(PriceRequester.prototype);
BitfinexPriceRequester.prototype.constructor = BitfinexPriceRequester;

BitfinexPriceRequester.prototype.processResponse = function (response, body) {
    var ticker = JSON.parse(body),
        bid = parseFloat(ticker.bid),
        ask = parseFloat(ticker.ask);
    return new messages.Price(this.getExchange(),
                              this.symbol,
                              bid,
                              ask,
                              new Date(), {
                                  volume24: parseFloat(ticker.volume),
                                  high24: parseFloat(ticker.high),
                                  low24: parseFloat(ticker.low),
                              });
};
/**/

module.exports = {
    register: function () {
        var BitfinexStreamer = Streamer(BitfinexPriceRequester,
                                      config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(BitfinexPriceRequester.config.exchange,
                                     BitfinexPriceRequester);
        registry.streamers.register(BitfinexStreamer.config.exchange,
                                    BitfinexStreamer);
    }
};
