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
                        console.log("response sent");
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

PriceRequestHandler.addRequester = function(exchange, requester) {
    PriceRequestHandler.requesters[exchange] = requester;
}

PriceRequestHandler.prototype.getRequester = function() {
    var requester = PriceRequestHandler.requesters[this.request.exchange];
    if (requester == undefined)
        throw ("Unknown exchange: " + this.request.exchange);
    return new CachedPriceRequester(PriceRequestHandler.cache,
                                    this.request,
                                    new requester(this.request.options));
}

PriceRequestHandler.prototype.processRequest = function (callback, errback) {
    try {
        var requester = this.getRequester();
        requester.doRequest(callback);
    } catch(e) {
        errback(e);
    }
};

PriceRequestHandler.handles = "PriceRequest";
RequestHandlerFactory.addHandler(PriceRequestHandler.handles, 
                                 PriceRequestHandler);

/**
 */
function Cache(ttl) {
    this.ttl = ttl;
    this.entries = {}
}

Cache.prototype.setEntry = function(entry, value) {
    this.entries[entry] = {
        timestamp: Date.now(),
        age: function() {
            return (Date.now() - this.timestamp) / 1000;
        },
        value: value
    };
    return value;
}

Cache.prototype.getEntry = function(entry) {
    cached = this.entries[entry];

    if (cached != undefined) {
        if (cached.age() > this.ttl) {
            delete this.entries[entry];
            return undefined;
        }
        return cached.value;
    } else {
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

CachedPriceRequester.prototype.doRequest = function (callback) {
    cached = this.cache.getEntry(this.request.hash());

    if (cached == undefined) {
        var cache = this.cache,
            request = this.request;

        this.requester.doRequest(function (response) {
            cache.setEntry(request.hash(), response);
            callback(response);
        });
    } else {
        callback(cached);
    }
}

/**
 * Dummy price requester
 */

function DummyPriceRequester(options) {
    this.options = options;
}

DummyPriceRequester.handles = 'dummy';

DummyPriceRequester.prototype.doRequest = function (callback) {
    callback(new messages.Price("Dummy", 1234.56, 4321.12));
};

PriceRequestHandler.addRequester(DummyPriceRequester.handles, 
                                 DummyPriceRequester);
/**/

/**
 * Bitstamp
 */

function BitstampPriceRequester(options) {
    this.options = options;
}

BitstampPriceRequester.handles = 'bitstamp';
BitstampPriceRequester.main_url = 'https://www.bitstamp.net/api/ticker/';

BitstampPriceRequester.prototype.doRequest = function (callback) {
    request(BitstampPriceRequester.main_url, 
        function (error, response, body) {
            var object = JSON.parse(body),
                buy = object.bid,
                sell = object.ask;
            callback(new messages.Price("BTCUSD", buy, sell));
        }
    );
};

PriceRequestHandler.addRequester(BitstampPriceRequester.handles, 
                                 BitstampPriceRequester);
/**/

/**
 * BullionVault
 */

function BullionVaultPriceRequester(options) {
    this.options = options;
}

BullionVaultPriceRequester.handles = 'bullionvault';
BullionVaultPriceRequester.main_url =
    'https://live.bullionvault.com/secure/api/v2/view_market_xml.do' +
    '?considerationCurrency=USD&securityClassNarrative=';

BullionVaultPriceRequester.prototype.doRequest = function (callback) {
    var symbol_urlmap = {
        "XAUUSD" : "GOLD",
        "XAGUSD" : "SILVER"
    };
    var symbol = this.options.symbol;

    request(BullionVaultPriceRequester.main_url + symbol_urlmap[symbol],
        function (error, response, body) {
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

            callback(new messages.Price(symbol, buy, sell));
        }
    );
};

PriceRequestHandler.addRequester(BullionVaultPriceRequester.handles,
                                 BullionVaultPriceRequester);
/**/

/**
 * Ambito.com
 */

function AmbitoPriceRequester(options) {
    this.options = options;
}

AmbitoPriceRequester.handles = 'ambito';
AmbitoPriceRequester.main_url =
    'http://www.ambito.com/economia/mercados/monedas/dolar/info/?ric=';

AmbitoPriceRequester.prototype.doRequest = function (callback) {
    var symbol_urlmap = {
        "USDARSB" : "ARSB=",
        "USDARS" : "ARSSCBRA"
    };
    var symbol = this.options.symbol;

    request(AmbitoPriceRequester.main_url + symbol_urlmap[symbol],
        function (error, response, body) {
            var $ = cheerio.load(body),
                buy = parseFloat($('#compra > big').text().replace(',','.')),
                sell = parseFloat($("#venta > big").text().replace(',','.')),
                uact_format = /(\d{2})\/(\d{2})\/(\d{4})(\d{2}):(\d{2})/,
                match = uact_format.exec($(".uact > b").text().trim()),
                updated_on = new Date(parseInt(match[3]),
                                      parseInt(match[2]) - 1,
                                      parseInt(match[1]),
                                      parseInt(match[4]),
                                      parseInt(match[5]));

            callback(new messages.Price(symbol, buy, sell));
        }
    );
};

PriceRequestHandler.addRequester(AmbitoPriceRequester.handles,
                                 AmbitoPriceRequester);
/**/

