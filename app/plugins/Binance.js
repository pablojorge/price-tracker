var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Binance
 */

function BinancePriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BinancePriceRequester.config = {
    exchange: 'binance',
    symbol_map: {
        "BTCUSD" : "BTCUSDT",
        "BCHUSD" : "BCHUSDT",
        "LTCUSD" : "LTCUSDT",
        "ETHUSD" : "ETHUSDT",
        "ETCUSD" : "ETCUSDT",
        "ZECUSD" : "ZECUSDT",
        "XMRUSD" : "XMRUSDT",
        "XLMUSD" : "XLMUSDT",
        "XRPUSD" : "XRPUSDT",
    },
    url_template: 'https://api.binance.com/api/v3/ticker/bookTicker?symbol=<<SYMBOL>>',
};

BinancePriceRequester.prototype = Object.create(PriceRequester.prototype);
BinancePriceRequester.prototype.constructor = BinancePriceRequester;

BinancePriceRequester.prototype.processResponse = function (response, body) {
    var ticker = JSON.parse(body),
        bid = parseFloat(ticker.bidPrice),
        ask = parseFloat(ticker.askPrice);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var BinanceStreamer = Streamer(BinancePriceRequester,
                                       config.streaming.interval);
        Plugin_.register(BinancePriceRequester, BinanceStreamer);
    }
};
