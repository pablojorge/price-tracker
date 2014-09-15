var cheerio = require('cheerio'),
    messages = require('../common/messages.js'),
    PriceRequester = require('../lib/PriceRequester.js'),
    Streamer = require('../lib/Streamer.js');

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
    },
    url_template: (
        'http://indigocontenidos.com.ar/cronista-cotizaciones/cotizaciones-nueva/cotizacion.php'
    ),
};

CronistaPriceRequester.prototype = Object.create(PriceRequester.prototype);
CronistaPriceRequester.prototype.constructor = CronistaPriceRequester;

CronistaPriceRequester.prototype.processResponse = function (response, body) {
    var selectors = {
        USDARS: '.large',
        USDARSB: '.mid'
    };

    var $ = cheerio.load(body),
        buy = null,
        value = $(selectors[this.symbol] + " > strong > span").first().text(),
        sell = parseFloat(value.replace(',','.')),
        retrieved_on = new Date(),
        updated_on = new Date();

    return new messages.Price(this.getExchange(),
                              this.symbol,
                              buy,
                              sell,
                              retrieved_on,
                              updated_on);
};
/**/

module.exports = {
    register: function (requesters, streamers, options) {
        var CronistaStreamer = Streamer(CronistaPriceRequester,
                                        options.streaming_interval);
        requesters.register(CronistaPriceRequester.config.exchange,
                            CronistaPriceRequester);
        streamers.register(CronistaStreamer.config.exchange,
                           CronistaStreamer);
    }
};
