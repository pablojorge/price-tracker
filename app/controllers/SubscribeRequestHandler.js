/**
 */
handler = function(requesters, broadcaster, cache) {
    function SubscribeRequestHandler(request) {
        this.request = request;
    }

    SubscribeRequestHandler.config = {
        handles: 'SubscribeRequest',
    };

    SubscribeRequestHandler.prototype.processRequest = function (callback, errback) {
        try {
            var exchange = this.request.exchange,
                symbol = this.request.symbol;
            return broadcaster.addListener(exchange, symbol, callback, errback);
        } catch(e) {
            errback(e, {
                exchange: this.request.exchange,
                symbol: this.request.symbol
            });
        }
    };

    return SubscribeRequestHandler;
};

module.exports = {
    register: function (handlers, requesters, broadcaster, cache) {
        handlers.register(
            'SubscribeRequest',
            handler(requesters, broadcaster, cache)
        );
    }
};
