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
                        "onDisconnect",
                        "onExchangesListReceived",
                        "onPriceUpdated",
                        "onError"]);

    this.addHandler("onConnect", function() {
        console.log("connected!");
    });

    this.addHandler("onDisconnect", function() {
        console.log("disconnected!!");
    });

    this.addHandler("onError", function(error) {
        console.log("error:", error);
    })
}

Client.prototype = Object.create(Subject.prototype);
Client.prototype.constructor = Client;

Client.prototype.requestPrices = function(exchanges) {
    var _this = this;

    for (exchange in exchanges) {
        exchanges[exchange].forEach(function(symbol) {
            _this.requestPrice(exchange, symbol);
        });
    }
}

/**
 */
function WSClient() {
    Client.call(this);

    this.socket = undefined;
}

WSClient.prototype = Object.create(Client.prototype);
WSClient.prototype.constructor = WSClient;

WSClient.prototype.connect = function(host) {
    var _this = this;

    _this.socket = new WebSocket(host);

    _this.socket.onopen = function (event) {
        _this.emit("onConnect");
    };

    _this.socket.onmessage = function (event) {
        console.log("got message: ", event.data);
        var object = JSON.parse(event.data);

        if (object.type == "Exchanges") {
            console.log("got exchanges list..");
            _this.emit("onExchangesListReceived", [object.response]);
        } else if (object.type == "Price") {
            console.log("got new price..");
            _this.emit("onPriceUpdated", [object.response]);
        } else if (object.type == "Error") {
            console.log("got error..");
            _this.emit("onError", [object.response]);
        }
    };

    _this.socket.onclose = function (event) {
        _this.emit("onDisconnect");
    };

    _this.socket.onerror = function (event) {
        _this.emit("onError", [new Error(event.toString())]);
    };
}

WSClient.prototype.requestExchanges = function() {
    console.log("requesting exchanges list...")
    this.socket.send((new ExchangesRequest()).toString());
}

WSClient.prototype.requestPrice = function(exchange, symbol) {
    console.log("requesting price for " + symbol + " in " + exchange);
    this.socket.send((new PriceRequest(exchange, symbol)).toString());
}

/**
 */
function RESTClient() {
    Client.call(this);

    this.host = undefined;
}

RESTClient.prototype = Object.create(Client.prototype);
RESTClient.prototype.constructor = WSClient;

RESTClient.prototype.connect = function(host) {
    this.host = host;

    this.emit("onConnect");
}

RESTClient.prototype.requestExchanges = function() {
    var _this = this;

    $.ajax({
        url: _this.host + "/request/exchanges", 
        dataType: 'json', 
        success: function(data) {
            _this.emit("onExchangesListReceived", [data]);
        },
    });
}

RESTClient.prototype.requestPrice = function(exchange, symbol) {
    var _this = this;

    $.ajax({
        url: _this.host + "/request/price/" + 
             exchange + "/" + symbol, 
        dataType: 'json',
        success: function(data) {
            _this.emit("onPriceUpdated", [data]);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var data = JSON.parse(jqXHR.responseText);
            _this.emit("onError", [new Error(data.message, data.info)]);
        }
    });
}
