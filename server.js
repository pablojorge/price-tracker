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
                    ws.send(JSON.stringify(response), function() {
                        console.log("response sent");
                    });
                }, 
                function(exception) {
                    ret = {error:true, msg:exception.toString()};
                    console.log("exception: " + exception);
                    ws.send(JSON.stringify(ret), function() {
                        console.log("error sent");
                    });
                }
            );
        } catch(exception) {
            ret = {error:true, msg:exception.toString()};
            console.log("exception: " + exception);
            ws.send(JSON.stringify(ret), function() {
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
            console.log("Entry is too old, discarding: " + entry)
            delete this.entries[entry];
            return undefined;
        }
        console.log("Cached entry is valid: " + entry);
        return cached.value;
    } else {
        console.log("Entry NOT found in cache: " + entry);
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
    callback({price: "Dummy", retrieved_on: new Date()});
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
            var price = JSON.parse(body).ask;
            callback({price: price});
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
    '?considerationCurrency=USD';

BullionVaultPriceRequester.prototype.doRequest = function (callback) {
    request(BullionVaultPriceRequester.main_url,
        function (error, response, body) {
            var $ = cheerio.load(body),
                prices = {gold: [], silver: []},
                ret = {price: {}};
            for (security in prices) {
                var selector = "pitch[securityClassNarrative='" +
                                security.toUpperCase() +
                               "'] > sellPrices > price";
                $(selector).each(function(index, elem){
                    prices[security].push(elem.attribs.limit);
                });
                var price = Math.min.apply(null, prices[security]) / 32.15;
                ret.price[security] = price;
            }
            callback(ret);
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

    request(AmbitoPriceRequester.main_url + symbol_urlmap[this.options.symbol],
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

            callback({
                price : {
                    buy: buy, 
                    sell: sell
                },
                retrieved_on: new Date(), 
                updated_on: updated_on,
            });
        }
    );
};

PriceRequestHandler.addRequester(AmbitoPriceRequester.handles,
                                 AmbitoPriceRequester);
/**/

