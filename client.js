/**
 */
function Subject(events) {
    var handlers = {};

    events.forEach(function(event) {
        handlers[event] = [];
    })

    this.handlers = handlers;
}

Subject.prototype.addHandler = function(event, handler) {
    if (!(event in this.handlers)) {
        throw ("Invalid event! " + event);
    }

    this.handlers[event].push(handler);
}

Subject.prototype.emit = function(event, args) {
    var _this = this;

    this.handlers[event].forEach(function(handler) {
        handler.apply(_this, args);
    });
}

/**
 */
function Client() {
    Subject.call(this, ["onConnect",
                        "onExchangesListReceived",
                        "onPriceUpdated"]);

    this.socket = undefined;

    this.addHandler("onConnect", function() {
        console.log("connected!");
    });
}

Client.prototype = Object.create(Subject.prototype);
Client.prototype.constructor = Client;

Client.prototype.connect = function(host) {
    var _this = this;

    _this.socket = new WebSocket(host);

    _this.socket.onopen = function (event) {
        _this.emit("onConnect");
    };

    _this.socket.onmessage = function (event) {
        console.log("got message: " + event.data);
        var object = JSON.parse(event.data);

        if (object.type == "Exchanges") {
            console.log("got exchanges list..");
            _this.emit("onExchangesListReceived", [object.response]);
        } else if (object.type == "Price") {
            console.log("got new price..");
            _this.emit("onPriceUpdated", [object.response]);
        }
    };

    _this.socket.onclose = function (event) {
        console.log("disconnected!!");

        // assuming websocket connectivity unavailable, fallback to AJAX 
        // (TODO: add support for wss or socket.io so we can delete this hack)
        // $.ajax({
        //     url: location.origin + "/request/exchanges", 
        //     dataType: 'json', 
        //     success: function(data) {
        //         var sender = {
        //             send: function(data) {
        //                 var request = JSON.parse(data).request;

        //                 $.ajax({
        //                     url: location.origin + "/request/price/" + 
        //                          request.exchange + "/" + request.symbol, 
        //                     dataType: 'json',
        //                     success: function(data) {
        //                         onPriceUpdate(undefined, data);
        //                     }
        //                 });
        //             },
        //         };
        //         onExchangesListReceived(sender, data);
        //     }
        // });
    };

    _this.socket.onerror = function (event) {
        console.log("error " + event);
    };
}

Client.prototype.requestExchanges = function() {
    console.log("requesting exchanges list...")
    this.socket.send((new ExchangesRequest()).toString());
}

Client.prototype.requestPrice = function(exchange, symbol) {
    console.log("requesting price for " + symbol + " in " + exchange);
    this.socket.send((new PriceRequest(exchange, symbol)).toString());
}

Client.prototype.requestPrices = function(exchanges) {
    var _this = this;

    for (exchange in exchanges) {
        exchanges[exchange].forEach(function(symbol) {
            _this.requestPrice(exchange, symbol);
        });
    }
}
