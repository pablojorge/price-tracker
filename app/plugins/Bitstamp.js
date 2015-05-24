var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    PusherClient = require('../models/PusherClient.js');

/**
 * Bitstamp
 */
function BitstampPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BitstampPriceRequester.config = {
    exchange: 'bitstamp',
    symbol_map: {
        "BTCUSD" : undefined
    },
    url_template: 'http://www.bitstamp.net/api/ticker/',
};

BitstampPriceRequester.register = function (factory) {
    factory.register();
};

BitstampPriceRequester.prototype = Object.create(PriceRequester.prototype);
BitstampPriceRequester.prototype.constructor = BitstampPriceRequester;

BitstampPriceRequester.prototype.processResponse = function (response, body) {
    var object = JSON.parse(body),
        bid = parseFloat(object.bid),
        ask = parseFloat(object.ask);
    return new messages.Price(this.getExchange(),
                              this.symbol,
                              bid,
                              ask,
                              new Date(), {
                                  volume24: parseFloat(object.volume),
                                  high24: parseFloat(object.high),
                                  low24: parseFloat(object.low),
                              });
};
/**/

/**
 * Bitstamp streamer
 */

function BitstampStreamer(symbol, callback) {
    this.client = new PusherClient('de504dc5763aeef9ff52', function (exception) {
        callback({
            exception: exception,
            info: {
                exchange: BitstampStreamer.config.exchange,
                symbol: symbol,
            }
        });
    });
    this.client.subscribe('order_book');
    this.client.bind('data', function (data) {
        callback(null,
                 new messages.Price("bitstamp", 
                                    symbol, 
                                    parseFloat(data.bids[0][0]), 
                                    parseFloat(data.asks[0][0])));
    });
}

BitstampStreamer.config = {
    exchange: 'bitstamp',
};

BitstampStreamer.prototype.stop = function () {
    this.client.stop();
};

module.exports = {
    register: function () {
        registry = Registry.getInstance();
        registry.requesters.register(BitstampPriceRequester.config.exchange,
                                     BitstampPriceRequester);
        registry.streamers.register(BitstampStreamer.config.exchange,
                                    BitstampStreamer);
    }
};
/**/