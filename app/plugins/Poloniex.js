var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Poloniex
 */

function PoloniexPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

PoloniexPriceRequester.config = {
    exchange: 'poloniex',
    symbol_map: {
        "ETHUSD" : "",
        "ETCUSD" : "",
        "BTCUSD" : "",
        "LTCUSD" : "",
        "DOTUSD" : "",
        "ZECUSD" : "",
        "XLMUSD" : "",
        "XMRUSD" : "",
        "XRPUSD" : "",
    },
    url_template: 'https://poloniex.com/public?command=returnTicker',
};

PoloniexPriceRequester.prototype = Object.create(PriceRequester.prototype);
PoloniexPriceRequester.prototype.constructor = PoloniexPriceRequester;

PoloniexPriceRequester.prototype.processResponse = function (response, body) {
    var result_map = {
        "ETHUSD" : "USDT_ETH",
        "ETCUSD" : "USDT_ETC",
        "BTCUSD" : "USDT_BTC",
        "LTCUSD" : "USDT_LTC",
        "DOTUSD" : "USDT_DOT",
        "XLMUSD" : "USDT_STR",
        "XMRUSD" : "USDT_XMR",
        "XRPUSD" : "USDT_XRP",
        "ZECUSD" : "USDT_ZEC",
    };

    var ticker = JSON.parse(body)[result_map[this.symbol]],
        bid = parseFloat(ticker.highestBid),
        ask = parseFloat(ticker.lowestAsk);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask,
                               new Date(), {
                                   volume24: parseFloat(ticker.quoteVolume),
                                   high24: parseFloat(ticker.high24hr),
                                   low24: parseFloat(ticker.low24hr),
                               });
};
/**/

module.exports = {
    register: function () {
        var PoloniexStreamer = Streamer(PoloniexPriceRequester,
                                        config.streaming.interval);
        Plugin_.register(PoloniexPriceRequester, PoloniexStreamer);
    }
};
