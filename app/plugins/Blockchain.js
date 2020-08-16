var messages = require('../../public/lib/messages.js'),
    config = require('../../config/config'),
    Plugin_ = require('../models/Plugin.js'),
    PriceRequester = require('../models/PriceRequester.js'),
    BlockchainWSAPIClient = require('../clients/BlockchainWSAPIClient.js');

/**
 * Blockchain
 */
function BlockchainPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BlockchainPriceRequester.config = {
    exchange: 'blockchain',
    symbol_map: {
        "BTCUSD" : "BTC-USD",
        "BCHUSD" : "BCH-USD",
        "ETHUSD" : "ETH-USD",
        "LTCUSD" : "LTC-USD",
        "XLMUSD" : "XLM-USD",
        "XRPUSD" : "XRP-USD",
    },
    url_template: 'https://api.blockchain.com/v3/exchange/tickers/<<SYMBOL>>',
};

BlockchainPriceRequester.register = function (factory) {
    factory.register();
};

BlockchainPriceRequester.prototype = Object.create(PriceRequester.prototype);
BlockchainPriceRequester.prototype.constructor = BlockchainPriceRequester;

BlockchainPriceRequester.prototype.processResponse = function (response, body) {
    var object = JSON.parse(body),
        price = parseFloat(object.last_trade_price);
    return new messages.Symbol(this.getExchange(),
                               this.symbol,
                               price,
                               price,
                               new Date(), {
                                   volume24: parseFloat(object.volume_24h),
                               });
};
/**/

/**
 * Blockchain streamer
 */

function BlockchainStreamer(symbol, callback) {
    this.client = new BlockchainWSAPIClient(function (exception) {
        callback({
            exception: exception,
            info: {
                exchange: BlockchainStreamer.config.exchange,
                symbol: symbol,
            }
        });
    });

    this.client.subscribe(
        BlockchainPriceRequester.config.symbol_map[symbol]
    );

    this.client.bind('updated', function (data) {
        if (!data.last_trade_price)
            return;

        var custom = {}

        if (data.volume_24h) {
            custom.volume24 = data.volume_24h;
        }

        callback(null,
                 new messages.Symbol(BlockchainStreamer.config.exchange, 
                                     symbol, 
                                     parseFloat(data.last_trade_price), 
                                     parseFloat(data.last_trade_price),
                                     new Date(),
                                     custom));
    });
}

BlockchainStreamer.config = {
    exchange: 'blockchain',
};

BlockchainStreamer.prototype.stop = function () {
    this.client.stop();
};

module.exports = {
    register: function () {
        Plugin_.register(BlockchainPriceRequester, BlockchainStreamer);
    },
};
/**/