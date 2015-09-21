var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Kraken
 */

function KrakenPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

KrakenPriceRequester.config = {
    exchange: 'kraken',
    symbol_map: {
        "ETHUSD" : "ETHUSD",
        "ETHBTC" : "ETHXBT",
        "BTCUSD" : "XBTUSD",
        "LTCUSD" : "LTCUSD",
    },
    url_template: 'https://api.kraken.com/0/public/Ticker?pair=<<SYMBOL>>',
};

KrakenPriceRequester.prototype = Object.create(PriceRequester.prototype);
KrakenPriceRequester.prototype.constructor = KrakenPriceRequester;

KrakenPriceRequester.prototype.processResponse = function (response, body) {
    var result_map = {
        "ETHUSD" : "XETHZUSD",
        "ETHBTC" : "XETHXXBT",
        "BTCUSD" : "XXBTZUSD",
        "LTCUSD" : "XLTCZUSD",
    };

    var ticker = JSON.parse(body).result[result_map[this.symbol]],
        bid = parseFloat(ticker.b[0]),
        ask = parseFloat(ticker.a[0]);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask,
                               new Date(), {
                                   volume24: parseFloat(ticker.v[1]),
                                   high24: parseFloat(ticker.h[1]),
                                   low24: parseFloat(ticker.l[1]),
                               });
};
/**/

module.exports = {
    register: function () {
        var KrakenStreamer = Streamer(KrakenPriceRequester,
                                      config.streaming.interval);
        Plugin_.register(KrakenPriceRequester, KrakenStreamer);
    }
};
