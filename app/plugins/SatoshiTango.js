var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * SatoshiTango
 */

function SatoshiTangoPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

SatoshiTangoPriceRequester.config = {
    exchange: 'satoshitango',
    symbol_map: {
        "BTCUSD" : "",
        "BTCARS" : "",
    },
    url_template: 'https://api.satoshitango.com/v2/ticker',
};

SatoshiTangoPriceRequester.prototype = Object.create(PriceRequester.prototype);
SatoshiTangoPriceRequester.prototype.constructor = SatoshiTangoPriceRequester;

SatoshiTangoPriceRequester.prototype.processResponse = function (response, body) {
    var result_map = {
        "BTCUSD" : "usdbtc",
        "BTCARS" : "arsbtc",
    };

    var ticker = JSON.parse(body),
        bid = parseFloat(ticker.data.venta[result_map[this.symbol]]),
        ask = parseFloat(ticker.data.compra[result_map[this.symbol]]);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask,
                               new Date(), {
                                   published_on: new Date(ticker.data.compra.date)
                               });
};
/**/

module.exports = {
    register: function () {
        var SatoshiTangoStreamer = Streamer(SatoshiTangoPriceRequester,
                                            config.streaming.interval);
        Plugin_.register(SatoshiTangoPriceRequester, SatoshiTangoStreamer);
    }
};
