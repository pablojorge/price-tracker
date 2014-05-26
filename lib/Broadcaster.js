/**
 */
function Broadcaster(streamers) {
    this.streamers = streamers;
    this.stream = {};
}

Broadcaster.prototype.addListener = function(exchange, symbol, callback, errback) {
    var self = this;

    if (this.stream[exchange] === undefined) {
        this.stream[exchange] = {};
    }

    if (this.stream[exchange][symbol] === undefined) {
        var updateFn = function (error, data) {
            self.stream[exchange][symbol].listeners.forEach(function (listener) {
                if (error) {
                    listener.errback(error);
                } else {
                    listener.callback(data);
                }
            });
        };

        var streamer = this.streamers.create(exchange, [symbol, updateFn]);

        this.stream[exchange][symbol] = {
            streamer: streamer,
            listeners: [],
        };        
    }

    var listener = {
        errback: errback,
        callback: callback
    };

    var removeCb = function () {
        self.removeListener(exchange, symbol, listener);
    };

    this.stream[exchange][symbol].listeners.push(listener);
    return removeCb;
};

Broadcaster.prototype.removeListener = function (exchange, symbol, listener) {
    var stream = this.stream[exchange][symbol];
    var listeners = stream.listeners;
    var streamer = stream.streamer;

    console.log("Removing listener for", exchange, symbol);
    var index = listeners.indexOf(listener);
    listeners.splice(index, 1);

    if (!listeners.length) {
        console.log("No more listeners for", exchange, symbol);
        streamer.stop();

        this.stream[exchange][symbol] = undefined;
    }
};

module.exports = Broadcaster;