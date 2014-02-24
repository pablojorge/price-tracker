/**
 */
function Request() {}

Request.prototype.toString = function() {
    return JSON.stringify({type: this.__proto__.constructor.name,
                           request: this});
}

Request.fromString = function(string) {
    object = JSON.parse(string);

    request = new module.exports[object.type]();

    for(prop in object.request) {
        request[prop] = object.request[prop];
    }

    return request;
}

/**
 */
function PriceRequest(exchange, options) {
    this.exchange = exchange;
    this.options = options;
}

PriceRequest.prototype = Object.create(Request.prototype);
PriceRequest.prototype.constructor = PriceRequest;

PriceRequest.prototype.hash = function() {
    return this.exchange + JSON.stringify(this.options);
}

/**
 */
function Response() {}

Response.prototype.toString = function() {
    return JSON.stringify({
        type: this.__proto__.constructor.name,
        response: this
    });
}

Response.fromString = function (string) {
    object = JSON.parse(string);

    response = new module.exports[object.type]();

    for(prop in object.response) {
        response[prop] = object.response[prop];
    }

    return response;
}

function Error(message) {
    this.message = message;
}

Error.prototype = Object.create(Response.prototype);
Error.prototype.constructor = Error;

function Price(symbol, buy, sell, retrieved_on, updated_on) {
    this.symbol = symbol;
    this.buy = buy;
    this.sell = sell;
    this.retrieved_on = retrieved_on || Date.now();
    this.updated_on = updated_on || Date.now();
}

Price.prototype = Object.create(Response.prototype);
Price.prototype.constructor = Price;

/**
 */
try {
    module.exports.Request = Request;
    module.exports.PriceRequest = PriceRequest;
    module.exports.Error = Error;
    module.exports.Price = Price;
} catch(e) {
    console.log("Running outside node: " + e)
}

