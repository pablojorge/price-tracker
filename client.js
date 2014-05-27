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
    });
}

Client.prototype = Object.create(Subject.prototype);
Client.prototype.constructor = Client;

Client.prototype.requestPrices = function(exchanges) {
    var _this = this;

    for (var exchange in exchanges) {
        exchanges[exchange].forEach(function(symbol) {
            _this.requestPrice(exchange, symbol);
            _this.subscribe(exchange, symbol);
        });
    }
};

/**
 */
function WSClient(host) {
    Client.call(this);

    this.host = host;

    this.socket = undefined;
    this.updated_on = undefined;
}

WSClient.WATCHDOG_INTERVAL = 10;
WSClient.MAX_INACTIVITY = 60;

WSClient.prototype = Object.create(Client.prototype);
WSClient.prototype.constructor = WSClient;

WSClient.prototype.connect = function() {
    var _this = this;

    _this.socket = new WebSocket(this.host);

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
    
        _this.updated_on = new Date();
    };

    _this.socket.onclose = function (event) {
        _this.emit("onDisconnect");
    };

    _this.socket.onerror = function (event) {
        _this.emit("onError", [new Error('WebSocket error')]);
    };

    this.updated_on = new Date();
    setTimeout(this.watchdog.bind(this), 
               WSClient.WATCHDOG_INTERVAL * 1000);    
};

WSClient.prototype.watchdog = function () {
    var inactive_for = ((new Date()) - this.updated_on) / 1000;

    console.log('Inactive for', inactive_for, 'seconds');

    if (inactive_for > WSClient.MAX_INACTIVITY) {
        console.log('Excessive inactivity, restarting connection');
        this.socket.close();
        this.connect(this.host);
    } else {
        setTimeout(this.watchdog.bind(this), 
                   WSClient.WATCHDOG_INTERVAL * 1000);
    }
};

WSClient.prototype.requestExchanges = function() {
    console.log("requesting exchanges list...");
    this.socket.send((new ExchangesRequest()).toString());
};

WSClient.prototype.requestPrice = function(exchange, symbol) {
    console.log("requesting price for " + symbol + " in " + exchange);
    this.socket.send((new PriceRequest(exchange, symbol)).toString());
};

WSClient.prototype.subscribe = function(exchange, symbol) {
    console.log("subscribing to " + symbol + " in " + exchange);
    this.socket.send((new SubscribeRequest(exchange, symbol)).toString());
};

/**
 */
function RESTClient(host) {
    Client.call(this);

    this.host = host;
}

RESTClient.prototype = Object.create(Client.prototype);
RESTClient.prototype.constructor = WSClient;

RESTClient.prototype.connect = function() {
    this.emit("onConnect");
};

RESTClient.prototype.requestExchanges = function() {
    var _this = this;

    $.ajax({
        url: _this.host + "/request/exchanges", 
        dataType: 'json', 
        success: function(data) {
            _this.emit("onExchangesListReceived", [data]);
        },
    });
};

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
};

RESTClient.prototype.subscribe = function(exchange, symbol) {
    // TODO: use setInterval() to simulate streaming..
};
