var fs = require('fs'),
    ws = require('ws'),
    http = require('http'),
    express = require('express');

var config = require('./config/config.js'),
    messages = require('./public/lib/messages.js'),
    Registry = require('./app/models/Registry.js'),
    WSClientHandler = require('./app/controllers/WSClientHandler.js');

var app = express(),
    registry = Registry.getInstance();

function loadModules(modules_dir) {
    fs.readdir(modules_dir, function (err, files) {
        var extension = '.js';

        files.forEach(function (file) {
            if (file.lastIndexOf(extension) !=
                (file.length - extension.length))
                return;

            var module = require(modules_dir + file);
            module.register();
        });
    });
}

loadModules('./app/plugins/');
loadModules('./app/handlers/');

app.use(express.static(__dirname + '/public'));

function serveRequest(request, req, res) {
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
}

app.get("/request/price/:exchange/:symbol", function(req, res) {
    var exchange = req.params.exchange,
        symbol = req.params.symbol,
        request = new messages.PriceRequest(exchange, symbol);
    serveRequest(request, req, res);
});

app.get("/request/exchanges", function(req, res) {
    var request = new messages.ExchangesRequest();
    serveRequest(request, req, res);
});

var server = http.createServer(app);
server.listen(config.server.port);

console.log('main: http server listening on %d', config.server.port);

var wss = new ws.Server({server: server});

console.log('main: websocket server created');

wss.on('connection', function(ws) {
    console.log('WSServer: websocket connection open');

    var handler = new WSClientHandler(ws);

    ws.on('message', function(message) {
        console.log("WSServer: message received: " + message);
        handler.handle_message(message);
    });

    ws.on('close', function() {
        console.log('WSServer: websocket connection close');
    });
});

