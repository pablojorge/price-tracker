/**
 */
function Client() {
    Subject.call(this, ["onConnect",
                        "onDisconnect",
                        "onExchangesListReceived",
                        "onPriceUpdated",
                        "onError"]);

    this.addHandler("onConnect", function() {
        console.log("Client: connected!");
    });

    this.addHandler("onDisconnect", function() {
        console.log("Client: disconnected!!");
    });

    this.addHandler("onError", function(error) {
        console.log("Client: error:", error);
    });
}

Client.prototype = Object.create(Subject.prototype);
Client.prototype.constructor = Client;

Client.prototype.requestPrices = function(exchanges) {
    var self = this;

    for (var exchange in exchanges) {
        exchanges[exchange].forEach(function(symbol) {
            self.requestPrice(exchange, symbol);
            self.subscribe(exchange, symbol);
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

    this.connected = false;
}

WSClient.WATCHDOG_INTERVAL = 10;
WSClient.MAX_INACTIVITY = 60;

WSClient.prototype = Object.create(Client.prototype);
WSClient.prototype.constructor = WSClient;

WSClient.prototype.connect = function() {
    var self = this;

    self.socket = new WebSocket(self.host);

    self.socket.onopen = function (event) {
        self.connected = true;
        self.emit("onConnect");
        self.updated_on = new Date();
        setTimeout(self.watchdog.bind(self),
                   WSClient.WATCHDOG_INTERVAL * 1000);
    };

    self.socket.onmessage = function (event) {
        var object = JSON.parse(event.data);
        console.log("WSClient: onmessage: ", object);

        if (object.type == "Exchanges") {
            self.emit("onExchangesListReceived", [object.response]);
        } else if (object.type == "Price") {
            self.emit("onPriceUpdated", [object.response]);
        } else if (object.type == "Error") {
            self.emit("onError", [object.response]);
        }
    
        self.updated_on = new Date();
    };

    self.socket.onclose = function (event) {
        self.emit("onDisconnect");
        self.connected = false;
    };

    self.socket.onerror = function (event) {
        self.emit("onError", [new Error('WebSocket error')]);
    };
};

WSClient.prototype.watchdog = function () {
    var inactive_for = ((new Date()) - this.updated_on) / 1000;

    console.log('Watchdog: inactive for', inactive_for, 'seconds');

    if (inactive_for > WSClient.MAX_INACTIVITY) {
        console.log('Watchdog: excessive inactivity, restarting connection');
        this.socket.close();
        this.connect(this.host);
    } else {
        setTimeout(this.watchdog.bind(this), 
                   WSClient.WATCHDOG_INTERVAL * 1000);
    }
};

WSClient.prototype.requestExchanges = function() {
    console.log("WSClient: requesting exchanges list...");
    this.socket.send((new ExchangesRequest()).toString());
};

WSClient.prototype.requestPrice = function(exchange, symbol) {
    console.log("WSClient: requesting price for", symbol, "in", exchange);
    this.socket.send((new PriceRequest(exchange, symbol)).toString());
};

WSClient.prototype.subscribe = function(exchange, symbol) {
    console.log("WSClient: subscribing to", symbol, "in", exchange);
    this.socket.send((new SubscribeRequest(exchange, symbol)).toString());
};

/**
 */
function RESTClient(host, interval) {
    Client.call(this);

    this.host = host;
    this.interval = interval;
}

RESTClient.prototype = Object.create(Client.prototype);
RESTClient.prototype.constructor = WSClient;

RESTClient.prototype.connect = function() {
    this.emit("onConnect");
};

RESTClient.prototype.requestExchanges = function() {
    var self = this;

    console.log("RESTClient: requesting exchanges list...");

    $.ajax({
        url: self.host + "/request/exchanges", 
        dataType: 'json', 
        success: function(data) {
            console.log("RESTClient.requestExchanges(): received: ", data);
            self.emit("onExchangesListReceived", [data]);
        },
    });
};

RESTClient.prototype.requestPrice = function(exchange, symbol) {
    var self = this;

    console.log("RESTClient: requesting price for", symbol, "in", exchange);

    $.ajax({
        url: self.host + "/request/price/" + 
             exchange + "/" + symbol, 
        dataType: 'json',
        success: function(data) {
            console.log("RESTClient.requestPrice(): received: ", data);
            self.emit("onPriceUpdated", [data]);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var data = JSON.parse(jqXHR.responseText);
            self.emit("onError", [new Error(data.message, data.info)]);
        }
    });
};

RESTClient.prototype.subscribe = function(exchange, symbol) {
    var self = this;

    console.log("RESTClient: subscribing to", symbol, "in", exchange);
    setInterval(function () {
        self.requestPrice(exchange, symbol);
    }, this.interval * 1000);
};
