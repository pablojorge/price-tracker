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
        "BTCUSD" : undefined,
        "ETHUSD" : undefined,
        "LTCUSD" : undefined,
    },
    url_template: 'https://www.okcoin.com/v2/spot/markets/tickers',
};

OKCoinPriceRequester.prototype = Object.create(PriceRequester.prototype);
OKCoinPriceRequester.prototype.constructor = OKCoinPriceRequester;

OKCoinPriceRequester.prototype.processResponse = function (response, body) {
    var symbol_map = {
        "BTCUSD" : "btc_usd",
        "ETHUSD" : "eth_usd",
        "LTCUSD" : "ltc_usd",
    };
    var self = this;
    var tickers = JSON.parse(body).data,
        symbol = null;

    tickers.forEach(function(ticker) {
        if (ticker.symbol == symbol_map[self.symbol]) {
            symbol = new messages.Symbol(
                self.getExchange(),
                self.symbol,
                parseFloat(ticker.buy),
                parseFloat(ticker.sell),
                new Date(), {
                    volume24: parseFloat(ticker.vol),
                    high24: parseFloat(ticker.high),
                    low24: parseFloat(ticker.low),
                }
            );
        }
    });

    return symbol;
};
/**/

module.exports = {
    register: function () {
        var OKCoinStreamer = Streamer(OKCoinPriceRequester,
                                      config.streaming.interval);
        Plugin_.register(OKCoinPriceRequester, OKCoinStreamer);
    }
};
