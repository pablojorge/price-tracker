var messages = require('../public/lib/messages.js'),
    PriceRequester = require('../lib/PriceRequester.js'),
    PusherClient = require('../lib/PusherClient.js');

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
        buy = parseFloat(object.bid),
        sell = parseFloat(object.ask);
    return new messages.Price(this.getExchange(), this.symbol, buy, sell);
};
/**/

/**
 * Bitstamp streamer
 */

function BitstampStreamer(symbol, callback) {
    this.client = new PusherClient('de504dc5763aeef9ff52', function (err) {
        callback(err);        
    });
    this.client.subscribe('order_book');
    this.client.bind('data', function (data) {
        callback(null, new messages.Price("bitstamp", 
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
    register: function (requesters, streamers, options) {
        requesters.register(BitstampPriceRequester.config.exchange,
                            BitstampPriceRequester);
        streamers.register(BitstampStreamer.config.exchange,
                           BitstampStreamer);
    }
};
/**/