var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * VirWox
 */

function VirWoxPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

VirWoxPriceRequester.config = {
    exchange: 'virwox',
    symbol_map: {
        "BTCSLL" : "BTC/SLL",
        "USDSLL" : "USD/SLL",
    },
    url_template: (
       'http://www.virwox.com/api/json.php?method=getBestPrices' +
       '&symbols[0]=<<SYMBOL>>'
    ),
};

VirWoxPriceRequester.prototype = Object.create(PriceRequester.prototype);
VirWoxPriceRequester.prototype.constructor = VirWoxPriceRequester;

VirWoxPriceRequester.prototype.processResponse = function (response, body) {
    var result = JSON.parse(body).result,
        bid = parseFloat(result[0].bestBuyPrice),
        ask = parseFloat(result[0].bestSellPrice);
    return new messages.Symbol(this.getExchange(), this.symbol, bid, ask);
};
/**/

module.exports = {
    register: function (requesters, streamers, options) {
        var VirWoxStreamer = Streamer(VirWoxPriceRequester,
                                      config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(VirWoxPriceRequester.config.exchange,
                                     VirWoxPriceRequester);
        registry.streamers.register(VirWoxStreamer.config.exchange,
                                    VirWoxStreamer);
    }
};