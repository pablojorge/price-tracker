var Registry = require('../models/Registry.js'),
    PriceStore = require('../models/PriceStore.js'),
    messages = require('../../public/lib/messages.js');

var registry = Registry.getInstance(),
    store = PriceStore.getInstance();

/**
 */
function SymbolRequestHandler(request) {
    this.request = request;
}

SymbolRequestHandler.config = {
    handles: 'SymbolRequest',
};

SymbolRequestHandler.prototype.processRequest = function (callback) {
    try {
        store.getLastPrice(this.request.exchange, this.request.symbol, function (error, data) {
            if (error)
                return callback(error);

            var symbol = new messages.Symbol();
            symbol.data = data;
            callback(null, symbol);
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
        registry.handlers.register('SymbolRequest', SymbolRequestHandler);
    }
};
