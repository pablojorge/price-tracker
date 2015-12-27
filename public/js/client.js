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

    exchanges.forEach(function(item) {
        item.symbols.forEach(function(symbol) {
            self.requestPrice(item.exchange, symbol);
            self.subscribe(item.exchange, symbol);
        });
    });
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

WSClient.WATCHDOG_INTERVAL = 5;
WSClient.MAX_INACTIVITY = 60;

WSClient.State = {
    CONNECTING : 0, // The connection is not yet open.
    OPEN : 1,       // The connection is open and ready to communicate.
    CLOSING : 2,    // The connection is in the process of closing.
    CLOSED : 3,     // The connection is closed or couldn't be opened.
};

WSClient.prototype = Object.create(Client.prototype);
WSClient.prototype.constructor = WSClient;

WSClient.prototype.start = function() {
    setTimeout(this.watchdog.bind(this),
               WSClient.WATCHDOG_INTERVAL * 1000);
    this.connect();
};

WSClient.prototype.connect = function() {
    var self = this;

    self.socket = new WebSocket(self.host);

    self.socket.onopen = function (event) {
        self.connected = true;
        self.updated_on = new Date();

        self.emit("onConnect");
    };

    self.socket.onmessage = function (event) {
        var object = JSON.parse(event.data);
        console.log("WSClient: onmessage: ", object);

        self.updated_on = new Date();

        if (object.type == "Exchanges") {
            self.emit("onExchangesListReceived", [object.response.data]);
        } else if (object.type == "Symbol") {
            self.emit("onPriceUpdated", [object.response.data]);
        } else if (object.type == "Error") {
            self.emit("onError", [object.response]);
        }
    };

    self.socket.onclose = function (event) {
        self.connected = false;

        self.emit("onDisconnect");
    };

    self.socket.onerror = function (event) {
        self.emit("onError", [new Error('WebSocket error')]);
    };
};

WSClient.prototype._waitState = function (state, func) {
    if (!this.socket) {
        console.log("WSClient: Invalid socket!");
        return;
    }

    console.log("WSClient: current socket state:", this.socket.readyState,
                "waiting state:", state);

    if (this.socket.readyState != state) {
        setTimeout(this._waitState.bind(this, state, func),
                   100);
    } else {
        func();
    }
};

WSClient.prototype._safeSend = function (data) {
    var self = this;

    this._waitState(WSClient.State.OPEN, function() {
        self.socket.send(data);
    });
};

WSClient.prototype.disconnect = function () {
    try {
        if (this.socket) {
            if (this.socket.readyState == WSClient.State.OPEN)
                this.socket.close();
            this.socket = undefined;
            this.connected = false;
        }
    } catch(e) {
        console.log("WARN: WSClient.disconnect: ", e);
    }
};

WSClient.prototype.watchdog = function () {
    var inactive_for = ((new Date()) - this.updated_on) / 1000;

    console.log('Watchdog: inactive for', inactive_for, 'seconds');

    if (!this.connected) {
        console.log('Watchdog: connection lost, restarting connection');
        this.disconnect();
        this.connect(this.host);
    } else if (inactive_for > WSClient.MAX_INACTIVITY) {
        console.log('Watchdog: excessive inactivity, restarting connection');
        this.disconnect();
        this.connect(this.host);
    }

    setTimeout(this.watchdog.bind(this),
               WSClient.WATCHDOG_INTERVAL * 1000);
};

WSClient.prototype.requestExchanges = function() {
    console.log("WSClient: requesting exchanges list...");
    this._safeSend((new ExchangesRequest()).toString());
};

WSClient.prototype.requestPrice = function(exchange, symbol) {
    console.log("WSClient: requesting price for", symbol, "in", exchange);
    this._safeSend((new SymbolRequest(symbol, exchange)).toString());
};

WSClient.prototype.subscribe = function(exchange, symbol) {
    console.log("WSClient: subscribing to", symbol, "in", exchange);
    this._safeSend((new SubscribeRequest(exchange, symbol)).toString());
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
        url: self.host + "/api/v1/exchanges", 
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
        url: self.host + "/api/v1/symbols/" + 
             symbol + "/" + exchange, 
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
