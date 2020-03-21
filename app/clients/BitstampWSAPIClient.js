const WebSocket = require('ws');

/**
 * Simple client for Bitstamp WS API
 */

function BitstampWSAPIClient(callback) {
    var url = ("wss://ws.bitstamp.net");

    this.connection = new WebSocket(url);
    this.connection.on('error', function (error) {
        callback({
            exception: error
        });
    });
}

BitstampWSAPIClient.prototype.subscribe = function (channel) {
    var self = this;

    this.connection.on('open', function () {
        var message = {
            event: "bts:subscribe",
            data: {channel: channel}
        };

        self.connection.send(JSON.stringify(message));
    });
};

BitstampWSAPIClient.prototype.bind = function (event, handler) {
    this.connection.on('message', function (message) {
        var payload = JSON.parse(message);
        if (payload.event === event) {
            handler(payload.data);
        }
    });
};

BitstampWSAPIClient.prototype.stop = function () {
    this.connection.close();
};

module.exports = BitstampWSAPIClient;