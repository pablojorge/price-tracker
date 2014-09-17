var messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js');

var registry = Registry.getInstance();

function WSClientHandler(ws) {
    this.ws = ws;
}

WSClientHandler.prototype.handle_message = function(message) {
    var self = this;

    try {
        var request = messages.Request.fromString(message);
        var handler = registry.handlers.create(request.constructor.name, [request]);

        var ret = handler.processRequest(
            function(response) {
                self.ws.send(response.toString(), function() {
                    console.log("WSServer: response sent: " + response);
                });
            },
            function(exception, info) {
                error = new messages.Error(exception.toString(), info);
                console.log("WSServer: errback: exception: " + exception);
                self.ws.send(error.toString(), function() {
                    console.log("WSServer: error sent");
                });
            }
        );

        if (ret !== undefined) {
            self.ws.on('close', ret);
        }
    } catch(exception) {
        error = new messages.Error(exception.toString());
        console.log("WSServer: catch exception: " + exception);
        self.ws.send(error.toString(), function() {
            console.log("error sent");
        });
    }
};

module.exports = WSClientHandler;