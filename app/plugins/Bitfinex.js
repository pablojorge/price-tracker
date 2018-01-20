var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
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
        "ETHUSD" : "ETHUSD",
        "ETCUSD" : "ETCUSD",
        "BCHUSD" : "BCHUSD",
        "BTGUSD" : "BTGUSD",
    },
    url_template: 'https://api.bitfinex.com/v1/pubticker/<<SYMBOL>>',
};

BitfinexPriceRequester.prototype = Object.create(PriceRequester.prototype);
BitfinexPriceRequester.prototype.constructor = BitfinexPriceRequester;

BitfinexPriceRequester.prototype.processResponse = function (response, body) {
    var ticker = JSON.parse(body),
        bid = parseFloat(ticker.bid),
        ask = parseFloat(ticker.ask);
    return new messages.Symbol(this.getExchange(),
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
        Plugin_.register(BitfinexPriceRequester, BitfinexStreamer);
    }
};
