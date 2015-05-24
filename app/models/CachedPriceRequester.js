/**
 * Decorator to cache prices
 */

function CachedPriceRequester(cache, request, requester) {
    this.cache = cache;
    this.request = request;
    this.requester = requester;
}

CachedPriceRequester.prototype.doRequest = function (callback) {
    var _this = this;

    this.cache.getEntry(this.request.hash(), function (error, value) {
        if (!value) {
            console.log("Cache: '%s' NOT found in cache...", 
                        _this.request.hash());
            _this.requester.doRequest(function (error, response) {
                if (error === null) {
                    _this.cache.setEntry(_this.request.hash(), response);
                    callback(null, response);
                } else {
                    callback(error);
                }
            });
        } else {
            console.log("Cache: '%s' found in cache!", 
                        _this.request.hash());
            callback(null, value);
        }
    });
};

module.exports = CachedPriceRequester;