var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Banco Nacion
 */

function BNAPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BNAPriceRequester.config = {
    exchange: 'bna',
    symbol_map: {
        "USDARS" : undefined,
    },
    url_template: (
        'http://www.bna.com.ar/'
    ),
    custom_headers: {
        'Host': 'www.bna.com.ar',
        'User-Agent': (
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko)' +
            'Chrome/47.0.2526.106 Safari/537.36'
        )
    }
};

BNAPriceRequester.prototype = Object.create(PriceRequester.prototype);
BNAPriceRequester.prototype.constructor = BNAPriceRequester;

BNAPriceRequester.prototype.processResponse = function (response, body) {
    var $ = cheerio.load(body);

    var value_extractor = function (pos) {
        var value = $(".cotizacion > tbody > tr > td")[pos].children[0].data;
        return parseFloat(value.replace(',','.'));
    };

    var bid = value_extractor(1),
        ask = value_extractor(2);

    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var BNAStreamer = Streamer(BNAPriceRequester,
                                   config.streaming.interval);
        Plugin_.register(BNAPriceRequester, BNAStreamer);
    }
};
