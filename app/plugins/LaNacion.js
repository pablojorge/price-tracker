var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * lanacion.com
 */

function LaNacionPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

LaNacionPriceRequester.config = {
    exchange: 'lanacion',
    symbol_map: {
        "USDARS" : undefined,
        "USDARSB" : undefined,
    },
    url_template: (
        'http://contenidos.lanacion.com.ar/json/dolar'
    ),
};

LaNacionPriceRequester.prototype = Object.create(PriceRequester.prototype);
LaNacionPriceRequester.prototype.constructor = LaNacionPriceRequester;

LaNacionPriceRequester.prototype.processResponse = function (response, body) {
    var selectors = {
        USDARS: {
            bid: 'CasaCambioCompraValue',
            ask: 'CasaCambioVentaValue'
        },
        USDARSB : {
            bid: 'InformalCompraValue',
            ask: 'InformalVentaValue'
        }
    };
    
    var payload = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1),
        resp = JSON.parse(payload),
        bid = parseFloat(resp[selectors[this.symbol].bid].replace(',', '.')),
        ask = parseFloat(resp[selectors[this.symbol].ask].replace(',', '.')),
        updated_on = new Date(),
        date_format = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
        match = date_format.exec(resp['Date']),
        published_on = new Date(parseInt(match[1]),
                                parseInt(match[2]) - 1,
                                parseInt(match[3]),
                                parseInt(match[4]),
                                parseInt(match[5]),
                                parseInt(match[6]));

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
    register: function (requesters, streamers, options) {
        var LaNacionStreamer = Streamer(LaNacionPriceRequester,
                                        config.streaming.interval);
        Plugin_.register(LaNacionPriceRequester, LaNacionStreamer);
    }
};
