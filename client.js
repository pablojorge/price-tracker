/**
 */
function appendLine(msg) {
    var li = document.createElement('li');
    li.innerHTML = msg;
    document.querySelector('#pings').appendChild(li);
}

/**
 */
function Request() {}

Request.prototype.toString = function() {
    return JSON.stringify({type: this.__proto__.constructor.name,
                           request: this});
}

function PriceRequest(exchange, options) {
    this.exchange = exchange;
    this.options = options;
}

PriceRequest.prototype = Object.create(Request.prototype);
PriceRequest.prototype.constructor = PriceRequest;

var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host);

ws.onopen = function (event) {
    appendLine("connected!!");
    ws.send((new PriceRequest("ambito", {symbol: "USDARSB"})).toString());
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
