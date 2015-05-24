var CachedPriceRequester = require('../models/CachedPriceRequester.js'),
    Registry = require('../models/Registry.js'),
    Cache = require('../models/Cache.js');

var registry = Registry.getInstance(),
    cache = Cache.getInstance();

/**
 */
function SymbolRequestHandler(request) {
    this.request = request;
}

SymbolRequestHandler.config = {
    handles: 'SymbolRequest',
};

SymbolRequestHandler.prototype.getRequester = function() {
    try {
        var requester = registry.requesters.create(this.request.exchange,
                                                  [this.request.symbol,
                                                   this.request.options]);
        return new CachedPriceRequester(cache, this.request, requester);
    } catch(e) {
        throw ("Unknown exchange: " + this.request.exchange);
    }
};

SymbolRequestHandler.prototype.processRequest = function (callback) {
    try {
        var requester = this.getRequester();
        requester.doRequest(callback);
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
        registry.handlers.register('SymbolRequest', SymbolRequestHandler);
    }
};
