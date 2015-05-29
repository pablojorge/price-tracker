var config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Plugin_ = require('../models/Plugin.js'),
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
        "USDARSCL": undefined
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
        USDARSB: 'dólar blue',
        USDARSCL: 'contado con liqui'
    };

    var resp = JSON.parse(body),
        bid = null,
        value = resp[0][selectors[this.symbol]].compra.precio,
        ask = parseFloat(value.replace(',', '.'));

    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var InfobaeStreamer = Streamer(InfobaePriceRequester,
                                       config.streaming.interval);
        Plugin_.register(InfobaePriceRequester, InfobaeStreamer);
    }
};
