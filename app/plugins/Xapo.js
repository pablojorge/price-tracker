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
    url_template: 'https://xapi.xapo.com/last',
};

XapoPriceRequester.prototype = Object.create(PriceRequester.prototype);
XapoPriceRequester.prototype.constructor = XapoPriceRequester;

XapoPriceRequester.prototype.processResponse = function (response, body) {
    var last = JSON.parse(body),
        bid = parseFloat(last.buy),
        ask = parseFloat(last.sell);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               bid,
                               ask);
};
/**/

module.exports = {
    register: function () {
        var XapoStreamer = Streamer(XapoPriceRequester,
                                    config.streaming.interval);
        Plugin_.register(XapoPriceRequester, XapoStreamer);
    }
};
