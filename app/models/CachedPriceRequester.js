/**
 * Decorator to cache prices
 */

function CachedPriceRequester(cache, request, requester) {
    this.cache = cache;
    this.request = request;
    this.requester = requester;
}

CachedPriceRequester.prototype.doRequest = function (callback) {
    var self = this;

    var symbol_key = "cache:".concat(
        "symbol:", this.request.symbol, ":",
        "exchange:", this.request.exchange
    );

    this.cache.getEntry(symbol_key, function (error, value) {
        if (!value) {
            console.log("Cache: '%s' NOT found in cache...", 
                        symbol_key);
            self.requester.doRequest(function (error, response) {
                if (error === null) {
                    console.log("Cache: storing '%s' in cache...", 
                                symbol_key);
                    self.cache.setEntry(symbol_key, response);
                    callback(null, response);
                } else {
                    callback(error);
                }
            });
        } else {
            console.log("Cache: '%s' found in cache!", 
                        symbol_key);
            callback(null, value);
        }
    });
};

module.exports = CachedPriceRequester;