/**
 * Metaclass to generate streamers, using a specific PriceRequester
 */
function Streamer(requester, interval) {
    var ret = function (symbol, callback) {
        var requesterObj = new requester(symbol);
        this.intervalId = setInterval(function () {
            requesterObj.doRequest(callback);
        }, interval * 1000);
    };
    ret.prototype.stop = function () {
        clearInterval(this.intervalId);
    };
    ret.config = {
        exchange: requester.config.exchange,
    };
    return ret;
}

module.exports = Streamer;