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
function QuotesView() {}

QuotesView.prototype.render = function() {
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
        {
            name:'USDSLL',
            description: '(Linden/USD)',
            exchanges: ['virwox']
        }, 
        {
            name:'BTCSLL',
            description: '(Linden/Bitcoin)',
            exchanges: ['virwox']
        }, 
    ];

    var _this = this;
    symbols.forEach(function(symbol) {
        _this.renderSymbol(symbol);
    });
}

QuotesView.prototype.renderSymbol = function (symbol) {
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

    var _this = this;
    symbol.exchanges.forEach(function(exchange) {
        _this.renderExchangeForSymbol(symbol, exchange);
    });
}

QuotesView.prototype.renderExchangeForSymbol = function (symbol, exchange) {
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

QuotesView.prototype.renderPrice = function (price) {
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

QuotesView.prototype.renderPriceError = function (error) {
    var base_selector = __("#", error.info.symbol, "-", error.info.exchange),
        error_selector = __(base_selector, "-error"),
        error_msg_selector = __(base_selector, "-error-msg"),
        progress_selector = __(base_selector, "-progress");

    $(error_msg_selector).html(error.message);

    $(error_selector).removeClass("hide");
    $(progress_selector).addClass("hide");
}

QuotesView.prototype.renderGenericError = function (error) {
    $("#global-error").removeClass("hide");
    $("#global-error-msgs").append($__(
        "<li>", error.message, "</li>"
    ));
}

function QuotesModel() {}

function QuotesController(view, model) {
    this.view = view;
    this.model = model;
}

QuotesController.prototype.start = function () {
    this.view.render();
}

QuotesController.prototype.onPriceUpdated = function (price) {
    this.view.renderPrice(price);
}

QuotesController.prototype.onError = function (error) {
    if (!error.info || !error.info.exchange || !error.info.symbol) {
        thiw.view.renderGenericError(error);
    } else {
        this.view.renderPriceError(error);
    }
}
// End Quotes section

// Portfolio section
function PortfolioModel() {
    this.data = undefined;
}

PortfolioModel.prototype.save = function () {
    localStorage["portfolio.data"] = JSON.stringify(this.data);
}

PortfolioModel.prototype.load = function () {
    this.data = JSON.parse(localStorage["portfolio.data"] || null) || [];
}

PortfolioModel.prototype.savePortfolio = function (portfolio) {
    this.data.push(portfolio);
    this.save();
}

PortfolioModel.prototype.deletePortfolio = function (guid) {
    var _this = this;

    this.data.forEach(function(portfolio, index) {
        if (portfolio.guid == guid) {
            _this.data.splice(index, 1);
        }
    });

    this.save();
}

PortfolioModel.prototype.saveTrade = function (portfolio, trade) {
    var _this = this;

    this.data.forEach(function(portfolio_) {
        if (portfolio_.guid == portfolio.guid) {
            portfolio_.trades.push(trade);
        }
    });

    this.save();
}

PortfolioModel.prototype.deleteTrade = function (guid) {
    var _this = this;

    this.data.forEach(function(portfolio) {
        portfolio.trades.forEach(function(trade, index) {
            if (trade.guid == guid) {
                portfolio.trades.splice(index, 1);
            }
        });
    });

    this.save();
}

function PortfolioView() {
    this.controller = undefined;
}

PortfolioView.prototype.setController = function (controller) {
    this.controller = controller;
}

PortfolioView.prototype.render = function (data) {
    var _this = this;

    data.forEach(function(portfolio) {
        _this.addPortfolio(portfolio);
        portfolio.trades.forEach(function(trade) {
            _this.addTrade(portfolio, trade);
        });
    });
}

PortfolioView.prototype.renderTrade = function(portfolio, trade) {
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

PortfolioView.prototype.addTrade = function(portfolio, trade) {
    var _this = this;

    $__("#portfolio-", portfolio.guid, "-trades").append(
        this.renderTrade(portfolio, trade)
    );

    $__("#btn-", trade.guid, "-remove").click(function (event) {
        event.preventDefault();
        _this.controller.deleteTrade(trade.guid);
    });
}

PortfolioView.prototype.removeTrade = function(guid) {
    $__("#trade-", guid).remove();
}

//
PortfolioView.prototype.renderPortfolio = function(portfolio) {
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

PortfolioView.prototype.addPortfolio = function(portfolio) {
    var _this = this;

    $("#portfolios").append(this.renderPortfolio(portfolio));

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
            _this.controller.createTrade(portfolio, amount, price);
        }
    });

    $__("#btn-", portfolio.guid, "-remove").click(function (event) {
        event.preventDefault();
        _this.controller.deletePortfolio(portfolio.guid);
    });
}

PortfolioView.prototype.removePortfolio = function(guid) {
    $__("#portfolio-", guid).remove();
}

PortfolioView.prototype.start = function(controller) {
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

            controller.createPortfolio(portfolio_name);
        }
    });
}

function PortfolioController(view, model) {
    this.view = view;
    this.model = model;

    this.view.setController(this);
}

PortfolioController.prototype.start = function () {
    this.model.load();
    this.view.start(this);
    this.view.render(this.model.data);
}

PortfolioController.prototype.createPortfolio = function (name) {
    var portfolio = {
        guid: guid(),
        name: name,
        trades: [],
    };

    this.model.savePortfolio(portfolio);
    this.view.addPortfolio(portfolio);
}

PortfolioController.prototype.createTrade = function (portfolio, amount, price) {
    var trade = {
        guid: guid(),
        amount: amount,
        price: price
    };

    this.model.saveTrade(portfolio, trade);
    this.view.addTrade(portfolio, trade);
}

PortfolioController.prototype.deletePortfolio = function (guid) {
    this.model.deletePortfolio(guid);
    this.view.removePortfolio(guid);
}
PortfolioController.prototype.deleteTrade = function (guid) {
    this.model.deleteTrade(guid);
    this.view.removeTrade(guid);
}

// End Portfolio section

function GlobalView() {}

GlobalView.prototype.hookSidebarButtons = function () {
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
}

GlobalView.prototype.activateSection = function (section) {
    // activate the main 'quotes' section:
    $__(".navbar-button[target='", section, "']").click();
}

function GlobalController(view) {
    this.view = view;
}

GlobalController.prototype.start = function() {
    this.view.hookSidebarButtons();
    this.view.activateSection("portfolio");
}

function main() {
    global_view = new GlobalView();
    global_controller = new GlobalController(global_view);

    quotes_view = new QuotesView();
    quotes_model = new QuotesModel();
    quotes_controller = new QuotesController(quotes_view, quotes_model);

    portfolio_view = new PortfolioView();
    portfolio_model = new PortfolioModel();
    portfolio_controller = new PortfolioController(portfolio_view, 
                                                   portfolio_model);

    global_controller.start();
    quotes_controller.start();
    portfolio_controller.start();

    // initalize WS connection:
    var wsclient = new WSClient();

    function connectHandlers(client) {
        client.addHandler("onConnect", function() {
            this.requestExchanges();
        });

        client.addHandler("onExchangesListReceived", function(exchanges) {
            this.requestPrices(exchanges);
        });

        client.addHandler("onPriceUpdated", function(price) {
            quotes_controller.onPriceUpdated(price);
        });

        client.addHandler("onError", function (error) {
            quotes_controller.onError(error);
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
    wsclient.connect(location.origin.replace(/^http/, 'ws'));
}

$(document).ready(function() {
    main();
});