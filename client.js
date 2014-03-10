/**
 */
function buildExchangesContainers(exchanges){
    for(exchange in exchanges) {
        $("#container-" + exchange).append($(
            '<div class="row" ' + 
            '     style="height: 95px;">' +
            '  <div style="width: 100%; ' + 
            '              height: 100%; ' + 
            '              background: url(img/' + exchange + '_logo.png) ' +
            '                          center center no-repeat;">' +
            '  </div>' +
            '</div>'
        ));

        $("#container-" + exchange).
            css("padding-left", "30px").
            css("padding-right", "30px");
        
        for(index in exchanges[exchange]) {
            var symbol = exchanges[exchange][index];

            $("#container-" + exchange).append($(
              '<div class="row">' +
              '  <h5>' + symbol + '</h5>' +
              '  <div id="' + exchange + '-' + symbol + '-prices" ' +
              '       class="hide"></div>' +
              '  <div class="progress progress-striped active" ' +
              '       id="' + exchange + '-' + symbol + '-progress">' +
              '    <div class="progress-bar" style="width: 100%"></div>' +
              '  </div>' +
              '</div>'
            ));
        }
    }
}

function requestPrices(ws, exchanges){
    for (exchange in exchanges) {
        for (index in exchanges[exchange]) {
            var symbol = exchanges[exchange][index];
            console.log("requesting price for " + symbol + " in " + exchange);
            ws.send((new PriceRequest(exchange, symbol)).toString());
        }
    }
}

function updatePrice(price){
    var base_selector = "#" + price.exchange + "-" + price.symbol,
        prices_selector = base_selector + "-prices",
        progress_selector = base_selector + "-progress";
    
    $(prices_selector).html(
        "<h3>" + price.buy.toFixed(2) + " - " +
         price.sell.toFixed(2) + "</h3>" +
        "<small>(Updated: " + 
            (new Date(price.updated_on)).toLocaleString() + 
        ")</small>" 
    );
    $(prices_selector).removeClass("hide");
    $(progress_selector).addClass("hide");
}

/**
 */
function onExchangesListReceived(ws, exchanges) {
    buildExchangesContainers(exchanges);
    requestPrices(ws, exchanges);
}

function onPriceUpdate(ws, price) {
    updatePrice(price);
}

function main() {
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
    };

    ws.onerror = function (event) {
        console.log("error " + event);
    };
}

$(document).ready(function(){
    main();
});
