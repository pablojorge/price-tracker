var messages = require('../../public/lib/messages.js'),
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
            buy: 'CasaCambioCompraValue',
            sell: 'CasaCambioVentaValue'
        },
        USDARSB : {
            buy: 'InformalCompraValue',
            sell: 'InformalVentaValue'
        }
    };
    
    var payload = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1),
        resp = JSON.parse(payload),
        buy = parseFloat(resp[selectors[this.symbol].buy].replace(',', '.')),
        sell = parseFloat(resp[selectors[this.symbol].sell].replace(',', '.')),
        retrieved_on = new Date(),
        date_format = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
        match = date_format.exec(resp['Date']),
        updated_on = new Date(parseInt(match[1]),
                              parseInt(match[2]) - 1,
                              parseInt(match[3]),
                              parseInt(match[4]),
                              parseInt(match[5]),
                              parseInt(match[6]));

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
        var LaNacionStreamer = Streamer(LaNacionPriceRequester, 
                                        options.streaming_interval);
        requesters.register(LaNacionPriceRequester.config.exchange,
                            LaNacionPriceRequester);
        streamers.register(LaNacionStreamer.config.exchange,
                           LaNacionStreamer);
    }
};
