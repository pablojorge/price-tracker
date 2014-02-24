/**
 */
function appendLine(msg) {
    var li = document.createElement('li');
    li.innerHTML = msg;
    document.querySelector('#pings').appendChild(li);
}

/**
 */
var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host);

ws.onopen = function (event) {
    appendLine("connected!!");
    ws.send((new PriceRequest("dummy", {})).toString());
    ws.send((new PriceRequest("bitstamp", {})).toString());
    ws.send((new PriceRequest("ambito", {symbol: "USDARS"})).toString());
    ws.send((new PriceRequest("ambito", {symbol: "USDARSB"})).toString());
    ws.send((new PriceRequest("bullionvault", {symbol: "XAGUSD"})).toString());
    ws.send((new PriceRequest("bullionvault", {symbol: "XAUUSD"})).toString());
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
