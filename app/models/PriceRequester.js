var request = require('request');
var zlib = require('zlib');

/**
 */
function PriceRequester(symbol, options) {
    this.symbol = symbol;
    this.options = options;
}

PriceRequester.prototype.__doRequest = function (url, headers, callback) {
    var self = this;

    var req_obj = {
        url: url,
        headers: headers,
        encoding: null
    };

    request(req_obj,
        function (error, response, body) {
            try {
                if (error !== null) {
                    throw ("Error: " + error);
                }
                if (response.statusCode != 200) {
                    throw ("Error, status code: " + response.statusCode);
                }
                if (response.headers['content-encoding'] == 'gzip'){
                    zlib.gunzip(body, function(err, dezipped) {
                        callback(null, self.processResponse(response, dezipped.toString()));
                    });
                } else {
                    callback(null, self.processResponse(response, body.toString()));
                }
            } catch(e) {
                callback({
                    exception: e,
                    info: {
                        exchange: self.getExchange(),
                        symbol: self.symbol,
                    }
                });
            }
        }
    );
};

PriceRequester.prototype.doRequest = function (callback) {
    this.__doRequest(this.buildRequest(), this.getHeaders(), callback);
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

PriceRequester.prototype.getHeaders = function() {
    var _config = this.constructor.config;
    return _config.custom_headers;
};

PriceRequester.prototype.processResponse = function(response, body) {
    throw ("processResponse should be overriden!");
};

module.exports = PriceRequester;