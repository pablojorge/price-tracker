var ws = require('ws'),
    http = require('http'),
    async = require('async'),
    express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    redis = require('redis'),
    url = require('url'),

  // custom modules:
    messages = require('./messages.js'),

    app = express(),
    port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

function serveRequest(request, req, res) {
    var factory = new RequestHandlerFactory(),
        handler = factory.getHandler(request);

    handler.processRequest(
        function(response) {
            console.log("response sent: " + response);
            res.json(response);
        },
        function(exception, info) {
            res.status(500);
            console.log("error sent: " + exception);
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

console.log('http server listening on %d', port);

var wss = new ws.Server({server: server});

console.log('websocket server created');

wss.on('connection', function(ws) {
    console.log('websocket connection open');

    ws.on('message', function(message) {
        console.log("message received: " + message);
        try {
            var request = messages.Request.fromString(message);
            var factory = new RequestHandlerFactory();
            var handler = factory.getHandler(request);

            var ret = handler.processRequest(
                function(response) {
                    ws.send(response.toString(), function() {
                        console.log("response sent: " + response);
                    });
                }, 
                function(exception, info) {
                    error = new messages.Error(exception.toString(), info);
                    console.log("exception: " + exception);
                    ws.send(error.toString(), function() {
                        console.log("error sent");
                    });
                }
            );

            if (ret !== undefined) {
                ws.on('close', ret);
            }
        } catch(exception) {
            error = new messages.Error(exception.toString());
            console.log("exception: " + exception);
            ws.send(error.toString(), function() {
                console.log("error sent");
            });
        }
    });

    ws.on('close', function() {
        console.log('websocket connection close');
    });
});

/**
 */
function RequestHandlerFactory() {}
RequestHandlerFactory.handlers = {};
RequestHandlerFactory.addHandler = function(type, handler) {
    RequestHandlerFactory.handlers[type] = handler;
};

RequestHandlerFactory.prototype.getHandler = function(request) {
    var handler = RequestHandlerFactory.handlers[request.constructor.name];
    if (handler === undefined)
        throw ("Invalid type: " + request);
    return new handler(request);
};

/**
 */
function PriceRequestHandler(request) {
    this.request = request;
}

PriceRequestHandler.requesters = {};
PriceRequestHandler.cache = new ({
    "internal" : InternalCache,
    "redis" : RedisCache
}[process.env.CACHE])(parseInt(process.env.CACHE_TTL));

PriceRequestHandler.addRequester = function(requester) {
    PriceRequestHandler.requesters[requester.config.exchange] = requester;
};

PriceRequestHandler.prototype.getRequester = function() {
    var requester = PriceRequestHandler.requesters[this.request.exchange];
    if (requester === undefined)
        throw ("Unknown exchange: " + this.request.exchange);
    return new CachedPriceRequester(PriceRequestHandler.cache,
                                    this.request,
                                    new requester(this.request.symbol,
                                                  this.request.options));
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

PriceRequestHandler.handles = "PriceRequest";
RequestHandlerFactory.addHandler(PriceRequestHandler.handles, 
                                 PriceRequestHandler);

/**
 */
function ExchangesRequestHandler(request) {
    this.request = request;
}

ExchangesRequestHandler.prototype.processRequest = function (callback, errback) {
    try {
        var exchanges = new messages.Exchanges();
        for (var exchange in PriceRequestHandler.requesters) {
            var requester = PriceRequestHandler.requesters[exchange],
                symbols = [];
            for (var symbol in requester.config.symbol_map) {
                symbols.push(symbol);
            }
            exchanges.addExchange(requester.config.exchange, symbols);
        }
        callback(exchanges);
    } catch(e) {
        errback(e);
    }
};

ExchangesRequestHandler.handles = "ExchangesRequest";
RequestHandlerFactory.addHandler(ExchangesRequestHandler.handles, 
                                 ExchangesRequestHandler);

/**
 */
function Factory() {
    this.constructors = {};
}

Factory.prototype.register = function (key, constructor) {
    this.constructors[key] = constructor;
};

Factory.prototype.create = function (key, args) {
    var constructor = this.constructors[key];
    
    if (constructor === undefined) {
        throw "Unknown constructor: " + key;
    }

    var object = Object.create(constructor.prototype);
    constructor.apply(object, args);
    
    return object;
};

/**
 */
function Broadcaster() {
    this.stream = {};
}

Broadcaster.streamers = new Factory();

Broadcaster.registerStreamer = function(streamer) {
    Broadcaster.streamers.register(streamer.config.exchange, streamer);
};

Broadcaster.prototype.addListener = function(exchange, symbol, callback) {
    var self = this;

    if (this.stream[exchange] === undefined) {
        this.stream[exchange] = {};
    }

    if (this.stream[exchange][symbol] === undefined) {
        var updateFn = function (data) {
            self.stream[exchange][symbol].listeners.forEach(function (listener) {
                listener(data);
            });
        };

        var streamer = Broadcaster.streamers.create(exchange, [symbol, updateFn]);

        this.stream[exchange][symbol] = {
            streamer: streamer,
            listeners: [],
        };        
    }

    var removeCb = function () {
        self.removeListener(exchange, symbol, callback);
    };

    this.stream[exchange][symbol].listeners.push(callback);
    return removeCb;
};

Broadcaster.prototype.removeListener = function (exchange, symbol, listener) {
    var stream = this.stream[exchange][symbol];
    var listeners = stream.listeners;
    var streamer = stream.streamer;

    console.log("Removing listener for", exchange, symbol);
    var index = listeners.indexOf(listener);
    listeners.splice(index, 1);

    if (!listeners.length) {
        console.log("No more listeners for", exchange, symbol);
        streamer.stop();

        this.stream[exchange][symbol] = undefined;
    }
};

broadcaster = new Broadcaster();

/**
 */
function SubscribeRequestHandler(request) {
    this.request = request;
}

SubscribeRequestHandler.broadcaster = new Broadcaster();

SubscribeRequestHandler.prototype.processRequest = function (callback, errback) {
    try {
        return SubscribeRequestHandler.broadcaster.addListener(
            this.request.exchange, 
            this.request.symbol, 
            callback
        );
    } catch(e) {
        errback(e, {
            exchange: this.request.exchange,
            symbol: this.request.symbol
        });
    }
};

SubscribeRequestHandler.handles = "SubscribeRequest";
RequestHandlerFactory.addHandler(SubscribeRequestHandler.handles, 
                                 SubscribeRequestHandler);

/**
 */
function PriceRequester(symbol, options) {
    this.symbol = symbol;
    this.options = options;
}

PriceRequester.prototype.__doRequest = function (url, callback, errback) {
    var _this = this;

    request(url,
        function (error, response, body) {
            try {
                if (error !== null) {
                    throw ("Error: " + error);
                }
                if (response.statusCode != 200) {
                    throw ("Error, status code: " + response.statusCode);
                }
                callback(_this.processResponse(response, body));
            } catch(e) {
                errback(e, {
                    exchange: _this.getExchange(),
                    symbol: _this.symbol,
                });
            }
        }
    );
};

PriceRequester.prototype.doRequest = function (callback, errback) {
    this.__doRequest(this.buildRequest(), callback, errback);
};

PriceRequester.prototype.getExchange = function() {
    var _config = this.constructor.config;
    return _config.exchange;
};

PriceRequester.prototype.buildRequest = function() {
    var _config = this.constructor.config;

    if (this.symbol && !(this.symbol in _config.symbol_map)) {
        throw ("Invalid symbol: " + this.symbol);
    }

    return _config.url_template.replace("<<SYMBOL>>", 
                                        _config.symbol_map[this.symbol]);
};

PriceRequester.prototype.processResponse = function(response, body) {
    throw ("processResponse should be overriden!");
};
 
/**
 */
function InternalCache(ttl) {
    this.ttl = ttl;
    this.entries = {};
}

InternalCache.prototype.setEntry = function (entry, value) {
    this.entries[entry] = {
        timestamp: new Date(),
        age: function() {
            return ((new Date()) - this.timestamp) / 1000;
        },
        value: value.toString(),
    };
    return value;
};

InternalCache.prototype.getEntry = function (entry, callback) {
    cached = this.entries[entry];

    if (cached !== undefined) {
        if (cached.age() > this.ttl) {
            delete this.entries[entry];
            callback(undefined, null);
        }
        callback(undefined, messages.Response.fromString(cached.value));
    } else {
        callback(undefined, null);
    }
};

/**
 */
function RedisCache(ttl) {
    var redisURL = url.parse(process.env.REDISCLOUD_URL),
        client = redis.createClient(redisURL.port, 
                                    redisURL.hostname, 
                                    {no_ready_check: true});

    client.auth(redisURL.auth.split(':')[1]);
    console.log("connected to " + redisURL.hostname);

    this.ttl = ttl;
    this.client = client;
}

RedisCache.prototype.setEntry = function (entry, value) {
    this.client.set(entry, value.toString());
    this.client.expire(entry, this.ttl);
    return value;
};

RedisCache.prototype.getEntry = function (entry, callback) {
    this.client.get(entry, function (error, value) {
        callback(error, messages.Response.fromString(value));                
    });
};

/**
 * Decorator to cache prices
 */

function CachedPriceRequester(cache, request, requester) {
    this.cache = cache;
    this.request = request;
    this.requester = requester;
}

CachedPriceRequester.prototype.doRequest = function (callback, errback) {
    var _this = this;

    this.cache.getEntry(this.request.hash(), function (error, value) {
        if (!value) {
            console.log("'%s' NOT found in cache...", 
                        _this.request.hash());
            _this.requester.doRequest(function (response) {
                _this.cache.setEntry(_this.request.hash(), response);
                callback(response);
            }, errback);
        } else {
            console.log("'%s' found in cache!", 
                        _this.request.hash());
            callback(value);
        }
    });
};

/**
 * Bitstamp
 */

function BitstampPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BitstampPriceRequester.config = {
    exchange: 'bitstamp',
    symbol_map: {
        "BTCUSD" : undefined
    },
    url_template: 'http://www.bitstamp.net/api/ticker/',
};

BitstampPriceRequester.prototype = Object.create(PriceRequester.prototype);
BitstampPriceRequester.prototype.constructor = BitstampPriceRequester;

BitstampPriceRequester.prototype.processResponse = function (response, body) {
    var object = JSON.parse(body),
        buy = parseFloat(object.bid),
        sell = parseFloat(object.ask);
    return new messages.Price(this.getExchange(), this.symbol, buy, sell);
};

PriceRequestHandler.addRequester(BitstampPriceRequester);
/**/

/**
 * Simple client for Pusher
 */

function PusherClient(pusherId) {
    var url = ("wss://ws.pusherapp.com/app/" + pusherId + 
               "?protocol=7&client=js&version=2.1.6&flash=false");

    this.connection = ws.connect(url);
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

/**
 * Bitstamp streamer
 */

function BitstampStreamer(symbol, callback) {
    this.client = new PusherClient('de504dc5763aeef9ff52');
    this.client.subscribe('order_book');
    this.client.bind('data', function (data) {
        callback(new messages.Price("bitstamp", 
                                    symbol, 
                                    parseFloat(data.bids[0][0]), 
                                    parseFloat(data.asks[0][0])));
    });
}

BitstampStreamer.config = {
    exchange: 'bitstamp',
};

BitstampStreamer.prototype.stop = function () {
    this.client.stop();
};

Broadcaster.registerStreamer(BitstampStreamer);
/**/

/**
 * BullionVault
 */

function BullionVaultPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BullionVaultPriceRequester.config = {
    exchange: 'bullionvault',
    symbol_map: { 
        "XAUUSD" : "GOLD", 
        "XAGUSD" : "SILVER" 
    },
    url_template: (
        'http://live.bullionvault.com/secure/api/v2/view_market_xml.do' +
        '?considerationCurrency=USD&securityClassNarrative=<<SYMBOL>>'
    ),
};

BullionVaultPriceRequester.prototype = Object.create(PriceRequester.prototype);
BullionVaultPriceRequester.prototype.constructor = BullionVaultPriceRequester;

BullionVaultPriceRequester.prototype.processResponse = function (response, body) {
    var $ = cheerio.load(body),
        get_price = function(op) {
            var prices = [];
            $(op + "Prices > price").each(function(index, elem){
                prices.push(elem.attribs.limit);
            });
            return Math.min.apply(null, prices) / 32.15;
        },
        buy = get_price("buy"),
        sell = get_price("sell");
    
    return new messages.Price(this.getExchange(), this.symbol, buy, sell);
};

PriceRequestHandler.addRequester(BullionVaultPriceRequester);
/**/

/**
 * Ambito.com
 */

function AmbitoPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

AmbitoPriceRequester.config = {
    exchange: 'ambito',
    symbol_map: {
        "USDARS" : "ARSSCBCRA",
        "USDARSB" : "ARSB=",
    },
    url_template: (
        'http://www.ambito.com/economia/mercados/monedas/dolar/info/?ric=<<SYMBOL>>'
    ),
};

AmbitoPriceRequester.prototype = Object.create(PriceRequester.prototype);
AmbitoPriceRequester.prototype.constructor = AmbitoPriceRequester;

AmbitoPriceRequester.prototype.processResponse = function (response, body) {
    var $ = cheerio.load(body),
        buy = parseFloat($('#compra > big').text().replace(',','.')),
        sell = parseFloat($("#venta > big").text().replace(',','.')),
        retrieved_on = new Date(),
        uact_format = /(\d{2})\/(\d{2})\/(\d{4})(\d{2}):(\d{2})/,
        match = uact_format.exec($(".uact > b").text().trim()),
        updated_on = new Date(parseInt(match[3]),
                              parseInt(match[2]) - 1,
                              parseInt(match[1]),
                              parseInt(match[4]),
                              parseInt(match[5]));
    
    return new messages.Price(this.getExchange(), 
                              this.symbol, 
                              buy, 
                              sell,
                              retrieved_on,
                              updated_on);
};

PriceRequestHandler.addRequester(AmbitoPriceRequester);
/**/

/**
 * lanacion.com
 */

function LaNacionPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

LaNacionPriceRequester.config = {
    exchange: 'lanacion',
    symbol_map: {
        "USDARS" : undefined,
        "USDARSB" : undefined,
    },
    url_template: (
        'http://contenidos.lanacion.com.ar/json/dolar'
    ),
};

LaNacionPriceRequester.prototype = Object.create(PriceRequester.prototype);
LaNacionPriceRequester.prototype.constructor = LaNacionPriceRequester;

LaNacionPriceRequester.prototype.processResponse = function (response, body) {
    var selectors = {
        USDARS: {
            buy: 'CasaCambioCompraValue',
            sell: 'CasaCambioVentaValue'
        },
        USDARSB : {
            buy: 'InformalCompraValue',
            sell: 'InformalVentaValue'
        }
    };
    
    var payload = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1),
        resp = JSON.parse(payload),
        buy = parseFloat(resp[selectors[this.symbol].buy].replace(',', '.')),
        sell = parseFloat(resp[selectors[this.symbol].sell].replace(',', '.')),
        retrieved_on = new Date(),
        date_format = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
        match = date_format.exec(resp['Date']),
        updated_on = new Date(parseInt(match[1]),
                              parseInt(match[2]) - 1,
                              parseInt(match[3]),
                              parseInt(match[4]),
                              parseInt(match[5]),
                              parseInt(match[6]));

    return new messages.Price(this.getExchange(), 
                              this.symbol, 
                              buy, 
                              sell,
                              retrieved_on,
                              updated_on);
};

PriceRequestHandler.addRequester(LaNacionPriceRequester);
/**/

/**
 * Coinbase
 */

function CoinbasePriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

CoinbasePriceRequester.config = {
    exchange: 'coinbase',
    symbol_map: {
        "BTCUSD" : undefined
    },
    url_template: 'http://coinbase.com/api/v1/prices/spot_rate',
};

CoinbasePriceRequester.prototype = Object.create(PriceRequester.prototype);
CoinbasePriceRequester.prototype.constructor = CoinbasePriceRequester;

// We must override doRequest() because two different requests are needed
// to get the buy and sell prices
CoinbasePriceRequester.prototype.doRequest = function (callback, errback) {
    var _this = this;

    async.map(
        ['http://coinbase.com/api/v1/prices/sell',
         'http://coinbase.com/api/v1/prices/buy'],
        function (item, cb) {
            _this.__doRequest(
                item, 
                function (resp) {
                    cb(null, resp);
                },
                function (err) {
                    cb(err);
                }
            );
        },
        function (err, results) {
            if (err !== null) {
                errback(err, {
                    exchange: _this.getExchange(),
                    symbol: _this.symbol,
                });                
            }

            // Yes, we want to invert 'buy' and 'sell' here:
            callback(new messages.Price(_this.getExchange(), 
                                        _this.symbol, 
                                        results[0], 
                                        results[1]));
        }
    );
};

CoinbasePriceRequester.prototype.processResponse = function (response, body) {
    return parseFloat(JSON.parse(body).amount);
};

PriceRequestHandler.addRequester(CoinbasePriceRequester);
/**/

/**
 * BTC-e
 */

function BTCePriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

BTCePriceRequester.config = {
    exchange: 'btc-e',
    symbol_map: {
        "BTCUSD" : "btc_usd",
        "LTCUSD" : "ltc_usd",
    },
    url_template: 'http://btc-e.com/api/2/<<SYMBOL>>/ticker',
};

BTCePriceRequester.prototype = Object.create(PriceRequester.prototype);
BTCePriceRequester.prototype.constructor = BTCePriceRequester;

BTCePriceRequester.prototype.processResponse = function (response, body) {
    var ticker = JSON.parse(body).ticker,
        // Yes, we want to invert them here:
        buy = ticker.sell,
        sell = ticker.buy;
    return new messages.Price(this.getExchange(), 
                              this.symbol, 
                              buy, 
                              sell);
};

PriceRequestHandler.addRequester(BTCePriceRequester);
/**/

/**
 * VirWox
 */

function VirWoxPriceRequester(symbol, options) {
    PriceRequester.call(this, symbol, options);
}

VirWoxPriceRequester.config = {
    exchange: 'virwox',
    symbol_map: {
        "BTCSLL" : "BTC/SLL",
        "USDSLL" : "USD/SLL",
    },
    url_template: (
       'http://www.virwox.com/api/json.php?method=getBestPrices' +
       '&symbols[0]=<<SYMBOL>>'
    ),
};

VirWoxPriceRequester.prototype = Object.create(PriceRequester.prototype);
VirWoxPriceRequester.prototype.constructor = VirWoxPriceRequester;

VirWoxPriceRequester.prototype.processResponse = function (response, body) {
    var result = JSON.parse(body).result,
        buy = parseFloat(result[0].bestBuyPrice),
        sell = parseFloat(result[0].bestSellPrice);
    return new messages.Price(this.getExchange(), this.symbol, buy, sell);
};

PriceRequestHandler.addRequester(VirWoxPriceRequester);
/**/

/**
 * Automatically declare Streamers based on PriceRequesters
 */
(function () {
    [AmbitoPriceRequester,
     LaNacionPriceRequester,
     CoinbasePriceRequester,
     BTCePriceRequester,
     BullionVaultPriceRequester,
     VirWoxPriceRequester].forEach(function (requester) {
        var streamer = function (symbol, callback) {
            var requesterObj = new requester(symbol);
            this.intervalId = setInterval(function () {
                requesterObj.doRequest(callback, function (e) {
                    console.log("Error while streaming:", e);
                });
            }, 30 * 1000);
        };
        streamer.prototype.stop = function () {
            clearInterval(this.intervalId);
        };
        streamer.config = {
            exchange: requester.config.exchange,
        };
        Broadcaster.registerStreamer(streamer);
    });
})();
