var io = require('socket.io-client'),
    messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Registry = require('../models/Registry.js'),
    PriceRequester = require('../models/PriceRequester.js');

/**
 * Coinsetter
 */
function CoinsetterPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

CoinsetterPriceRequester.config = {
    exchange: 'coinsetter',
    symbol_map: {
        "BTCUSD" : undefined
    },
    url_template: 'https://api.coinsetter.com/v1/marketdata/ticker',
};

CoinsetterPriceRequester.register = function (factory) {
    factory.register();
};

CoinsetterPriceRequester.prototype = Object.create(PriceRequester.prototype);
CoinsetterPriceRequester.prototype.constructor = CoinsetterPriceRequester;

CoinsetterPriceRequester.prototype.processResponse = function (response, body) {
    var object = JSON.parse(body),
        bid = parseFloat(object.bid.price),
        ask = parseFloat(object.ask.price),
        updated_on = new Date();

    return new messages.Price(this.getExchange(),
                              this.symbol,
                              bid,
                              ask,
                              updated_on, {
                                  volume24: object.volume24
                              });
};
/**/

/**
 * Coinsetter streamer
 */

function CoinsetterStreamer(symbol, callback, errback) {
    this.socket = io.connect('https://plug.coinsetter.com:3000');

    this.socket.on('connect', function (data) {
        this.socket.emit('ticker room', '');
    });

    this.socket.on('ticker', function (data){
        callback(new messages.Price("coinsetter",
                                    symbol,
                                    parseFloat(data.bid.price),
                                    parseFloat(data.ask.price)),
                                    new Date(), {
                                        volume24: data.volume24
                                    });
    });
}

CoinsetterStreamer.config = {
    exchange: 'coinsetter',
};

CoinsetterStreamer.prototype.stop = function () {
    this.socket.disconnect();
};

module.exports = {
    register: function () {
        registry = Registry.getInstance();
        registry.requesters.register(CoinsetterPriceRequester.config.exchange,
                                     CoinsetterPriceRequester);
        registry.streamers.register(CoinsetterStreamer.config.exchange,
                                   CoinsetterStreamer);
    }
};
/**/