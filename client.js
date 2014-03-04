/**
 */
function log(msg) {
    console.log(msg);

    function append(line) {
        var log = document.querySelector('#log');
        log.innerHTML = log.innerHTML + line + '\n';
    }

    while (msg.length > 80) {
        append(msg.substr(0,80));
        msg = msg.substr(80);
    }

    append(msg);
}

/**
 */
var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host);

ws.onopen = function (event) {
    log("connected!!");

    log("requesting exchanges list...")
    ws.send((new ExchangesRequest()).toString());
};

ws.onmessage = function (event) {
    //log("got message: " + event.data);
    var object = JSON.parse(event.data);

    if (object.type == "Exchanges") {
        var exchanges = object.response;
        log("got exchanges list..");
        for (exchange in exchanges) {
            for (index in exchanges[exchange]) {
                var symbol = exchanges[exchange][index];
                log("requesting price for " + symbol + " in " + exchange);
                ws.send((new PriceRequest(exchange, symbol)).toString());
            }
        }
    } else if (object.type == "Price") {
        var price = object.response;

        log("[" + price.updated_on + "] " + 
            price.symbol + "@" + price.exchange +
            " = " + price.buy + " - " + price.sell);
    }
};

ws.onclose = function (event) {
    log("disconnected!!");
};

ws.onerror = function (event) {
    log("error " + event);
};
