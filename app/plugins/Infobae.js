var config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * infobae.com
 */

function InfobaePriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

InfobaePriceRequester.config = {
    exchange: 'infobae',
    symbol_map: {
        "USDARS" : undefined,
        "USDARSB" : undefined,
    },
    url_template: (
        'http://www.infobae.com/adjuntos/servicios/cotizacion.json'
    ),
};

InfobaePriceRequester.prototype = Object.create(PriceRequester.prototype);
InfobaePriceRequester.prototype.constructor = InfobaePriceRequester;

InfobaePriceRequester.prototype.processResponse = function (response, body) {
    var selectors = {
        USDARS: 'dólar oficial',
        USDARSB: 'dólar blue'
    };

    var resp = JSON.parse(body),
        buy = null,
        value = resp[0][selectors[this.symbol]].compra.precio,
        sell = parseFloat(value.replace(',', '.')),
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
    register: function () {
        var InfobaeStreamer = Streamer(InfobaePriceRequester,
                                       config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(InfobaePriceRequester.config.exchange,
                                     InfobaePriceRequester);
        registry.streamers.register(InfobaeStreamer.config.exchange,
                                    InfobaeStreamer);
    }
};
