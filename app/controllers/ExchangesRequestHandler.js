var messages = require('../../public/lib/messages.js');

/**
 */
handler = function(requesters, broadcaster, cache) {
    function ExchangesRequestHandler(request) {
        this.request = request;
    }

    ExchangesRequestHandler.config = {
        handles: 'ExchangesRequest',
    };

    ExchangesRequestHandler.prototype.processRequest = function (callback, errback) {
        try {
            var exchanges = new messages.Exchanges();
            requesters.keys().forEach(function (key) {
                var requester = requesters.get(key),
                    symbols = [];
                for (var symbol in requester.config.symbol_map) {
                    symbols.push(symbol);
                }
                exchanges.addExchange(requester.config.exchange, symbols);
            });
            callback(exchanges);
        } catch(e) {
            errback(e);
        }
    };

    return ExchangesRequestHandler;
};

module.exports = {
    register: function (handlers, requesters, broadcaster, cache) {
        handlers.register(
            'ExchangesRequest',
            handler(requesters, broadcaster, cache)
        );
    }
};
