var fs = require('fs'),
    ws = require('ws'),
    http = require('http'),
    express = require('express');

var config = require('./config/config.js'),
    messages = require('./public/lib/messages.js'),
    Registry = require('./app/models/Registry.js'),
    HTTPRequestHandler = require('./app/controllers/HTTPRequestHandler.js'),
    WSClientHandler = require('./app/controllers/WSClientHandler.js');

var app = express(),
    registry = Registry.getInstance();

var modules_dirs = ['./app/plugins/',
                    './app/handlers/'];

// Force all dates to be handled in UTC:
process.env.tz = 'UTC';

modules_dirs.forEach(function (modules_dir) {
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
});

app.use(express.static(__dirname + '/public'));

app.get("/api/v1/symbols/:symbol/:exchange", function(req, res) {
    var symbol = req.params.symbol,
        exchange = req.params.exchange,
        request = new messages.SymbolRequest(symbol, exchange);
    var handler = new HTTPRequestHandler(ws);
    handler.handle(request, req, res);
});

app.get("/api/v1/symbols/:symbol/:exchange/series", function(req, res) {
    var symbol = req.params.symbol,
        exchange = req.params.exchange,
        start = req.query.start,
        end = req.query.end,
        request = new messages.SeriesRequest(symbol, exchange, {
            start: start,
            end: end
        });
    var handler = new HTTPRequestHandler(ws);
    handler.handle(request, req, res);
});

app.get("/api/v1/symbols", function(req, res) {
    var request = new messages.SymbolsRequest();
    var handler = new HTTPRequestHandler(ws);
    handler.handle(request, req, res);
});

app.get("/api/v1/exchanges", function(req, res) {
    var request = new messages.ExchangesRequest();
    var handler = new HTTPRequestHandler(ws);
    handler.handle(request, req, res);
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

