var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * BTC-e
 */

function BTCePriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BTCePriceRequester.config = {
    exchange: 'btc-e',
    symbol_map: {
        "BTCUSD" : "btc_usd",
        "LTCUSD" : "ltc_usd",
    },
    url_template: 'http://btc-e.com/api/2/<<SYMBOL>>/ticker',
};

BTCePriceRequester.prototype = Object.create(PriceRequester.prototype);
BTCePriceRequester.prototype.constructor = BTCePriceRequester;

BTCePriceRequester.prototype.processResponse = function (response, body) {
    var ticker = JSON.parse(body).ticker,
        // Yes, we want to invert them here:
        bid = ticker.sell,
        ask = ticker.buy;
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask,
                               new Date(), {
                                   volume24: ticker.vol_cur,
                                   high24: ticker.high,
                                   low24: ticker.low,
                               });
};
/**/

module.exports = {
    register: function () {
        var BTCeStreamer = Streamer(BTCePriceRequester,
                                    config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(BTCePriceRequester.config.exchange,
                                     BTCePriceRequester);
        registry.streamers.register(BTCeStreamer.config.exchange,
                                    BTCeStreamer);
    }
};
