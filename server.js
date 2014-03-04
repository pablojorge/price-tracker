var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , request = require('request')
  , cheerio = require('cheerio')

  // custom modules:
  , messages = require('./messages.js')

  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

function serveRequest(request, req, res) {
    var factory = new RequestHandlerFactory(),
        handler = factory.getHandler(request);

    handler.processRequest(
        function(response) {
            console.log("response sent: " + response);
            res.json(response);
        },
        function(exception) {
            res.status(500);
            console.log("error sent: " + exception);
            res.json(new messages.Error(exception.toString()));
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

var wss = new WebSocketServer({server: server});

console.log('websocket server created');

wss.on('connection', function(ws) {
    console.log('websocket connection open');

    ws.on('message', function(message) {
        console.log("message received: " + message);
        try {
            var request = messages.Request.fromString(message);
            var factory = new RequestHandlerFactory();
            var handler = factory.getHandler(request);
            handler.processRequest(
                function(response) {
                    ws.send(response.toString(), function() {
                        console.log("response sent: " + response);
                    });
                }, 
                function(exception) {
                    error = new messages.Error(exception.toString());
                    console.log("exception: " + exception);
                    ws.send(error.toString(), function() {
                        console.log("error sent");
                    });
                }
            );
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
RequestHandlerFactory.handlers = {}
RequestHandlerFactory.addHandler = function(type, handler) {
    RequestHandlerFactory.handlers[type] = handler;
}

RequestHandlerFactory.prototype.getHandler = function(request) {
    var handler = RequestHandlerFactory.handlers[request.__proto__.constructor.name];
    if (handler == undefined)
        throw ("Invalid type: " + request);
    return new handler(request);
}

/**
 */
function PriceRequestHandler(request) {
    this.request = request;
}

PriceRequestHandler.requesters = {}
PriceRequestHandler.cache = new Cache(60);

PriceRequestHandler.addRequester = function(requester) {
    PriceRequestHandler.requesters[requester.config.exchange] = requester;
}

PriceRequestHandler.prototype.getRequester = function() {
    var requester = PriceRequestHandler.requesters[this.request.exchange];
    if (requester == undefined)
        throw ("Unknown exchange: " + this.request.exchange);
    return new CachedPriceRequester(PriceRequestHandler.cache,
                                    this.request,
                                    new requester(this.request.symbol,
                                                  this.request.options));
}

PriceRequestHandler.prototype.processRequest = function (callback, errback) {
    try {
        var requester = this.getRequester();
        requester.doRequest(callback, errback);
    } catch(e) {
        errback(e);
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
        var exchanges = new messages.Exchanges()
        for (exchange in PriceRequestHandler.requesters) {
            var requester = PriceRequestHandler.requesters[exchange],
                symbols = [];
            for (symbol in requester.config.symbol_map) {
                symbols.push(symbol);
            }
            exchanges.addExchange(requester.config.exchange, symbols);
        }
        callback(exchanges)
    } catch(e) {
        errback(e);
    }
};

ExchangesRequestHandler.handles = "ExchangesRequest";
RequestHandlerFactory.addHandler(ExchangesRequestHandler.handles, 
                                 ExchangesRequestHandler);

/**
 */
function PriceRequester(symbol, options) {
    this.symbol = symbol;
    this.options = options;
}

PriceRequester.prototype.doRequest = function (callback, errback) {
    var _this = this;

    request(this.buildRequest(),
        function (error, response, body) {
            try {
                if (error != undefined) {
                    throw ("Error: " + error);
                }
                if (response.statusCode != 200) {
                    throw ("Error, status code: " + response.statusCode);
                }
                callback(_this.processResponse(response, body));
            } catch(e) {
                errback(e);
            }
        }
    );
};

PriceRequester.prototype.getExchange = function() {
    var _config = this.__proto__.constructor.config;
    return _config.exchange;
}

PriceRequester.prototype.buildRequest = function() {
    var _config = this.__proto__.constructor.config;

    if (this.symbol && !(this.symbol in _config.symbol_map)) {
        throw ("Invalid symbol: " + this.symbol);
    }

    return _config.url_template.replace("<<SYMBOL>>", 
                                        _config.symbol_map[this.symbol]);
}

PriceRequester.prototype.processResponse = function(response, body) {
    throw ("processResponse should be overriden!");
}

/**
 */
function Cache(ttl) {
    this.ttl = ttl;
    this.entries = {}
}

Cache.prototype.setEntry = function(entry, value) {
    this.entries[entry] = {
        timestamp: new Date(),
        age: function() {
            return ((new Date()) - this.timestamp) / 1000;
        },
        value: value
    };
    return value;
}

Cache.prototype.getEntry = function(entry) {
    cached = this.entries[entry];

    if (cached != undefined) {
        console.log("cache entry found");

        if (cached.age() > this.ttl) {
            console.log("cache entry too old");

            delete this.entries[entry];
            return undefined;
        }

        console.log("cache entry is fresh");
        return cached.value;
    } else {
        console.log("cache entry NOT found");
        return undefined;
    }
}

/**
 * Decorator to cache prices
 */

function CachedPriceRequester(cache, request, requester) {
    this.cache = cache;
    this.request = request;
    this.requester = requester;
}

CachedPriceRequester.prototype.doRequest = function (callback, errback) {
    cached = this.cache.getEntry(this.request.hash());

    if (cached == undefined) {
        var cache = this.cache,
            request = this.request;

        this.requester.doRequest(function (response) {
            cache.setEntry(request.hash(), response);
            callback(response);
        }, errback);
    } else {
        callback(cached);
    }
}

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
        "USDARSB" : "ARSB=",
        "USDARS" : "ARSSCBCRA"
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

    function processResponse(error, response, body) {
        if (error != undefined) {
            throw ("Error: " + error);
        }
        if (response.statusCode != 200) {
            throw ("Error, status code: " + response.statusCode);
        }
        return parseFloat(JSON.parse(body).amount);
    }

    // We want to invert 'buy' and 'sell' here:
    function getBuyPrice() {
        request('http://coinbase.com/api/v1/prices/sell',
            function (error, response, body) {
                try {
                    var buy = processResponse(error, response, body);
                    getSellPrice(buy);
                } catch(e) {
                    errback(e);
                }
            }
        );
    }

    function getSellPrice(buy) {
        request('http://coinbase.com/api/v1/prices/buy',
            function (error, response, body) {
                try {
                    var sell = processResponse(error, response, body);
                    callback(new messages.Price(_this.getExchange(), 
                                                _this.symbol, 
                                                buy, 
                                                sell));
                } catch(e) {
                    errback(e);
                }
            }
        );
    }

    getBuyPrice();
};

CoinbasePriceRequester.prototype.processResponse = function (response, body) {
    var price = JSON.parse(body).amount;
    
    return new messages.Price(this.getExchange(),
                              this.symbol,
                              price, 
                              price);
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

