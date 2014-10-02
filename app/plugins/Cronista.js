var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js'),
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
        'http://indigocontenidos.com.ar/cronista-cotizaciones/cotizaciones-nueva/cotizacion.php'
    ),
};

CronistaPriceRequester.prototype = Object.create(PriceRequester.prototype);
CronistaPriceRequester.prototype.constructor = CronistaPriceRequester;

CronistaPriceRequester.prototype.processResponse = function (response, body) {
    var selectors = {
        USDARS: {_class: '.large', pos: 0 },
        USDARSB: {_class: '.mid', pos: 0 },
        USDARSCL: {_class: '.mid', pos: 2 },
    };

    var $ = cheerio.load(body),
        bid = null,
        value = $(selectors[this.symbol]._class + " > strong > span")
                    .eq(selectors[this.symbol].pos).text(),
        ask = parseFloat(value.replace(',','.'));

    return new messages.Price(this.getExchange(),
                              this.symbol,
                              bid,
                              ask);
};
/**/

module.exports = {
    register: function () {
        var CronistaStreamer = Streamer(CronistaPriceRequester,
                                        config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(CronistaPriceRequester.config.exchange,
                                     CronistaPriceRequester);
        registry.streamers.register(CronistaStreamer.config.exchange,
                                    CronistaStreamer);
    }
};
