/**
 */
function buildExchangesContainers(exchanges){
    for(exchange in exchanges) {
        var panel = $(
            '<div class="panel panel-default">' +
            '  <div class="panel-heading">' + 
            '    <div class="row" ' + 
            '         style="height: 95px; ' + 
            '                display: table; ' + 
            '                margin-left: auto; ' + 
            '                margin-right: auto;">' +
            '      <div style="vertical-align: middle; ' + 
            '                  display: table-cell;">' + 
            '        <img class="img-responsive" ' +
            '             src="img/' + exchange + '_logo.png">' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
          
        var list = $('<ul class="list-group"></ul>');
        
        exchanges[exchange].forEach(function(symbol) {
            list.append($(
              '<li class="list-group-item">' +
              '  <h5>' + symbol + '</h5>' +
              '  <div id="' + exchange + '-' + symbol + '-prices" ' +
              '       class="hide"></div>' +
              '  <div class="progress progress-striped active" ' +
              '       id="' + exchange + '-' + symbol + '-progress">' +
              '    <div class="progress-bar" style="width: 100%"></div>' +
              '  </div>' +
              '</li>'
            ));
        });

        panel.append(list);

        $("#container-" + exchange).
            css("padding-left", "5px").
            css("padding-right", "5px").
            append(panel);
    }
}

function requestPrices(ws, exchanges){
    for (exchange in exchanges) {
        exchanges[exchange].forEach(function(symbol) {
            console.log("requesting price for " + symbol + " in " + exchange);
            ws.send((new PriceRequest(exchange, symbol)).toString());
        });
    }
}

function updatePrice(price){
    var base_selector = "#" + price.exchange + "-" + price.symbol,
        prices_selector = base_selector + "-prices",
        progress_selector = base_selector + "-progress";
    
    $(prices_selector).html(
        "<h4>" + price.buy.toFixed(2) + " - " +
                 price.sell.toFixed(2) + "</h4>" +
        "<small>(Updated: " + 
            (new Date(price.updated_on)).toLocaleString() + 
        ")</small>" 
    );
    $(prices_selector).removeClass("hide");
    $(progress_selector).addClass("hide");
}

function hookButtons() {
    $(".navbar-button").click(function(event){
        event.preventDefault();

        $(".main").addClass("hide");
        $(".main#main-" + $(this).attr("target")).removeClass("hide");

        $(".navbar-button").removeClass("active");
        $(this).addClass("active");
    });

    $(".navbar-button[target='overview']").click();
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
    };

    ws.onerror = function (event) {
        console.log("error " + event);
    };
}

function main() {
    hookButtons();
    connect();
}

$(document).ready(function(){
    main();
});
