var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , request = require('request')
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
            var request = JSON.parse(message);
            var factory = new HandlerFactory();
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
        } catch(e) {
            ret = {error:true, msg:e.toString()};
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
function HandlerFactory() {}
HandlerFactory.handlers = {}
HandlerFactory.addHandler = function(type, handler) {
    HandlerFactory.handlers[type] = handler;
}

HandlerFactory.prototype.getHandler = function(requestobj) {
    var handler = HandlerFactory.handlers[requestobj.type];
    if (handler == undefined)
        throw ("Invalid type: " + requestobj.type);
    return new handler(requestobj.request);
}

/**/
function PriceRequestHandler(request) {
    this.request = request;
}

PriceRequestHandler.requesters = {}
PriceRequestHandler.addRequester = function(exchange, requester) {
    PriceRequestHandler.requesters[exchange] = requester;
}

PriceRequestHandler.prototype.getRequester = function(exchange) {
    var requester = PriceRequestHandler.requesters[exchange];
    if (requester == undefined)
        throw ("Unknown exchange: " + exchange);
    return new requester();
}

PriceRequestHandler.prototype.processRequest = function (callback, errback) {
    try {
        var requester = this.getRequester(this.request.exchange);
        requester.doRequest(callback);
    } catch(e) {
        errback(e);
    }
};

PriceRequestHandler.handles = "PriceRequest";
HandlerFactory.addHandler(PriceRequestHandler.handles, 
                          PriceRequestHandler);

/**
 * Bitstamp
 */

function BitstampPriceRequester() {}

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

