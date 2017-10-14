var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * BullionVault
 *
 * Docs: https://www.bullionvault.com/help/xml_api.html
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
        'https://www.bullionvault.com/view_market_xml.do' +
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
    
    return new messages.Symbol(this.getExchange(), this.symbol, bid, ask);
};
/**/

module.exports = {
    register: function () {
        var BullionVaultStreamer = Streamer(BullionVaultPriceRequester,
                                            config.streaming.interval);
        Plugin_.register(BullionVaultPriceRequester, BullionVaultStreamer);
    }
};
