var Registry = require('../models/Registry.js'),
    PriceStore = require('../models/PriceStore.js');

/**
 */
function SeriesRequestHandler(request) {
    this.request = request;
}

SeriesRequestHandler.config = {
    handles: 'SeriesRequest',
};

SeriesRequestHandler.prototype.processRequest = function (callback) {
    try {
        var store = PriceStore.getInstance();
        callback(null, store.getPrices(this.request.exchange, this.request.symbol));
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
        var registry = Registry.getInstance();

        registry.handlers.register('SeriesRequest', SeriesRequestHandler);
    }
};
