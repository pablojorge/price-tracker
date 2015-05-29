var Registry = require('../models/Registry.js'),
    Broadcaster = require('../models/Broadcaster.js');

var registry = Registry.getInstance(),
    broadcaster = Broadcaster.getInstance();

/**
 */
function SubscribeRequestHandler(request) {
    this.request = request;
}

SubscribeRequestHandler.config = {
    handles: 'SubscribeRequest',
};

SubscribeRequestHandler.prototype.processRequest = function (callback) {
    try {
        var exchange = this.request.exchange,
            symbol = this.request.symbol;
        return broadcaster.addListener(exchange, symbol, callback);
    } catch(e) {
        callback({
            exception: e,
            info: {
                exchange: this.request.exchange,
                symbol: this.request.symbol
            }
        });
    }
};

module.exports = {
    register: function () {
        registry.handlers.register('SubscribeRequest', SubscribeRequestHandler);
    }
};
