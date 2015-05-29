var messages = require('../../public/lib/messages.js'),
    Registry = require('../models/Registry.js');

var registry = Registry.getInstance();

function HTTPRequestHandler(ws) {
    this.ws = ws;
}

HTTPRequestHandler.prototype.handle = function(request, req, res) {
    var handler = registry.handlers.create(request.constructor.name, [request]);

    handler.processRequest(
        function(error, response) {
            if (error === null) {
                console.log("serveRequest: response sent:", response);
                res.json(response);
            } else {
                res.status(500);
                console.log("serverRequest: error sent: ", error.exception);
                res.json(new messages.Error(error.exception.toString(), error.info));
            }
        }
    );
};

module.exports = HTTPRequestHandler;