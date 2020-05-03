var config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');
    
/**
 * Ambito.com
 */

function AmbitoPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

AmbitoPriceRequester.config = {
    exchange: 'ambito',
    symbol_map: {
        "USDARS" : "oficial",
        "USDARSB" : "informal",
    },
    url_template: (
        'https://mercados.ambito.com//dolar/<<SYMBOL>>/variacion'
    ),
};

AmbitoPriceRequester.prototype = Object.create(PriceRequester.prototype);
AmbitoPriceRequester.prototype.constructor = AmbitoPriceRequester;

AmbitoPriceRequester.prototype.processResponse = function (response, body) {
    var body = JSON.parse(body),
        bid = parseFloat(body.compra.replace(',','.')),
        ask = parseFloat(body.venta.replace(',','.'));
    
    return new messages.Symbol(this.getExchange(), 
                               this.symbol, 
                               bid, 
                               ask);
};
/**/

module.exports = {
    register: function () {
        var AmbitoStreamer = Streamer(AmbitoPriceRequester,
                                      config.streaming.interval);
        Plugin_.register(AmbitoPriceRequester, AmbitoStreamer);
    },
    type: AmbitoPriceRequester,
};
