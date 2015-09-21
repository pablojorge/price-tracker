var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Bitpay
 */

function BitpayPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BitpayPriceRequester.config = {
    exchange: 'bitpay',
    symbol_map: {
        "BTCUSD" : "usd",
        "BTCARS" : "ars",
    },
    url_template: 'https://bitpay.com/api/rates/<<SYMBOL>>',
};

BitpayPriceRequester.prototype = Object.create(PriceRequester.prototype);
BitpayPriceRequester.prototype.constructor = BitpayPriceRequester;

BitpayPriceRequester.prototype.processResponse = function (response, body) {
    var ticker = JSON.parse(body),
        bid = null,
        ask = parseFloat(ticker.rate);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var BitpayStreamer = Streamer(BitpayPriceRequester,
                                      config.streaming.interval);
        Plugin_.register(BitpayPriceRequester, BitpayStreamer);
    }
};
