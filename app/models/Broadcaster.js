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
        var streamer = registry.streamers.create(
            exchange, [
                symbol,
                function (error, response) {
                    if (error === null) {
                        if (!self.stream[exchange][symbol]) {
                            console.log("Broadcaster: WARNING tried to broadcast data from",
                                        exchange, symbol);
                            return;
                        }
                        self.stream[exchange][symbol].listeners.forEach(function (listener) {
                            listener(null, response);
                        });
                    } else {
                        if (!self.stream[exchange][symbol]) {
                            console.log("Broadcaster: WARNING tried to broadcast error from",
                                        exchange, symbol);
                            return;
                        }
                        self.stream[exchange][symbol].listeners.forEach(function (listener) {
                            listener({
                                exception: exception,
                                info: info
                            });
                        });
                    }
                },
            ]
        );

        this.stream[exchange][symbol] = {
            streamer: streamer,
            listeners: [],
        };        
    }

    var removeCb = function () {
        self.removeListener(exchange, symbol, callback);
    };

    this.stream[exchange][symbol].listeners.push(callback);
    return removeCb;
};

Broadcaster.prototype.removeListener = function (exchange, symbol, listener) {
    var stream = this.stream[exchange][symbol];
    var listeners = stream.listeners;
    var streamer = stream.streamer;

    console.log("Broadcaster: removing listener for", exchange, symbol);
    var index = listeners.indexOf(listener);
    listeners.splice(index, 1);

    if (!listeners.length) {
        console.log("Broadcaster: no more listeners for", exchange, symbol);
        streamer.stop();

        this.stream[exchange][symbol] = undefined;
    }
};

module.exports = Broadcaster;