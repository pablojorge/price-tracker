var CachedPriceRequester = require('../models/CachedPriceRequester.js');

/**
 */
handler = function(requesters, broadcaster, cache) {
    function PriceRequestHandler(request) {
        this.request = request;
    }

    PriceRequestHandler.config = {
        handles: 'PriceRequest',
    };

    PriceRequestHandler.prototype.getRequester = function() {
        try {
            var requester = requesters.create(this.request.exchange,
                                              [this.request.symbol,
                                               this.request.options]);
            return new CachedPriceRequester(cache, this.request, requester);
        } catch(e) {
            throw ("Unknown exchange: " + this.request.exchange);
        }
    };

    PriceRequestHandler.prototype.processRequest = function (callback, errback) {
        try {
            var requester = this.getRequester();
            requester.doRequest(callback, errback);
        } catch(e) {
            errback(e, {
                exchange: this.request.exchange,
                symbol: this.request.symbol
            });
        }
    };

    return PriceRequestHandler;
};

module.exports = {
    register: function (handlers, requesters, broadcaster, cache) {
        handlers.register(
            'PriceRequest',
            handler(requesters, broadcaster, cache)
        );
    }
};
