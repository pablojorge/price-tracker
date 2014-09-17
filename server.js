var fs = require('fs'),
    ws = require('ws'),
    http = require('http'),
    express = require('express'),

    // custom modules:
    config = require('./config/config.js'),
    messages = require('./public/lib/messages.js'),

    Registry = require('./app/models/Registry.js'),

    // global objects
    app = express(),
    registry = Registry.getInstance();

// load plugins
(function () {
    var plugins_dir = './app/plugins/';

    fs.readdir(plugins_dir, function (err, files) {
        var extension = '.js';
        
        files.forEach(function (file) {
            if (file.lastIndexOf(extension) != 
                (file.length - extension.length))
                return;

            var plugin = require(plugins_dir + file);
            plugin.register();
        });
    });
})();

// load controllers
(function () {
    var controllers_dir = './app/controllers/';

    fs.readdir(controllers_dir, function (err, files) {
        var extension = '.js';

        files.forEach(function (file) {
            if (file.lastIndexOf(extension) !=
                (file.length - extension.length))
                return;

            var controller = require(controllers_dir + file);
            controller.register();
        });
    });
})();

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

    ws.on('message', function(message) {
        console.log("WSServer: message received: " + message);
        try {
            var request = messages.Request.fromString(message);
            var handler = registry.handlers.create(request.constructor.name, [request]);

            var ret = handler.processRequest(
                function(response) {
                    ws.send(response.toString(), function() {
                        console.log("WSServer: response sent: " + response);
                    });
                }, 
                function(exception, info) {
                    error = new messages.Error(exception.toString(), info);
                    console.log("WSServer: errback: exception: " + exception);
                    ws.send(error.toString(), function() {
                        console.log("WSServer: error sent");
                    });
                }
            );

            if (ret !== undefined) {
                ws.on('close', ret);
            }
        } catch(exception) {
            error = new messages.Error(exception.toString());
            console.log("WSServer: catch exception: " + exception);
            ws.send(error.toString(), function() {
                console.log("error sent");
            });
        }
    });

    ws.on('close', function() {
        console.log('WSServer: websocket connection close');
    });
});

