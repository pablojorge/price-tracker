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
try {
    module.exports.Request = Request;
    module.exports.PriceRequest = PriceRequest;
} catch(e) {
    console.log("Running outside node: " + e)
}

