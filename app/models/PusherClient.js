var ws = require('ws');

/**
 * Simple client for Pusher
 */

function PusherClient(pusherId, callback) {
    var url = ("wss://ws.pusherapp.com/app/" + pusherId + 
               "?protocol=7&client=js&version=2.1.6&flash=false");

    this.connection = ws.connect(url);
    this.connection.on('error', function (error) {
        callback({
            exception: error
        });
    });
}

PusherClient.prototype.subscribe = function (channel) {
    var self = this;

    this.connection.on('open', function () {
        var message = {
            event: "pusher:subscribe",
            data: {channel: channel}
        };

        self.connection.send(JSON.stringify(message));
    });
};

PusherClient.prototype.bind = function (event, handler) {
    this.connection.on('message', function (message) {
        var payload = JSON.parse(message);
        if (payload.event === event) {
            handler(JSON.parse(payload.data));
        }
    });
};

PusherClient.prototype.stop = function () {
    this.connection.close();
};

module.exports = PusherClient;