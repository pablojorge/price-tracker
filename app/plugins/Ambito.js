var cheerio = require('cheerio'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js'),
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
        "USDARS" : "ARSSCBCRA",
        "USDARSB" : "ARSB=",
        "USDARSCL" : "ARSB=CL",
        "USDARSBOL" : "ARSC=BOLSA",
    },
    url_template: (
        'http://www.ambito.com/economia/mercados/monedas/dolar/info/?ric=<<SYMBOL>>'
    ),
};

AmbitoPriceRequester.prototype = Object.create(PriceRequester.prototype);
AmbitoPriceRequester.prototype.constructor = AmbitoPriceRequester;

AmbitoPriceRequester.prototype.processResponse = function (response, body) {
    var $ = cheerio.load(body),
        bid = parseFloat($('#compra > big').text().replace(',','.')),
        ask = parseFloat($("#venta > big").text().replace(',','.')),
        updated_on = new Date(),
        uact_format = /(\d{2})\/(\d{2})\/(\d{4})(\d{2}):(\d{2})/,
        match = uact_format.exec($(".uact > b").text().trim()),
        published_on = new Date(parseInt(match[3]),
                                parseInt(match[2]) - 1,
                                parseInt(match[1]),
                                parseInt(match[4]),
                                parseInt(match[5]));
    
    return new messages.Price(this.getExchange(), 
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
        var AmbitoStreamer = Streamer(AmbitoPriceRequester,
                                      config.streaming.interval);
        registry = Registry.getInstance();
        registry.requesters.register(AmbitoPriceRequester.config.exchange,
                                     AmbitoPriceRequester);
        registry.streamers.register(AmbitoStreamer.config.exchange,
                                    AmbitoStreamer);
    }
};
