var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * OKCoin
 */

function OKCoinPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

OKCoinPriceRequester.config = {
    exchange: 'okcoin',
    symbol_map: {
        "BTCUSD" : "btc_usd",
        "LTCUSD" : "ltc_usd",
    },
    url_template: 'https://www.okcoin.com/api/ticker.do?symbol=<<SYMBOL>>&ok=1',
};

OKCoinPriceRequester.prototype = Object.create(PriceRequester.prototype);
OKCoinPriceRequester.prototype.constructor = OKCoinPriceRequester;

OKCoinPriceRequester.prototype.processResponse = function (response, body) {
    var ticker = JSON.parse(body).ticker,
        bid = parseFloat(ticker.buy),
        ask = parseFloat(ticker.sell);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask,
                               new Date(), {
                                   volume24: parseFloat(ticker.vol),
                                   high24: parseFloat(ticker.high),
                                   low24: parseFloat(ticker.low),
                               });
};
/**/

module.exports = {
    register: function () {
        var OKCoinStreamer = Streamer(OKCoinPriceRequester,
                                      config.streaming.interval);
        Plugin_.register(OKCoinPriceRequester, OKCoinStreamer);
    }
};
