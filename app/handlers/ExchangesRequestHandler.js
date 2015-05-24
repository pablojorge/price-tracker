var messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js');

var registry = Registry.getInstance();

/**
 */
function ExchangesRequestHandler(request) {
    this.request = request;
}

ExchangesRequestHandler.config = {
    handles: 'ExchangesRequest',
};

ExchangesRequestHandler.prototype.processRequest = function (callback) {
    try {
        var exchanges = new messages.Exchanges();
        registry.requesters.keys().forEach(function (key) {
            var requester = registry.requesters.get(key),
                symbols = [];
            for (var symbol in requester.config.symbol_map) {
                symbols.push(symbol);
            }
            exchanges.addExchange(requester.config.exchange, symbols);
        });
        callback(null, exchanges);
    } catch(e) {
        callback({
            exception: e
        });
    }
};

module.exports = {
    register: function () {
        registry.handlers.register('ExchangesRequest', ExchangesRequestHandler);
    }
};
