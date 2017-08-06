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
        "USDARS" : "ARS",
        "USDARSB" : "ARSB",
    },
    url_template: (
        'http://www.cronista.com/MercadosOnline/json/getDinamicos.html?tipo=monedas&id=<<SYMBOL>>'
    ),
};

CronistaPriceRequester.prototype = Object.create(PriceRequester.prototype);
CronistaPriceRequester.prototype.constructor = CronistaPriceRequester;

CronistaPriceRequester.prototype.processResponse = function (response, body) {
    var monedas = JSON.parse(body).monedas,
        bid = parseFloat(monedas.Compra),
        ask = parseFloat(monedas.Venta),
        updated_on = new Date(),
        published_on = new Date(
            parseInt(
                monedas.UltimaActualizacion.
                    match("^/Date\\((.*)\\)/$")[1]
            )
        );

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
    }
};
