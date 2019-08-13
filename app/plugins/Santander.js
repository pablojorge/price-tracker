var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Banco Santander
 */

function SantanderPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

SantanderPriceRequester.config = {
    exchange: 'santander',
    symbol_map: {
        "USDARS" : undefined,
    },
    url_template: (
        'https://banco.santanderrio.com.ar/exec/cotizacion/index.jsp'
    ),
};

SantanderPriceRequester.prototype = Object.create(PriceRequester.prototype);
SantanderPriceRequester.prototype.constructor = SantanderPriceRequester;

SantanderPriceRequester.prototype.processResponse = function (response, body) {
    var $ = cheerio.load(body);

    var value_extractor = function (pos) {
        var value = $(".fortable > table")[0].children[3].children[pos].children[0].data;
        return parseFloat(value.replace("$ ", "").replace(",", "."));
    };

    var bid = value_extractor(3),
        ask = value_extractor(5);

    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var SantanderStreamer = Streamer(SantanderPriceRequester,
                                         config.streaming.interval);
        Plugin_.register(SantanderPriceRequester, SantanderStreamer);
    }
};
