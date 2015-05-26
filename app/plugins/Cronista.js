var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Cronista.com
 */

function CronistaPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

CronistaPriceRequester.config = {
    exchange: 'cronista',
    symbol_map: {
        "USDARS" : undefined,
        "USDARSB" : undefined,
        "USDARSCL" : undefined
    },
    url_template: (
        'http://www.cronista.com'
    ),
};

CronistaPriceRequester.prototype = Object.create(PriceRequester.prototype);
CronistaPriceRequester.prototype.constructor = CronistaPriceRequester;

CronistaPriceRequester.prototype.processResponse = function (response, body) {
    var selectors = {
        USDARS: {pos: 1},
        USDARSB: {pos: 4},
        USDARSCL: {pos: 13},
    };

    var $ = cheerio.load(body);

    var value_extractor = function (pos) {
        var value = $(".tablaHomeCompraVenta > span")[pos].children[0].data;
        return parseFloat(value.replace(',','.'));
    };

    var bid = value_extractor(selectors[this.symbol].pos),
        ask = value_extractor(selectors[this.symbol].pos + 1);

    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var CronistaStreamer = Streamer(CronistaPriceRequester,
                                        config.streaming.interval);
        Plugin_.register(CronistaPriceRequester, CronistaStreamer);
    }
};
