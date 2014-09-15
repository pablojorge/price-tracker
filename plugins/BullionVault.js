var cheerio = require('cheerio'), 
    messages = require('../public/lib/messages.js'),
    PriceRequester = require('../lib/PriceRequester.js'),
    Streamer = require('../lib/Streamer.js');

/**
 * BullionVault
 */

function BullionVaultPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BullionVaultPriceRequester.config = {
    exchange: 'bullionvault',
    symbol_map: { 
        "XAUUSD" : "GOLD", 
        "XAGUSD" : "SILVER" 
    },
    url_template: (
        'http://live.bullionvault.com/secure/api/v2/view_market_xml.do' +
        '?considerationCurrency=USD&securityClassNarrative=<<SYMBOL>>'
    ),
};

BullionVaultPriceRequester.prototype = Object.create(PriceRequester.prototype);
BullionVaultPriceRequester.prototype.constructor = BullionVaultPriceRequester;

BullionVaultPriceRequester.prototype.processResponse = function (response, body) {
    var $ = cheerio.load(body),
        get_price = function(op) {
            var prices = [];
            $(op + "Prices > price").each(function(index, elem){
                prices.push(elem.attribs.limit);
            });
            return Math.min.apply(null, prices) / 32.15;
        },
        buy = get_price("buy"),
        sell = get_price("sell");
    
    return new messages.Price(this.getExchange(), this.symbol, buy, sell);
};
/**/

module.exports = {
    register: function (requesters, streamers, options) {
        var BullionVaultStreamer = Streamer(BullionVaultPriceRequester, 
                                            options.streaming_interval);
        requesters.register(BullionVaultPriceRequester.config.exchange,
                            BullionVaultPriceRequester);
        streamers.register(BullionVaultStreamer.config.exchange,
                           BullionVaultStreamer);
    }
};
