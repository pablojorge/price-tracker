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
        USDARS: {bid: 0, ask: 1},
        USDARSCL: {bid: -1, ask: 2}
    };

    var parseValue = function (value) {
        return parseFloat(value.replace('$', '').replace(',', '.'));
    };

    var resp = JSON.parse(body),
        bid = selectors[this.symbol].bid >= 0 ? parseValue(resp[selectors[this.symbol].bid].value) : null,
        ask = selectors[this.symbol].ask >= 0 ? parseValue(resp[selectors[this.symbol].ask].value) : null;

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
