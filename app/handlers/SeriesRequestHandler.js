var Registry = require('../models/Registry.js'),
    PriceStore = require('../models/PriceStore.js'),

    messages = require('../../public/lib/messages.js');

/**
 */
function SeriesRequestHandler(request) {
    this.request = request;
}

SeriesRequestHandler.config = {
    handles: 'SeriesRequest',
};

SeriesRequestHandler.prototype.processRequest = function (callback) {
    var self = this;

    try {
        var store = PriceStore.getInstance();
        store.getPrices(
            this.request.exchange,
            this.request.symbol,
            this.request.options.start,
            this.request.options.end,
            function (error, values) {
                if (error) {
                    callback(error);
                    return;
                }
                var series = new messages.Series(
                    self.request.exchange,
                    self.request.symbol
                );
                values.forEach(function (value) {
                    series.add(value.date, value.bid, value.ask);
                });
                callback(null, series);
            }
        );
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
