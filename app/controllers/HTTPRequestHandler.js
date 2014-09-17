var messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js');

var registry = Registry.getInstance();

function HTTPRequestHandler(ws) {
    this.ws = ws;
}

HTTPRequestHandler.prototype.handle = function(request, req, res) {
    var handler = registry.handlers.create(request.constructor.name, [request]);

    handler.processRequest(
        function(response) {
            console.log("serveRequest: response sent:", response);
            res.json(response);
        },
        function(exception, info) {
            res.status(500);
            console.log("serverRequest: error sent: ", exception);
            res.json(new messages.Error(exception.toString(), info));
        }
    );
};

