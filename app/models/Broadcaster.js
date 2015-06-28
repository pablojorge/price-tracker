var Registry = require('../models/Registry.js');

var registry = Registry.getInstance();

/**
 */
function Broadcaster() {
    this.stream = {};
}

Broadcaster.instance = null;

Broadcaster.getInstance = function () {
    if (!Broadcaster.instance) {
        Broadcaster.instance = new Broadcaster();
    }

    return Broadcaster.instance;
};

Broadcaster.deleteInstance = function () {
    if (Broadcaster.instance) {
        Broadcaster.instance = null;
    }
};

Broadcaster.prototype.addListener = function(exchange, symbol, callback) {
    var self = this;

    if (this.stream[exchange] === undefined) {
        this.stream[exchange] = {};
    }

    if (this.stream[exchange][symbol] === undefined) {
        this.stream[exchange][symbol] = [];
    }

    var removeCb = function () {
        self.removeListener(exchange, symbol, callback);
    };

    this.stream[exchange][symbol].push(callback);
    return removeCb;
};

Broadcaster.prototype.removeListener = function (exchange, symbol, listener) {
    var listeners = this.stream[exchange][symbol];

    console.log("Broadcaster: removing listener for", exchange, symbol);
    var index = listeners.indexOf(listener);
    listeners.splice(index, 1);
};

Broadcaster.prototype.listener = function (error, response) {
    var exchange = response.data.exchange,
        symbol = response.data.symbol;

    if (this.stream[exchange] === undefined ||
        this.stream[exchange][symbol] === undefined) {
        console.log("Broadcaster: no listeners for", exchange, symbol);
        return;
    }

    var listeners = this.stream[exchange][symbol];

    listeners.forEach(function (listener) {
        listener(error, response);
    });
};

module.exports = Broadcaster;