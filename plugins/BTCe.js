var messages = require('../public/lib/messages.js'),
    PriceRequester = require('../lib/PriceRequester.js'),
    Streamer = require('../lib/Streamer.js');

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
        buy = ticker.sell,
        sell = ticker.buy;
    return new messages.Price(this.getExchange(), 
                              this.symbol, 
                              buy, 
                              sell);
};
/**/

module.exports = {
    register: function (requesters, streamers, options) {
        var BTCeStreamer = Streamer(BTCePriceRequester, 
                                    options.streaming_interval);
        requesters.register(BTCePriceRequester.config.exchange,
                            BTCePriceRequester);
        streamers.register(BTCeStreamer.config.exchange,
                           BTCeStreamer);
    }
};
