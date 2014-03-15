/**
 */
function requestPrices(ws, exchanges){
    for (exchange in exchanges) {
        exchanges[exchange].forEach(function(symbol) {
            console.log("requesting price for " + symbol + " in " + exchange);
            ws.send((new PriceRequest(exchange, symbol)).toString());
        });
    }
}

function updatePrice(price){
    var base_selector = "#" + price.symbol + "-" + price.exchange,
        prices_selector = base_selector + "-prices",
        buy_selector = base_selector + "-buy",
        sell_selector = base_selector + "-sell",
        updated_on_selector = base_selector + "-updated_on",
        progress_selector = base_selector + "-progress";
    
    $(buy_selector).html(price.buy.toFixed(2));
    $(sell_selector).html(price.sell.toFixed(2));
    $(updated_on_selector).html((new Date(price.updated_on)).toLocaleString());

    $(prices_selector).removeClass("hide");
    $(progress_selector).addClass("hide");
}

/**
 */
function onExchangesListReceived(ws, exchanges) {
    requestPrices(ws, exchanges);
}

function onPriceUpdate(ws, price) {
    updatePrice(price);
}

function connect() {
    var host = location.origin.replace(/^http/, 'ws');
    var ws = new WebSocket(host);

    ws.onopen = function (event) {
        console.log("connected!!");

        console.log("requesting exchanges list...")
        ws.send((new ExchangesRequest()).toString());
    };

    ws.onmessage = function (event) {
        console.log("got message: " + event.data);
        var object = JSON.parse(event.data);

        if (object.type == "Exchanges") {
            console.log("got exchanges list..");
            onExchangesListReceived(ws, object.response);
        } else if (object.type == "Price") {
            console.log("got new price..");
            onPriceUpdate(ws, object.response);
        }
    };

    ws.onclose = function (event) {
        console.log("disconnected!!");

        // assuming websocket connectivity unavailable, fallback to AJAX 
        // (TODO: add support for wss or socket.io so we can delete this hack)
        $.ajax({
            url: location.origin + "/request/exchanges", 
            dataType: 'json', 
            success: function(data) {
                var sender = {
                    send: function(data) {
                        var request = JSON.parse(data).request;

                        $.ajax({
                            url: location.origin + "/request/price/" + 
                                 request.exchange + "/" + request.symbol, 
                            dataType: 'json',
                            success: function(data) {
                                onPriceUpdate(undefined, data);
                            }
                        });
                    },
                };
                onExchangesListReceived(sender, data);
            }
        });
    };

    ws.onerror = function (event) {
        console.log("error " + event);
    };
}
