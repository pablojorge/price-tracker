var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Gemini
 */

function GeminiPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

GeminiPriceRequester.config = {
    exchange: 'gemini',
    symbol_map: {
        "BTCUSD" : "btcusd",
        "ETHUSD" : "ethusd",
    },
    url_template: 'https://api.gemini.com/v1/book/<<SYMBOL>>',
};

GeminiPriceRequester.prototype = Object.create(PriceRequester.prototype);
GeminiPriceRequester.prototype.constructor = GeminiPriceRequester;

GeminiPriceRequester.prototype.processResponse = function (response, body) {
    var book = JSON.parse(body),
        bid = parseFloat(book.bids[0].price),
        ask = parseFloat(book.asks[0].price);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var GeminiStreamer = Streamer(GeminiPriceRequester,
                                      config.streaming.interval);
        Plugin_.register(GeminiPriceRequester, GeminiStreamer);
    }
};
