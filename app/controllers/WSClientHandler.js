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
            function(error, response) {
                if (error === null) {
                    self.ws.send(response.toString(), function() {
                        console.log("WSServer: response sent: " + response);
                    });
                } else {
                    var error_msg = new messages.Error(error.exception.toString(), error.info);
                    console.log("WSServer: exception: " + error.exception);
                    self.ws.send(error_msg.toString(), function() {
                        console.log("WSServer: error sent: " + error_msg);
                    });
                }
            }
        );

        if (ret !== undefined) {
            self.ws.on('close', ret);
        }
    } catch(exception) {
        var error_msg = new messages.Error(exception.toString());
        console.log("WSServer: catch exception: " + exception);
        self.ws.send(error_msg.toString(), function() {
            console.log("error sent");
        });
    }
};

module.exports = WSClientHandler;