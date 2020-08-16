const WebSocket = require('ws');

/**
 * Client for Blockchain WS API
 */

function BlockchainWSAPIClient(callback) {
    var url = ("wss://ws.prod.blockchain.info/mercury-gateway/v1/ws"),
        origin = "https://exchange.blockchain.com";

    this.connection = new WebSocket(url, [], {origin: origin});
    this.connection.on('error', function (error) {
        callback({
            exception: error
        });
    });
}

BlockchainWSAPIClient.prototype.subscribe = function (symbol) {
    var self = this;

    this.connection.on('open', function () {
        var message = {
            action: "subscribe",
            channel: "ticker",
            symbol: symbol
        };

        self.connection.send(JSON.stringify(message));
    });
};

BlockchainWSAPIClient.prototype.bind = function (event, handler) {
    this.connection.on('message', function (message) {
        var payload = JSON.parse(message);
        if (payload.event === event) {
            handler(payload);
        }
    });
};

BlockchainWSAPIClient.prototype.stop = function () {
    this.connection.close();
};

module.exports = BlockchainWSAPIClient;