// Force all dates to be handled in UTC:
process.env.tz = 'UTC';

var module = require(process.argv[2]);

module.register();

var Registry = require('../app/models/Registry.js')

var exchange = Object.keys(Registry.getInstance().requesters.constructors)[0];

var requester_cls = Registry.getInstance().requesters.get(exchange);

for (var symbol in requester_cls.config.symbol_map) {
	var requester = new requester_cls(symbol);
    requester.doRequest(function (error, response) {
        console.log("symbol:", symbol, "response:", response);
    })
}
