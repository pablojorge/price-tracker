var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Registry = require('../models/Registry.js'),
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
        // Yes, we want to invert them here:
        buy = parseFloat(ticker.sell),
        sell = parseFloat(ticker.buy);
    return new messages.Price(this.getExchange(), 
                              this.symbol, 
                              buy, 
                              sell);
};
/**/

module.exports = {
    register: function () {
        var OKCoinStreamer = Streamer(OKCoinPriceRequester,
                                      config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(OKCoinPriceRequester.config.exchange,
                                     OKCoinPriceRequester);
        registry.streamers.register(OKCoinStreamer.config.exchange,
                                    OKCoinStreamer);
    }
};
