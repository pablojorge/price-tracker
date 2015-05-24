var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Clarin.com
 */

function ClarinPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

ClarinPriceRequester.config = {
    exchange: 'clarin',
    symbol_map: {
        "USDARS" : undefined,
        "USDARSB" : undefined,
    },
    url_template: (
        'http://www.ieco.clarin.com/'
    ),
};

ClarinPriceRequester.prototype = Object.create(PriceRequester.prototype);
ClarinPriceRequester.prototype.constructor = ClarinPriceRequester;

ClarinPriceRequester.prototype.processResponse = function (response, body) {
    var selectors = {
        USDARS: 'oficial',
        USDARSB: 'blue'
    };

    var selector = {
        bid: '.' + selectors[this.symbol] + ' > .bd > .compra > span',
        ask: '.' + selectors[this.symbol] + ' > .bd > .venta > span',
    };

    var $ = cheerio.load(body),
        bid = parseFloat($(selector.bid).text().replace('$', '').replace(',','.')),
        ask = parseFloat($(selector.ask).text().replace('$', '').replace(',','.'));

    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var ClarinStreamer = Streamer(ClarinPriceRequester,
                                      config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(ClarinPriceRequester.config.exchange,
                                     ClarinPriceRequester);
        registry.streamers.register(ClarinStreamer.config.exchange,
                                    ClarinStreamer);
    }
};
