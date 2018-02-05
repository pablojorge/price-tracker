var cheerio = require('cheerio'),
    config = require('../../config/config'),
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
        "USDARS" : "ARSSCBCRA",
        "USDARSB" : "ARSB=",
    },
    url_template: (
        'http://www.ambito.com.ar/economia/mercados/monedas/dolar/info/?ric=<<SYMBOL>>'
    ),
};

AmbitoPriceRequester.prototype = Object.create(PriceRequester.prototype);
AmbitoPriceRequester.prototype.constructor = AmbitoPriceRequester;

AmbitoPriceRequester.prototype.processResponse = function (response, body) {
    var $ = cheerio.load(body),
        bid = parseFloat($('.buy > span').text().replace(',','.')),
        ask = parseFloat($('.sale > span > strong').text().replace(',','.')),
        updated_on = new Date(),
        date_format = /(\d{2})\/(\d{2})\/(\d{4})/,
        hour_format = /(\d{2}):(\d{2})/,
        date_match = date_format.exec($(".last-update > p > strong").text().trim()),
        hour_match = hour_format.exec($(".last-update > strong").text().trim()),
        published_on = new Date(parseInt(date_match[3]),
                                parseInt(date_match[2]) - 1,
                                parseInt(date_match[1]),
                                parseInt(hour_match[1]),
                                parseInt(hour_match[2]));
    
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
        var AmbitoStreamer = Streamer(AmbitoPriceRequester,
                                      config.streaming.interval);
        Plugin_.register(AmbitoPriceRequester, AmbitoStreamer);
    }
};
