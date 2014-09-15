var messages = require('../public/lib/messages.js'),
    PriceRequester = require('../lib/PriceRequester.js'),
    Streamer = require('../lib/Streamer.js');

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
        buy = parseFloat(result[0].bestBuyPrice),
        sell = parseFloat(result[0].bestSellPrice);
    return new messages.Price(this.getExchange(), this.symbol, buy, sell);
};
/**/

module.exports = {
    register: function (requesters, streamers, options) {
        var VirWoxStreamer = Streamer(VirWoxPriceRequester, 
                                        options.streaming_interval);
        requesters.register(VirWoxPriceRequester.config.exchange,
                            VirWoxPriceRequester);
        streamers.register(VirWoxStreamer.config.exchange,
                           VirWoxStreamer);
    }
};