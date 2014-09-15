var fs = require('fs'),
    ws = require('ws'),
    http = require('http'),
    express = require('express'),

    // custom modules:
    messages = require('./public/lib/messages.js'),
    patterns = require('./public/lib/patterns.js'),

    InternalCache = require('./app/models/InternalCache.js'),
    RedisCache = require('./app/models/RedisCache.js'),
    CachedPriceRequester = require('./app/models/CachedPriceRequester.js'),
    Broadcaster = require('./app/models/Broadcaster.js'),

    // global objects
    app = express(),
    port = process.env.PORT || 5000,
    cache = new ({
        'internal' : InternalCache,
        'redis' : RedisCache
    }[process.env.CACHE])(parseInt(process.env.CACHE_TTL), {
        rediscloud_url: process.env.REDISCLOUD_URL,
    }),
    handlers = new patterns.Factory(),
    requesters = new patterns.Factory(),
    streamers = new patterns.Factory(),
    broadcaster = new Broadcaster(streamers),
    streaming_interval = parseInt(process.env.STREAMING_INTERVAL);

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
            plugin.register(requesters, streamers, {
                streaming_interval: streaming_interval,
            });
        });
    });
})();

app.use(express.static(__dirname + '/public'));

function serveRequest(request, req, res) {
    var handler = handlers.create(request.constructor.name, [request]);

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
server.listen(port);

console.log('main: http server listening on %d', port);

var wss = new ws.Server({server: server});

console.log('main: websocket server created');

wss.on('connection', function(ws) {
    console.log('WSServer: websocket connection open');

    ws.on('message', function(message) {
        console.log("WSServer: message received: " + message);
        try {
            var request = messages.Request.fromString(message);
            var handler = handlers.create(request.constructor.name, [request]);

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

/**
 */
function PriceRequestHandler(request) {
    this.request = request;
}

PriceRequestHandler.prototype.getRequester = function() {
    try {
        var requester = requesters.create(this.request.exchange, 
                                          [this.request.symbol,
                                           this.request.options]);
        return new CachedPriceRequester(cache, this.request, requester);
    } catch(e) {
        throw ("Unknown exchange: " + this.request.exchange);
    }
};

PriceRequestHandler.prototype.processRequest = function (callback, errback) {
    try {
        var requester = this.getRequester();
        requester.doRequest(callback, errback);
    } catch(e) {
        errback(e, {
            exchange: this.request.exchange,
            symbol: this.request.symbol
        });
    }
};

handlers.register("PriceRequest", PriceRequestHandler);

/**
 */
function ExchangesRequestHandler(request) {
    this.request = request;
}

ExchangesRequestHandler.prototype.processRequest = function (callback, errback) {
    try {
        var exchanges = new messages.Exchanges();
        requesters.keys().forEach(function (key) {
            var requester = requesters.get(key),
                symbols = [];
            for (var symbol in requester.config.symbol_map) {
                symbols.push(symbol);
            }
            exchanges.addExchange(requester.config.exchange, symbols);
        });
        callback(exchanges);
    } catch(e) {
        errback(e);
    }
};

handlers.register("ExchangesRequest", ExchangesRequestHandler);

/**
 */
function SubscribeRequestHandler(request) {
    this.request = request;
}

SubscribeRequestHandler.prototype.processRequest = function (callback, errback) {
    try {
        var exchange = this.request.exchange,
            symbol = this.request.symbol;
        return broadcaster.addListener(exchange, symbol, callback, errback);
    } catch(e) {
        errback(e, {
            exchange: this.request.exchange,
            symbol: this.request.symbol
        });
    }
};

handlers.register("SubscribeRequest", SubscribeRequestHandler);
