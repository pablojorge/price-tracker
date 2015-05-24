/**
 */
function Request() {}

Request.prototype.toString = function() {
    return JSON.stringify({
        type: this.constructor.name,
        request: this
    });
};

Request.fromString = function(string) {
    var object = JSON.parse(string);

    var request = new module.exports[object.type]();

    for(var prop in object.request) {
        request[prop] = object.request[prop];
    }

    return request;
};

/**
 */
function SymbolRequest(symbol, exchange, options) {
    this.symbol = symbol;
    this.exchange = exchange;
    this.options = options;
}

SymbolRequest.prototype = Object.create(Request.prototype);
SymbolRequest.prototype.constructor = SymbolRequest;

SymbolRequest.prototype.hash = function() {
    return this.symbol + "@" + this.exchange;
};

/**
 */
function SubscribeRequest(exchange, symbol, options) {
    this.exchange = exchange;
    this.symbol = symbol;
    this.options = options;
}

SubscribeRequest.prototype = Object.create(Request.prototype);
SubscribeRequest.prototype.constructor = SubscribeRequest;

/**
 */
function ExchangesRequest(options) {
    this.options = options;
}

ExchangesRequest.prototype = Object.create(Request.prototype);
ExchangesRequest.prototype.constructor = ExchangesRequest;

/**
 */
function SymbolsRequest(options) {
    this.options = options;
}

SymbolsRequest.prototype = Object.create(Request.prototype);
SymbolsRequest.prototype.constructor = SymbolsRequest;

/**
 */
function Response() {}

Response.prototype.toString = function() {
    return JSON.stringify({
        type: this.constructor.name,
        response: this
    });
};

Response.fromString = function (string) {
    if (string === null)
        return null;

    var object = JSON.parse(string);

    response = new module.exports[object.type]();

    for(var prop in object.response) {
        response[prop] = object.response[prop];
    }

    return response;
};

function Error(message, info) {
    this.message = message;
    this.info = info;
}

Error.prototype = Object.create(Response.prototype);
Error.prototype.constructor = Error;

function Symbol(exchange, symbol, bid, ask, updated_on, custom) {
    this.exchange = exchange;
    this.symbol = symbol;
    this.bid = bid;
    this.ask = ask;
    this.updated_on = updated_on || new Date();
    this.custom = custom || {};
}

Symbol.prototype = Object.create(Response.prototype);
Symbol.prototype.constructor = Symbol;

function Exchanges() {}

Exchanges.prototype = Object.create(Response.prototype);
Exchanges.prototype.constructor = Exchanges;

Exchanges.prototype.addExchange = function (exchange, symbols) {
    this[exchange] = symbols;
};

function Symbols() {}

Symbols.prototype = Object.create(Response.prototype);
Symbols.prototype.constructor = Symbols;

Symbols.prototype.addSymbol = function (symbol, exchanges) {
    this[symbol] = exchanges;
};

/**
 */
try {
    module.exports.Request = Request;
    module.exports.SymbolRequest = SymbolRequest;
    module.exports.ExchangesRequest = ExchangesRequest;
    module.exports.SymbolsRequest = SymbolsRequest;
    module.exports.SubscribeRequest = SubscribeRequest;

    module.exports.Response = Response;
    module.exports.Error = Error;
    module.exports.Symbol = Symbol;
    module.exports.Exchanges = Exchanges;
    module.exports.Symbols = Symbols;
} catch(e) {
    console.log("Running outside node: " + e);
}

