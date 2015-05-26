var messages = require('../../public/lib/messages.js');

/**
 */
function PriceStore() {
    this.store = {};
}

PriceStore.instance = null;

PriceStore.getInstance = function () {
    if (!PriceStore.instance) {
        PriceStore.instance = new PriceStore();
    }

    return PriceStore.instance;
};

PriceStore.deleteInstance = function () {
    if (PriceStore.instance) {
        PriceStore.instance = null;
    }
};

PriceStore.prototype.symbolHash = function(exchange, symbol) {
    return symbol + "@" + exchange;
};

PriceStore.prototype.listener = function(error, response) {
    var self = this;

    if (error !== null) {
        console.log("PriceStore: WARNING ignoring error:", error);
        return;
    }

    var hash = this.symbolHash(response.data.exchange, response.data.symbol);

    if (this.store[hash] === undefined) {
        console.log("PriceStore: Initializing store for", hash);
        this.store[hash] = new messages.Series(
            response.data.exchange,
            response.data.symbol
        );
    }

    var series = this.store[hash],
        last = series.last();

    // Only store the received data if it differs from the last we have:
    if (last === undefined ||
        last.bid !== response.data.bid ||
        last.ask !== response.data.ask) {
        series.add(
            response.data.updated_on,
            response.data.bid,
            response.data.ask
        );
    }
};

PriceStore.prototype.getPrices = function(exchange, symbol, start, end) {
    return this.store[this.symbolHash(exchange, symbol)];
};

module.exports = PriceStore;