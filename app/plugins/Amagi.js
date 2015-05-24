var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Amagi Metals
 */

function AmagiPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

AmagiPriceRequester.config = {
    exchange: 'amagi',
    symbol_map: {
        "XAUUSD" : undefined,
        "XAGUSD" : undefined
    },
    url_template: (
        'https://integration-qa.nfusionsolutions.biz/client/amagimetals/module/spotprices/nfspotright'
    ),
};

AmagiPriceRequester.prototype = Object.create(PriceRequester.prototype);
AmagiPriceRequester.prototype.constructor = AmagiPriceRequester;

AmagiPriceRequester.prototype.processResponse = function (response, body) {
    var selectors = {
        XAUUSD: {row: 0},
        XAGUSD: {row: 1}
    };

    var $ = cheerio.load(body),
        bid_text = $('#nfSpotPrices > tbody > tr')
                      .eq(selectors[this.symbol].row)[0]
                      .children[3].children[0].data,
        ask_text = $('#nfSpotPrices > tbody > tr')
                      .eq(selectors[this.symbol].row)[0]
                      .children[5].children[0].data,
        bid = parseFloat(bid_text.replace(',','')),
        ask = parseFloat(ask_text.replace(',',''));

    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var AmagiStreamer = Streamer(AmagiPriceRequester,
                                     config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(AmagiPriceRequester.config.exchange,
                                     AmagiPriceRequester);
        registry.streamers.register(AmagiStreamer.config.exchange,
                                    AmagiStreamer);
    }
};
