var config = require('../../config/config'),
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
        "USDARS" : 1,
        "USDARSB" : 2,
        "USDARSCL" : 5,
    },
    url_template: (
        'https://www.cronista.com/MercadosOnline/json/getValoresCalculadora.html'
    ),
};

CronistaPriceRequester.prototype = Object.create(PriceRequester.prototype);
CronistaPriceRequester.prototype.constructor = CronistaPriceRequester;

CronistaPriceRequester.prototype.processResponse = function (response, body) {
    var self = this,
        cotizacion = JSON.parse(body).filter(
            function (elem) {
                return elem.Id == CronistaPriceRequester.config.symbol_map[self.symbol];
            }
        )[0],
        bid = cotizacion.Compra,
        ask = cotizacion.Venta,
        updated_on = new Date(),
        published_on = new Date(cotizacion.UltimaActualizacion);

    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask,
                               updated_on, {
                                   published_on: published_on
                               });
};
/**/

module.exports = {
    register: function () {
        var CronistaStreamer = Streamer(CronistaPriceRequester,
                                        config.streaming.interval);
        Plugin_.register(CronistaPriceRequester, CronistaStreamer);
    },
};
