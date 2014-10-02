var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

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
        bid = get_price("buy"),
        ask = get_price("sell");
    
    return new messages.Price(this.getExchange(), this.symbol, bid, ask);
};
/**/

module.exports = {
    register: function () {
        var BullionVaultStreamer = Streamer(BullionVaultPriceRequester,
                                            config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(BullionVaultPriceRequester.config.exchange,
                                     BullionVaultPriceRequester);
        registry.streamers.register(BullionVaultStreamer.config.exchange,
                                    BullionVaultStreamer);
    }
};
