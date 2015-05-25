var CachedPriceRequester = require('../models/CachedPriceRequester.js'),
    Registry = require('../models/Registry.js'),
    Cache = require('../models/Cache.js'),
    messages = require('../../public/lib/messages.js');

var registry = Registry.getInstance(),
    cache = Cache.getInstance();

/**
 */
function SeriesRequestHandler(request) {
    this.request = request;
}

SeriesRequestHandler.config = {
    handles: 'SeriesRequest',
};

SeriesRequestHandler.prototype.getRequester = function() {
    try {
        var requester = registry.requesters.create(this.request.exchange,
                                                  [this.request.symbol,
                                                   this.request.options]);
        return new CachedPriceRequester(cache, this.request, requester);
    } catch(e) {
        throw ("Unknown exchange: " + this.request.exchange);
    }
};

SeriesRequestHandler.prototype.processRequest = function (callback) {
    try {
        var requester = this.getRequester();
        requester.doRequest(function (error, response) {
            if (error !== null) {
                callback(error);
            } else {
                var series = new messages.Series(
                    response.data.exchange,
                    response.data.symbol
                );
                for(var i = 10; i >= 0; --i) {
                    series.add(
                        new Date(new Date(response.data.updated_on) - 3600*1000*i),
                        response.data.bid*(100-i)/100,
                        response.data.ask*(100-i)/100
                    );
                }
                callback(null, series);
            }
        });
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
        registry.handlers.register('SeriesRequest', SeriesRequestHandler);
    }
};
