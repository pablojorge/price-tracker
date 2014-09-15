var request = require('request');

/**
 */
function PriceRequester(symbol, options) {
    this.symbol = symbol;
    this.options = options;
}

PriceRequester.prototype.__doRequest = function (url, callback, errback) {
    var _this = this;

    request(url,
        function (error, response, body) {
            try {
                if (error !== null) {
                    throw ("Error: " + error);
                }
                if (response.statusCode != 200) {
                    throw ("Error, status code: " + response.statusCode);
                }
                callback(_this.processResponse(response, body));
            } catch(e) {
                errback(e, {
                    exchange: _this.getExchange(),
                    symbol: _this.symbol,
                });
            }
        }
    );
};

PriceRequester.prototype.doRequest = function (callback, errback) {
    this.__doRequest(this.buildRequest(), callback, errback);
};

PriceRequester.prototype.getExchange = function() {
    var _config = this.constructor.config;
    return _config.exchange;
};

PriceRequester.prototype.buildRequest = function() {
    var _config = this.constructor.config;

    if (this.symbol && !(this.symbol in _config.symbol_map)) {
        throw ("Invalid symbol: " + this.symbol);
    }

    return _config.url_template.replace("<<SYMBOL>>", 
                                        _config.symbol_map[this.symbol]);
};

PriceRequester.prototype.processResponse = function(response, body) {
    throw ("processResponse should be overriden!");
};

module.exports = PriceRequester;