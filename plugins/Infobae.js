var messages = require('../common/messages.js'),
    PriceRequester = require('../lib/PriceRequester.js'),
    Streamer = require('../lib/Streamer.js');

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
    register: function (requesters, streamers, options) {
        var InfobaeStreamer = Streamer(InfobaePriceRequester,
                                       options.streaming_interval);
        requesters.register(InfobaePriceRequester.config.exchange,
                            InfobaePriceRequester);
        streamers.register(InfobaeStreamer.config.exchange,
                           InfobaeStreamer);
    }
};
