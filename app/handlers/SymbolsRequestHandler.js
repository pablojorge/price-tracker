var messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js');

var registry = Registry.getInstance();

/**
 */
function SymbolsRequestHandler(request) {
    this.request = request;
}

SymbolsRequestHandler.config = {
    handles: 'SymbolsRequest',
};

SymbolsRequestHandler.prototype.processRequest = function (callback) {
    try {
        var symbols = {};
        registry.requesters.keys().forEach(function (key) {
            var requester = registry.requesters.get(key);
            for (var symbol in requester.config.symbol_map) {
                if (!symbols[symbol]) {
                    symbols[symbol] = [];
                }
                symbols[symbol].push(requester.config.exchange);
            }
        });
        var ret = new messages.Symbols();
        for (var symbol in symbols) {
            ret.addSymbol(symbol, symbols[symbol]);
        }
        callback(null, ret);
    } catch(e) {
        callback({
            exception: e
        });
    }
};

module.exports = {
    register: function () {
        registry.handlers.register('SymbolsRequest', SymbolsRequestHandler);
    }
};
