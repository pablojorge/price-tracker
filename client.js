/**
 */
function appendLine(msg) {
    var li = document.createElement('li');
    li.innerHTML = msg;
    document.querySelector('#pings').appendChild(li);
    console.log(msg);
}

/**
 */
var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host);

ws.onopen = function (event) {
    appendLine("connected!!");

    var exchanges = {
        "coinbase" :     ["BTCUSD"],
        "btc-e" :        ["BTCUSD"],
        "virwox" :       ["BTCSLL", "USDSLL"],
        "bitstamp" :     ["BTCUSD"],
        "ambito" :       ["USDARS", "USDARSB"],
        "bullionvault" : ["XAGUSD", "XAUUSD"],
    };

    for (exchange in exchanges) {
        for (index in exchanges[exchange]) {
            var symbol = exchanges[exchange][index];
            appendLine("Requesting price for " + symbol + " in " + exchange);
            ws.send((new PriceRequest(exchange, symbol)).toString());
        }
    }
};

ws.onmessage = function (event) {
    appendLine(event.data);
    appendLine(JSON.parse(event.data));
};

ws.onclose = function (event) {
    appendLine("disconnected!!");
};

ws.onerror = function (event) {
    appendLine("error " + event);
};
