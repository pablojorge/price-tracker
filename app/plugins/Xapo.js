var async = require('async'),
    config = require('../../config/config'),
    messages = require('../../public/lib/messages.js'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    Streamer = require('../models/Streamer.js');

/**
 * Xapo
 */

function XapoPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

XapoPriceRequester.config = {
    exchange: 'xapo',
    symbol_map: {
        "BTCUSD" : undefined
    },
    url_template: 'https://www.xapo.com/',
};

XapoPriceRequester.prototype = Object.create(PriceRequester.prototype);
XapoPriceRequester.prototype.constructor = XapoPriceRequester;

// We must override doRequest() because two different requests are needed
// to get the buy and sell prices
XapoPriceRequester.prototype.doRequest = function (callback) {
    var self = this;

    async.map(
        ['https://api.xapo.com/quote/xbuys',
         'https://api.xapo.com/quote/xsells'],
        function (item, cb) {
            self.__doRequest(item, null, cb);
        },
        function (err, results) {
            if (err !== null) {
                callback({
                    exception: err,
                    info: {
                        exchange: self.getExchange(),
                        symbol: self.symbol,
                    }
                });
            } else {
                callback(null,
                         new messages.Symbol(self.getExchange(),
                                             self.symbol,
                                             results[0],
                                             results[1]));
            }
        }
    );
};

XapoPriceRequester.prototype.processResponse = function (response, body) {
    return parseFloat(JSON.parse(body).price);
};
/**/

module.exports = {
    register: function () {
        var XapoStreamer = Streamer(XapoPriceRequester,
                                    config.streaming.interval);
        Plugin_.register(XapoPriceRequester, XapoStreamer);
    }
};
