/**
 */
function guid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
 */
function concat () {
  var args = Array.prototype.slice.call(arguments);
  return args.join("");
}
__ = concat;
$__ = function() {
  return $(__.apply(null, arguments));
}
/**/

// Quotes section:
function buildMainContainers() {
    var symbols = [
        {
            name:'USDARS',
            description: '(Dolar oficial)',
            exchanges: ['ambito']
        }, 
        {
            name:'USDARSB',
            description: '(Dolar blue)',
            exchanges: ['ambito']
        }, 
        {
            name:'BTCUSD',
            description: '(Bitcoin)',
            exchanges: ['bitstamp', 'coinbase', 'btc-e']
        },  
        {
            name:'LTCUSD',
            description: '(Litecoin)',
            exchanges: ['btc-e']
        },
        {
            name:'XAUUSD',
            description: '(Gold)',
            exchanges: ['bullionvault']
        },           
        {
            name:'XAGUSD',
            description: '(Silver)',
            exchanges: ['bullionvault']
        }, 
    ];

    symbols.forEach(function(symbol) {
        buildContainerForSymbol(symbol);
    });
}

function buildContainerForSymbol(symbol) {
    $("#main-quotes").append($__(
        '<div class="row">',
        '  <div class="row" style="margin-left: 10px;">',
        '    <h3>', symbol.name, 
        '      <small>', symbol.description, '</small>',
        '    </h3>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-4 col-sm-2 col-md-3">',
        '    <strong>Exchange</strong>',
        '  </div>',
        '  <div class="col-xs-4 col-sm-2 col-md-2">',
        '    <strong>Buy</strong>',
        '  </div>',
        '  <div class="col-xs-4 col-sm-2 col-md-2">',
        '    <strong>Sell</strong>',
        '  </div>',
        '  <div class="hidden-xs col-sm-6 col-md-5">',
        '    <strong>Updated on</strong>',
        '  </div>',
        '</div>',
        '<div style="margin-top: 10px" ',
        '     id="prices-body-', symbol.name, '">',
        '</div>'
    ));

    symbol.exchanges.forEach(function(exchange) {
        buildExchangeContainerForSymbol(symbol, exchange);
    });
}

function buildExchangeContainerForSymbol(symbol, exchange) {
    var base_id = __(symbol.name, '-', exchange);

    $__('#prices-body-', symbol.name).append(
        $__(
            '<div class="row">',
            '  <div class="col-xs-4 col-sm-2 col-md-3"',
            '       style="padding-left: 25px;">', 
            '    <h5>', exchange, '</h5>',
            '  </div>',
            '  <div class="col-xs-8 col-sm-10 col-md-9"',
            '       id="', base_id, '-progress">',
            '    <div class="progress progress-striped active">',
            '      <div class="progress-bar" style="width: 100%">',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div class="col-xs-8 col-sm-10 col-md-9 hide"',
            '       id="', base_id, '-error">',
            '    <div class="alert alert-danger">',
            '      <strong>Error</strong>',
            '      <span id="', base_id, '-error-msg"></span>',
            '    </div>',
            '  </div>',
            '  <div id="', base_id, '-prices" class="hide">',
            '    <div class="col-xs-4 col-sm-2 col-md-2">',
            '      <h4>',
            '        <span class="label label-primary" ',
            '            id="', base_id, '-buy">',
            '        </span>',
            '      </h4>',
            '    </div>',
            '    <div class="col-xs-4 col-sm-2 col-md-2">',
            '      <h4>',
            '        <span class="label label-primary" ',
            '              id="', base_id, '-sell">',
            '        </span>',
            '      </h4>',
            '    </div>',
            '    <div class="hidden-xs col-sm-6 col-md-5">',
            '      <h4>',
            '        <small>',
            '          <span id="', base_id, '-updated_on">',
            '          </span>',
            '        </small>',
            '      </h4>',
            '    </div>',
            '  </div>',
            '</div>'
        )
    );
}

function updatePrice(price) {
    var base_selector = __("#", price.symbol, "-", price.exchange),
        prices_selector = __(base_selector, "-prices"),
        buy_selector = __(base_selector, "-buy"),
        sell_selector = __(base_selector, "-sell"),
        updated_on_selector = __(base_selector, "-updated_on"),
        progress_selector = __(base_selector, "-progress");
    
    $(buy_selector).html(price.buy.toFixed(2));
    $(sell_selector).html(price.sell.toFixed(2));
    $(updated_on_selector).html((new Date(price.updated_on)).toLocaleString());

    $(prices_selector).removeClass("hide");
    $(progress_selector).addClass("hide");
}

function priceError(error) {
    var base_selector = __("#", error.info.symbol, "-", error.info.exchange),
        error_selector = __(base_selector, "-error"),
        error_msg_selector = __(base_selector, "-error-msg"),
        progress_selector = __(base_selector, "-progress");

    $(error_msg_selector).html(error.message);

    $(error_selector).removeClass("hide");
    $(progress_selector).addClass("hide");
}

function genericError(error) {
    $("#global-error").removeClass("hide");
    $("#global-error-msgs").append($__(
        "<li>", error.message, "</li>"
    ));
}

function handleError(error) {
    if (!error.info || !error.info.exchange || !error.info.symbol) {
        genericError(error);
    } else {
        priceError(error);
    }
}
// End Quotes section

// Portfolio section
var portfolioData = undefined;

function savePortfolioData() {
    localStorage["portfolioData"] = JSON.stringify(portfolioData);
}

function loadPortfolioData() {
    portfolioData = JSON.parse(localStorage["portfolioData"] || null) || [];
}

function renderPortfolioData() {
    portfolioData.forEach(function(portfolio) {
        addPortfolio(portfolio);
        portfolio.trades.forEach(function(trade) {
            addTrade(portfolio, trade);
        });
    });
}

//
function savePortfolio(portfolio) {
    portfolioData.push(portfolio);
    savePortfolioData();
}

function deletePortfolio(guid) {
    portfolioData.forEach(function(portfolio, index) {
        if (portfolio.guid == guid) {
            portfolioData.splice(index, 1);
        }
    });

    savePortfolioData();
}

//
function saveTrade(portfolio, trade) {
    portfolioData.forEach(function(portfolio_) {
        if (portfolio_.guid == portfolio.guid) {
            portfolio_.trades.push(trade);
        }
    });

    savePortfolioData();
}

function deleteTrade(guid) {
    portfolioData.forEach(function(portfolio) {
        portfolio.trades.forEach(function(trade, index) {
            if (trade.guid == guid) {
                portfolio.trades.splice(index, 1);
            }
        });
    });

    savePortfolioData();
}

//
function renderTrade(portfolio, trade) {
    var btc_price = 500,
        inv_value = trade.amount * btc_price,
        ind_price = trade.price / trade.amount,
        profit = inv_value - trade.price,
        gain = (inv_value/trade.price) * 100 - 100;

    return $__(
        '<li class="list-group-item" ',
        '    id="trade-', trade.guid, '">', 
        '  <div class="row">',
        '    <div class="col-md-4">',
        '      <h5>',
        '        <strong>', trade.amount, '</strong> BTC for ',
        '        <strong>', trade.price, '</strong>$',
        '        (', ind_price.toFixed(2), '$/BTC)',
        '      </h5>',
        '    </div>',
        '    <div class="col-md-4">',
        '      <h5>',
        '        Current value: <strong>', inv_value, '</strong>$',
        '        Profit: <strong>', profit, '</strong>$',
        '      </h5>',
        '    </div>',
        '    <div class="col-md-3">',
        '      <h4>', 
        '        <span class="label label-', 
                   (gain < 0 ? 'danger' : 'success'), '">',
                   gain.toFixed(2).toString(), "%",
        '        </span>',
        '      </h4>',
        '    </div>',
        '    <div class="col-md-1">',
        '      <button type="button" class="close" aria-hidden="true"',
        '              id="btn-', trade.guid, '-remove">', 
        '        &times;',
        '      </button>',
        '    </div>',
        '  </div>',
        '</li>'
    );
}

function addTrade(portfolio, trade) {
    $__("#portfolio-", portfolio.guid, "-trades").append(
        renderTrade(portfolio, trade)
    );

    $__("#btn-", trade.guid, "-remove").click(function (event) {
        event.preventDefault();

        deleteTrade(trade.guid);
        removeTrade(trade.guid);
    });
}

function removeTrade(guid) {
    $__("#trade-", guid).remove();
}

//
function renderPortfolio(portfolio) {
    return $__(
        '<div class="panel panel-default" ',
        '     id="portfolio-', portfolio.guid, '">',
        '  <div class="panel-heading">',
        '    <strong>', portfolio.name, '</strong>',
        '    <button type="button" class="close" aria-hidden="true"',
        '            id="btn-', portfolio.guid,'-remove">', 
        '      &times;',
        '    </button>',
        '  </div>',
        '  <div class="panel-body" id="portfolio-', portfolio.guid, '-totals">',
        '  </div>',
        '  <ul class="list-group" id="portfolio-', portfolio.guid, '-trades">',
        '  </ul>',
        '  <ul class="list-group">',
        '    <li class="list-group-item">',
        '      <form class="form-inline" role="form">',
        '        <div class="row">',
        '          <div class="form-group col-md-3" ',
        '               id="input-', portfolio.guid, '-amount">',
        '            <div class="input-group">',
        '              <input type="number" step="any" ',
        '                     class="form-control" ',
        '                     placeholder="Enter amount">',
        '              <span class="input-group-addon">BTC</span>',
        '            </div>',
        '          </div>',
        '          <div class="form-group col-md-3" ',
        '               id="input-', portfolio.guid, '-price">',
        '            <div class="input-group">',
        '              <input type="number" step="any"',
        '                     class="form-control" ',
        '                     placeholder="Enter price">',
        '              <span class="input-group-addon">USD</span>',
        '            </div>', 
        '          </div>',
        '          <div class="col-md-3">',
        '            <button class="btn btn-primary"',
        '                    id="btn-', portfolio.guid, '-add" >',
        '            <span class="glyphicon glyphicon-plus"></span>',
        '              Add',
        '            </button>',
        '          </div>',
        '        </div>',
        '      </form>',
        '    </li>',
        '  </ul>',
        '</div>'
    );
}

function addPortfolio(portfolio) {
    $("#portfolios").append(renderPortfolio(portfolio));

    $__("#btn-", portfolio.guid, "-add").click(function (event) {
        event.preventDefault();

        var amount_selector = __("#input-", portfolio.guid, "-amount"),
            price_selector = __("#input-", portfolio.guid, "-price"),
            amount = parseFloat($__(amount_selector, " > div > :input").val()),
            price = parseFloat($__(price_selector, " > div > :input").val()),
            valid = true;

        if (!(amount > 0)) {
            $(amount_selector).addClass("has-error");
            valid = false;
        } else {
            $(amount_selector).removeClass("has-error");                
        }

        if (!(price > 0)) {
            $(price_selector).addClass("has-error");
            valid = false;
        } else {
            $(price_selector).removeClass("has-error");                
        }

        if (valid) {
            $__(amount_selector, " > div > :input").val("");
            $__(price_selector, " > div > :input").val("");

            var trade = {
                guid: guid(),
                amount: amount,
                price: price
            };

            saveTrade(portfolio, trade);
            addTrade(portfolio, trade);
        }
    });

    $__("#btn-", portfolio.guid, "-remove").click(function (event) {
        event.preventDefault();

        deletePortfolio(portfolio.guid);
        removePortfolio(portfolio.guid);
    });
}

function removePortfolio(guid) {
    $__("#portfolio-", guid).remove();
}

//
function hookPortfolioButtons() {
    $("#btn-create-portfolio").click(function (event) {
        event.preventDefault();

        var input_selector = "#input-portfolio-name",
            value_selector = __(input_selector, " > :input"),
            portfolio_name = $(value_selector).val();

        if (!portfolio_name) {
            $(input_selector).addClass("has-error");
        } else {
            $(input_selector).removeClass("has-error");
            $(value_selector).val(""); 

            var portfolio = {
                guid: guid(),
                name: portfolio_name,
                trades: [],
            };

            savePortfolio(portfolio);
            addPortfolio(portfolio);
        }
    });
}
// End Portfolio section

// Global functions
function hookSidebarButtons() {
    $(".navbar-button").click(function(event) {
        event.preventDefault();

        // hide all "main" divs
        $(".main").addClass("hide");
        // show the div with class "main" and id "main-$target"
        $__(".main#main-", $(this).attr("target")).removeClass("hide");

        // make all navbar buttons inactive:
        $(".navbar-button").removeClass("active");
        // active the current one:
        $(this).addClass("active");
    });

    // activate the main 'quotes' section:
    $(".navbar-button[target='portfolio']").click();
}

function main() {
    hookSidebarButtons();

    buildMainContainers();

    hookPortfolioButtons();
    loadPortfolioData();
    renderPortfolioData();

    // initalize WS connection:
    var wsclient = new WSClient();

    function connectHandlers(client) {
        client.addHandler("onConnect", function() {
            //this.requestExchanges();
        });

        client.addHandler("onExchangesListReceived", function(exchanges) {
            this.requestPrices(exchanges);
        });

        client.addHandler("onPriceUpdated", function(price) {
            updatePrice(price);
        });

        client.addHandler("onError", function (error) {
            handleError(error);
        });
    }

    wsclient.addHandler("onDisconnect", function() {
        // assuming websocket connectivity unavailable, fallback to AJAX 
        // (TODO: add support for wss or socket.io for proper handling
        //        of this condition)
        restclient = new RESTClient();
        connectHandlers(restclient);
        restclient.connect(location.origin);
    });

    connectHandlers(wsclient);
    //wsclient.connect(location.origin.replace(/^http/, 'ws'));
}

$(document).ready(function() {
    main();
});