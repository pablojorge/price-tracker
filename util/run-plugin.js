// Force all dates to be handled in UTC:
process.env.tz = 'UTC';

var module = require(process.argv[2]);

for (var symbol in module.type.config.symbol_map) {
    var requester = new module.type(symbol);
    requester.doRequest(function (error, response) {
        console.log("symbol:", symbol, "response:", response);
    })
}
