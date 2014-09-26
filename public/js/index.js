/**
 * Taken from http://stackoverflow.com/a/2117523
 */
function guid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
 * Utility function to avoid tedious string concatenations:
 * Instead of: 'a' + 'b' + 'c', 
 *         or: ['a', 'b', 'c'].join(""), 
 * you can write: concat('a', 'b', 'c')
 */
function concat () {
    var args = Array.prototype.slice.call(arguments);
    return args.join("");
}
/**
 * Use __('a', 'b', 'c') instead of concat('a', 'b', 'c')
 */
__ = concat;
/**
 * Use $__('a', 'b', 'c') instead of $(__('a', 'b', 'c'))
 */
$__ = function() {
    return $(__.apply(null, arguments));
};
/**/

function QuotesView() {
    this.exchanges = {
        'ambito' : {
            description: 'Ambito.com',
            link: 'http://www.ambito.com/economia/mercados/monedas/dolar/',
        },
        'lanacion' : {
            description: 'La Nacion',
            link: 'http://www.lanacion.com.ar/dolar-hoy-t1369'
        },
        'cronista' : {
            description: 'Cronista',
            link: 'http://www.cronista.com'
        },
        'infobae' : {
            description: 'Infobae',
            link: 'http://www.infobae.com'
        },
        'coinbase' : {
            description: 'Coinbase',
            link: 'https://coinbase.com/charts',
        },
        'bitstamp' : {
            description: 'Bitstamp',
            link: 'https://www.bitstamp.net',
        },
        'btc-e' : {
            description: 'BTC-e',
            link: 'https://btc-e.com',
        },
        'bullionvault' : {
            description: 'BullionVault',
            link: 'https://www.bullionvault.com',
        },
        'virwox' : {
            description: 'VirWox',
            link: 'https://www.virwox.com',
        }
    };

    this.symbols = {
        'USDARS' : {
            description: '(Dolar oficial)',
            exchanges: ['ambito', 'lanacion', 'cronista', 'infobae'],
            prefix: 'AR$',
            column: '1'
        }, 
        'USDARSB' : {
            description: '(Dolar blue)',
            exchanges: ['ambito', 'lanacion', 'cronista', 'infobae'],
            prefix: 'AR$',
            column: '1'
        }, 
        'BTCUSD' : {
            description: '(Bitcoin)',
            exchanges: ['bitstamp', 'coinbase', 'btc-e'],
            prefix: '$',
            column: '2'
        },  
        'LTCUSD' : {
            description: '(Litecoin)',
            exchanges: ['btc-e'],
            prefix: '$',
            column: '2'
        },
        'XAUUSD' : {
            description: '(Gold)',
            exchanges: ['bullionvault'],
            prefix: '$',
            column: '2'
        },           
        'XAGUSD' : {
            description: '(Silver)',
            exchanges: ['bullionvault'],
            prefix: '$',
            column: '2'
        }, 
        'USDSLL' : {
            description: '(Linden/USD)',
            exchanges: ['virwox'],
            prefix: '',
            column: '2'
        }, 
        'BTCSLL' : {
            description: '(Linden/Bitcoin)',
            exchanges: ['virwox'],
            prefix: 'SLL ',
            column: '2'
        }, 
    };
}

QuotesView.prototype.render = function() {
    var _this = this;

    for (var symbol in this.symbols) {
        _this.addSymbol(symbol, this.symbols[symbol]);
    }

    this.hookCollapseButtons();
};

QuotesView.prototype.hookCollapseButtons = function () {
    $(".collapse-symbol").unbind('click').bind('click', function(event) {
        event.preventDefault();

        if ($(this).hasClass("expanded")) {
            $(this).removeClass("expanded");
            $(this).removeClass("glyphicon-chevron-down");
            $(this).addClass("glyphicon-chevron-right");
            $__("#prices-body-", $(this).attr("target")).slideUp();
        } else {
            $(this).addClass("expanded");
            $(this).addClass("glyphicon-chevron-down");
            $(this).removeClass("glyphicon-chevron-right");
            $__("#prices-body-", $(this).attr("target")).slideDown();
        }

        return false;
    });

    $(".collapse-exchange").unbind('click').bind('click', function(event) {
        event.preventDefault();

        if ($(this).hasClass("expanded")) {
            $(this).removeClass("expanded");
            $(this).removeClass("glyphicon-chevron-down");
            $(this).addClass("glyphicon-chevron-right");
            $__('#', $(this).attr("target"), '-details').slideUp();
        } else {
            $(this).addClass("expanded");
            $(this).addClass("glyphicon-chevron-down");
            $(this).removeClass("glyphicon-chevron-right");
            $__('#', $(this).attr("target"), '-details').slideDown();
        }

        return false;
    });
};

QuotesView.prototype.renderSymbol = function (symbol, info) {
    return $__(
        '<div class="row">',
        '  <h3>',
        '    <span target="', symbol, '"',
        '          class="collapse-symbol glyphicon glyphicon-chevron-down expanded"',
        '          style="font-size: small;"></span> ',
             symbol,
        '    <small>', info.description, '</small>',
        '  </h3>',
        '  <div style="margin-top: 10px" ',
        '       id="prices-body-', symbol, '">',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.addSymbol = function (symbol, info) {
    $__("#main-quotes-", info.column).append(this.renderSymbol(symbol, info));

    var _this = this;
    info.exchanges.forEach(function(exchange) {
        _this.addExchangeForSymbol(symbol, exchange);
    });
};

QuotesView.prototype.renderExchangeForSymbol = function (symbol, exchange) {
    var base_id = __(symbol, '-', exchange);

    return $__(
        '<div class="row">',
        '  <div class="col-xs-4">', 
        '    <h5>',
        '      <span target="', base_id, '"',
        '            class="collapse-exchange glyphicon glyphicon-chevron-right"',
        '            style="font-size: xx-small;"></span>  ',
        '       <img src="img/icon/', exchange, '.ico" ',
        '            width=16 height=16> ', 
        '       <a href="', this.exchanges[exchange].link,'">',
                  this.exchanges[exchange].description, 
        '       </a>',
        '    </h5>',
        '  </div>',
        '  <div class="col-xs-8"',
        '       id="', base_id, '-progress">',
        '    <div class="progress progress-striped active">',
        '      <div class="progress-bar" style="width: 100%">',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="col-xs-8 hide"',
        '       id="', base_id, '-error">',
        '    <div class="alert alert-danger">',
        '      <strong>Error</strong>',
        '      <span id="', base_id, '-error-msg"></span>',
        '    </div>',
        '  </div>',
        '  <div id="', base_id, '-prices" class="hide">',
        '    <div class="col-xs-4">',
        '      <h4>',
        '        <span class="label label-primary" ',
        '            id="', base_id, '-buy">',
        '        </span>',
        '      </h4>',
        '    </div>',
        '    <div class="col-xs-4">',
        '      <h4>',
        '        <span class="label label-primary" ',
        '              id="', base_id, '-sell">',
        '        </span>',
        '      </h4>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div id="', base_id, '-details" style="display: none;">',
        '  <div class="row">',
        '    <div class="col-xs-4">',
        '      <span style="font-size: small;">',
        '        <strong>Last published:</strong>',
        '      </span>',
        '    </div>',
        '    <div class="col-xs-8"',
        '         id="', base_id, '-last-published-progress">',
        '      <div class="progress progress-striped active">',
        '        <div class="progress-bar" style="width: 100%">',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div id="', base_id, '-last-published" class="hide">',
        '      <div class="col-xs-8">',
        '        <span id="', base_id, '-last-published-date" style="font-size: small;">',
        '        </span>',
        '        <span id="', base_id, '-last-published-ago" style="font-size: small;">',
        '        </span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-4">',
        '      <span style="font-size: small;">',
        '        <strong>Last updated:</strong>',
        '      </span>',
        '    </div>',
        '    <div class="col-xs-8"',
        '         id="', base_id, '-last-updated-progress">',
        '      <div class="progress progress-striped active">',
        '        <div class="progress-bar" style="width: 100%">',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div id="', base_id, '-last-updated" class="hide">',
        '      <div class="col-xs-8">',
        '        <span id="', base_id, '-last-updated-date" style="font-size: small;">',
        '        </span>',
        '        <span id="', base_id, '-last-updated-ago" style="font-size: small;">',
        '        </span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
    );  
};

QuotesView.prototype.addExchangeForSymbol = function (symbol, exchange) {
    var base_id = __(symbol, '-', exchange);

    $__('#prices-body-', symbol).append(
        this.renderExchangeForSymbol(symbol, exchange)
    );
};

QuotesView.prototype.renderPrice = function (price) {
    var selector_base = __("#", price.symbol, "-", price.exchange),
        prices_selector = __(selector_base, "-prices"),
        buy_selector = __(selector_base, "-buy"),
        sell_selector = __(selector_base, "-sell"),
        error_selector = __(selector_base, "-error"),
        progress_selector = __(selector_base, "-progress"),
        last_published_selector = __(selector_base, "-last-published"),
        last_published_date_selector = __(selector_base, "-last-published-date"),
        last_published_ago_selector = __(selector_base, "-last-published-ago"),
        last_published_progress_selector = __(selector_base, "-last-published-progress"),
        last_updated_selector = __(selector_base, "-last-updated"),
        last_updated_date_selector = __(selector_base, "-last-updated-date"),
        last_updated_ago_selector = __(selector_base, "-last-updated-ago"),
        last_updated_progress_selector = __(selector_base, "-last-updated-progress");
    
    var updated_on = (new Date(price.updated_on)).toLocaleString(),
        retrieved_on = (new Date(price.retrieved_on)).toLocaleString();

    $(buy_selector).html(price.buy ?
                         __(this.symbols[price.symbol].prefix, 
                            price.buy.toFixed(2)) : "N/A");
    $(sell_selector).html(price.sell ?
                          __(this.symbols[price.symbol].prefix, 
                             price.sell.toFixed(2)) : "N/A");

    $(last_published_date_selector).html(updated_on);
    $(last_updated_date_selector).html(retrieved_on);

    $(last_published_ago_selector).html(__('(?.??s ', 'ago)'));
    $(last_updated_ago_selector).html(__('(0.00s ', 'ago)'));

    $(prices_selector).removeClass("hide");
    $(error_selector).addClass("hide");
    $(progress_selector).addClass("hide");
    $(last_published_selector).removeClass("hide");
    $(last_published_progress_selector).addClass("hide");
    $(last_updated_selector).removeClass("hide");
    $(last_updated_progress_selector).addClass("hide");
};

QuotesView.prototype.renderPriceError = function (error) {
    var selector_base = __("#", error.info.symbol, "-", error.info.exchange),
        prices_selector = __(selector_base, "-prices"),
        error_selector = __(selector_base, "-error"),
        error_msg_selector = __(selector_base, "-error-msg"),
        progress_selector = __(selector_base, "-progress");

    $(error_msg_selector).html(error.message);

    $(error_selector).removeClass("hide");
    $(prices_selector).addClass("hide");
    $(progress_selector).addClass("hide");
};

QuotesView.prototype.renderGenericError = function (error) {
    $("#global-error").removeClass("hide");
    $("#global-error-msgs").empty();
    $("#global-error-msgs").append($__(
        "<li>", error.message, "</li>"
    ));
};

QuotesView.prototype.clearGenericError = function () {
    $("#global-error").addClass("hide");
    $("#global-error-msgs").empty();
};

QuotesView.prototype.timedelta = function(last_update) {
    var delta = ((new Date()) - last_update) / 1000,
        frames = {},
        ret = '';

    frames.minute = {seconds: 60, suffix: 'm'};
    frames.hour = {seconds: frames.minute.seconds * 60, suffix: 'h'};
    frames.day = {seconds: frames.hour.seconds * 24, suffix: 'd'};
    frames.week = {seconds: frames.day.seconds * 7, suffix: 'w'};

    ['week', 'day', 'hour', 'minute'].forEach(function (frame) {
        if (delta >= frames[frame].seconds) {
            var units = Math.floor(delta / frames[frame].seconds);
            ret += units + frames[frame].suffix + ' ';
            delta = delta % frames[frame].seconds;
        }
    });

    return ret + delta.toFixed(2) + 's';
};

QuotesView.prototype.updateGlobalTimer = function (last_update) {
    $("#quotes-updated-ago").html(this.timedelta(last_update));
};

QuotesView.prototype.updateQuoteTimer = function (quote) {
    var selector_base = __("#", quote.symbol, "-", quote.exchange);

    $__(selector_base, "-last-published-ago").html(
        __('(', this.timedelta(new Date(quote.updated_on)), ' ago)')
    );
    $__(selector_base, "-last-updated-ago").html(
        __('(', this.timedelta(new Date(quote.retrieved_on)), ' ago)')
    );
};

function QuotesModel() {
    this.quotes = {};
}

QuotesModel.prototype.updateQuote = function(quote) {
    if (!(quote.symbol in this.quotes))
        this.quotes[quote.symbol] = {};

    this.quotes[quote.symbol][quote.exchange] = quote;
};

QuotesModel.prototype.getQuote = function(symbol, exchange) {
    if (!(symbol in this.quotes))
        return;

    if (!(exchange in this.quotes[symbol]))
        return;
    
    return this.quotes[symbol][exchange];
};

function QuotesController(view, model) {
    this.view = view;
    this.model = model;
    this.updated_on = new Date();
    this.watchdog();
}

QuotesController.prototype.start = function () {
    this.view.render();
    this.view.hookCollapseButtons();
};

QuotesController.prototype.onPriceUpdated = function (price) {
    this.updated_on = new Date();
    this.model.updateQuote(price);
    this.view.renderPrice(price);
};

QuotesController.prototype.onConnect = function (error) {
    this.view.clearGenericError();
};

QuotesController.prototype.onError = function (error) {
    if (!error.info || !error.info.exchange || !error.info.symbol) {
        this.view.renderGenericError(error);
    } else {
        this.view.renderPriceError(error);
    }
};

QuotesController.prototype.watchdog = function () {
    this.view.updateGlobalTimer(this.updated_on);

    for (var symbol in this.model.quotes) {
        for (var exchange in this.model.quotes[symbol]) {
            var quote = this.model.getQuote(symbol, exchange);
            this.view.updateQuoteTimer(quote);
        }
    }

    setTimeout(this.watchdog.bind(this), 1000);
};

QuotesController.prototype.getQuote = function (symbol, exchange) {
    return this.model.getQuote(symbol, exchange);
};

QuotesController.prototype.getExchanges = function (symbol) {
    return this.view.symbols[symbol].exchanges;
};

QuotesController.prototype.getExchangeDescription = function (exchange) {
    return this.view.exchanges[exchange].description;
};

function PortfolioModel() {
    this.portfolios = undefined;
    this.main_exchange = undefined;
}

PortfolioModel.prototype.save = function () {
    localStorage["portfolio.portfolios"] = JSON.stringify(this.portfolios);
    localStorage["portfolio.main_exchange"] = this.main_exchange;
};

PortfolioModel.prototype.load = function () {
    this.portfolios = JSON.parse(localStorage["portfolio.portfolios"] || null) || [];
    this.main_exchange = localStorage["portfolio.main_exchange"] || 'coinbase';
};

PortfolioModel.prototype.setMainExchange = function (exchange) {
    this.main_exchange = exchange;
    this.save();
};

PortfolioModel.prototype.savePortfolio = function (portfolio) {
    this.portfolios.push(portfolio);
    this.save();
};

PortfolioModel.prototype.deletePortfolio = function (guid) {
    var _this = this;

    this.portfolios.forEach(function(portfolio, index) {
        if (portfolio.guid == guid) {
            _this.portfolios.splice(index, 1);
        }
    });

    this.save();
};

PortfolioModel.prototype.saveTrade = function (portfolio, trade) {
    var _this = this;

    this.portfolios.forEach(function(portfolio_) {
        if (portfolio_.guid == portfolio.guid) {
            portfolio_.trades.push(trade);
        }
    });

    this.save();
};

PortfolioModel.prototype.deleteTrade = function (guid) {
    var _this = this;

    this.portfolios.forEach(function(portfolio) {
        portfolio.trades.forEach(function(trade, index) {
            if (trade.guid == guid) {
                portfolio.trades.splice(index, 1);
            }
        });
    });

    this.save();
};

function PortfolioView() {
    this.controller = undefined;
}

PortfolioView.prototype.setController = function (controller) {
    this.controller = controller;
};

PortfolioView.prototype.render = function (portfolios) {
    var _this = this;

    portfolios.forEach(function(portfolio) {
        _this.addPortfolio(portfolio);
        portfolio.trades.forEach(function(trade) {
            _this.addTrade(portfolio, trade);
        });
    });
};

PortfolioView.prototype.updateTradeReturn = function(trade, investment) {
    var selector_base = __('#trade-', trade.guid);

    this.updateInvestment(selector_base, investment);
};

PortfolioView.prototype.renderTrade = function(portfolio, trade) {
    return $__(
        '<li class="list-group-item" ',
        '    id="trade-', trade.guid, '">', 
        '  <button type="button" class="close" aria-hidden="true"',
        '          id="btn-', trade.guid, '-remove">', 
        '    &times;',
        '  </button>',
        '  <div class="row">',
        '    <div class="col-sm-6">',
        '      <h5>',
        '        <strong>', trade.amount, ' BTC</strong> for ',
        '        <strong>', trade.price, ' USD</strong>',
        '        (', (trade.price / trade.amount).toFixed(2), ' USD/BTC)',
        '      </h5>',
        '      <h5>',
        '        Value: ',
        '        <strong>',
        '          <span id="trade-', trade.guid, '-current-value">',
        '            ??',
        '          </span> USD',
        '        </strong>',
        '        Profit: <strong>',
        '          <span id="trade-', trade.guid, '-profit">',
        '            ??',
        '          </span> USD',
        '        </strong>',
        '      </h5>',
        '    </div>',
        '    <div class="col-sm-6">',
        '      <h4>', 
        '        <span class="label label-default" ',
        '              id="trade-', trade.guid, '-gain">',
        '          ??.??',
        '        </span>',
        '      </h4>',
        '    </div>',
        '  </div>',
        '</li>'
    );
};

PortfolioView.prototype.addTrade = function(portfolio, trade) {
    var _this = this;

    $__("#portfolio-", portfolio.guid, "-trades").append(
        this.renderTrade(portfolio, trade)
    );

    $__("#btn-", trade.guid, "-remove").click(function (event) {
        event.preventDefault();
        _this.controller.deleteTrade(trade.guid);
    });
};

PortfolioView.prototype.removeTrade = function(guid) {
    $__("#trade-", guid).remove();
};

PortfolioView.prototype.renderPortfolio = function(portfolio) {
    return $__(
        '<div class="panel panel-default" ',
        '     id="portfolio-', portfolio.guid, '">',
        '  <div class="panel-heading">',
        '    <button type="button" class="close" aria-hidden="true"',
        '            id="btn-', portfolio.guid,'-remove">', 
        '      &times;',
        '    </button>',
        '    <h4>', portfolio.name, 
        '      <span class="label label-default" style="margin-left: 10px"',
        '          id="portfolio-', portfolio.guid, '-gain">',
        '        0.00%',
        '      </span>',
        '    </h4>',
        '  </div>',
        '  <div class="panel-body" id="portfolio-', portfolio.guid, '-totals">',
        '    <div class="row">',
        '      <div class="col-sm-6">',
        '        <h5>',
        '          <div>',
        '            Portfolio holdings: ',
        '            <strong>', 
        '              <span id="portfolio-', portfolio.guid, '-holdings"',
        '                    style="font-size: large;">',
        '                0',
        '              </span> BTC',
        '            </strong>',
        '          </div>',
        '          <div>',
        '            Portfolio cost: ',
        '            <strong>',
        '              <span id="portfolio-', portfolio.guid, '-cost">',
        '                0',
        '              </span> USD',
        '            </strong>',
        '          </div>',
        '          <div>',
        '            Avg: ', 
        '            <span id="portfolio-', portfolio.guid, '-avg-price">',
        '              0',
        '            </span> USD/BTC',
        '          </div>',
        '          <div>',
        '            Current: ', 
        '            <span id="portfolio-', portfolio.guid, '-current-price">',
        '              0',
        '            </span> USD/BTC',
        '          </div>',
        '        </h5>',
        '      </div>',
        '      <div class="col-sm-6">',
        '        <h5>',
        '          <div>',
        '            Current value: ',
        '            <strong>',
        '              <span id="portfolio-', portfolio.guid, '-current-value"',
        '                    style="font-size: large;">',
        '                0',
        '              </span> USD',
        '            </strong>',
        '          </div>',
        '          <div>',
        '            Profit: <strong>',
        '              <span id="portfolio-', portfolio.guid, '-profit">',
        '                0',
        '              </span> USD',
        '            </strong>',
        '          </div>',
        '        </h5>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <ul class="list-group" id="portfolio-', portfolio.guid, '-trades">',
        '  </ul>',
        '  <ul class="list-group">',
        '    <li class="list-group-item">',
        '      <form class="form-inline" role="form">',
        '        <div class="row">',
        '          <div class="form-group col-sm-3" ',
        '               id="input-', portfolio.guid, '-amount">',
        '            <div class="input-group">',
        '              <input type="number" step="any" ',
        '                     class="form-control" ',
        '                     placeholder="Enter amount">',
        '              <span class="input-group-addon">BTC</span>',
        '            </div>',
        '          </div>',
        '          <div class="form-group col-sm-3" ',
        '               id="input-', portfolio.guid, '-price">',
        '            <div class="input-group">',
        '              <input type="number" step="any"',
        '                     class="form-control" ',
        '                     placeholder="Enter price">',
        '              <span class="input-group-addon">USD</span>',
        '            </div>', 
        '          </div>',
        '          <div class="col-sm-2">',
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
};

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
};

PortfolioView.prototype.updatePortfolioReturn = function(portfolio, holdings, return_) {
    var selector_base = __('#portfolio-', portfolio.guid);

    this.updateInvestment(selector_base, holdings, return_);
};

PortfolioView.prototype.removePortfolio = function(guid) {
    $__("#portfolio-", guid).remove();
};

PortfolioView.prototype.updateGlobalReturn = function(holdings, return_) {
    this.updateInvestment("#global", holdings, return_);
};

PortfolioView.prototype.updateInvestment = function(selector_base, investment) {
    if (!investment)
        return;

    $__(selector_base, '-holdings').html(investment.holdings.toFixed(2));
    $__(selector_base, '-cost').html(investment.cost.toFixed(2));
    $__(selector_base, '-avg-price').html(investment.average.toFixed(2));
    $__(selector_base, '-current-price').html(investment.current_price.toFixed(2));
    
    $__(selector_base, '-current-value').html(investment.current_value.toFixed(2));
    $__(selector_base, '-profit').html(investment.profit.toFixed(2));

    $__(selector_base, '-gain').html(__(
        investment.gain < 0 ? '' : '+', (investment.gain * 100).toFixed(2), '%'
    ));

    var classes = ['label-default', 'label-danger', 'label-success'];

    classes.forEach(function (label_class) {
        $__(selector_base, '-gain').removeClass(label_class);
    });
    
    $__(selector_base, '-gain').addClass(
        investment.gain < 0 ? 'label-danger' : 'label-success'
    );
};

PortfolioView.prototype.start = function(main_exchange) {
    var self = this;

    this.updateMainExchange(main_exchange);

    self.controller.getExchanges("BTCUSD").forEach(function (exchange) {
        $('#portfolio-exchanges').append($__(
            '<li>',
            '  <a id="btn-portfolio-exchange-', exchange, '">', 
                 self.controller.getExchangeDescription(exchange), 
            '    (<span id="portfolio-exchange-', exchange, '-price">',
            '     ?? </span> USD)',
            '  </a>',
            '</li>'
        ));
        $__('#btn-portfolio-exchange-', exchange).click(function (event) {
            event.preventDefault();
            self.controller.setMainExchange(exchange);
        });
    });

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

            self.controller.createPortfolio(portfolio_name);
        }
    });
};

PortfolioView.prototype.updateMainExchange = function (exchange) {
    $("#portfolio-main-exchange").html(
        this.controller.getExchangeDescription(exchange)
    );
};

PortfolioView.prototype.updateExchangePrice = function (exchange, quote) {
    $__('#portfolio-exchange-', exchange, '-price').html(quote.toFixed(2));
};

function PortfolioController(view, model) {
    this.view = view;
    this.model = model;

    this.view.setController(this);
    this.quotes_controller = undefined;
}

PortfolioController.prototype.setQuotesController = function(controller) {
    this.quotes_controller = controller;
};

PortfolioController.prototype.start = function () {
    this.model.load();
    this.view.start(this.model.main_exchange);
    this.view.render(this.model.portfolios);
};

PortfolioController.prototype.getInvestmentInfo = function (investment) {
    var quote = this.quotes_controller.getQuote('BTCUSD', this.model.main_exchange);

    if (!quote) 
        return undefined;

    var average = ((investment.amount > 0) 
                     ? (investment.price / investment.amount) : 0),
        current_value = investment.amount * quote.buy,
        profit = current_value - investment.price,
        gain = ((investment.price > 0 && investment.amount > 0) 
                 ? (current_value / investment.price) - 1 : 0);
    
    return {
        holdings: investment.amount,
        cost: investment.price,
        average: average,
        current_value: current_value,
        current_price: quote.buy,
        profit: profit,
        gain: gain
    };
};

PortfolioController.prototype.getExchanges = function (symbol) {
    return this.quotes_controller.getExchanges(symbol);
};

PortfolioController.prototype.getExchangeDescription = function (exchange) {
    return this.quotes_controller.getExchangeDescription(exchange);
};

PortfolioController.prototype.onPriceUpdated = function (price) {
    if (price.symbol != 'BTCUSD')
        return;

    if (price.exchange == this.model.main_exchange)
        this.updateInvestments();

    this.updateExchangePrice(price);
};

PortfolioController.prototype.updateInvestments = function() {
    var _this = this;

    var global_total = {
        amount: 0,
        price: 0
    };

    this.model.portfolios.forEach(function (portfolio) {
        var portfolio_total = {
            amount: 0, 
            price: 0
        };

        portfolio.trades.forEach(function (trade) {
            portfolio_total.amount += trade.amount;
            portfolio_total.price += trade.price;

            _this.view.updateTradeReturn(
                trade, 
                _this.getInvestmentInfo(trade)
            );
        });

        global_total.amount += portfolio_total.amount;
        global_total.price += portfolio_total.price;

        _this.view.updatePortfolioReturn(
            portfolio,
            _this.getInvestmentInfo(portfolio_total)
        );
    });

    _this.view.updateGlobalReturn(_this.getInvestmentInfo(global_total));
};

PortfolioController.prototype.updateExchangePrice = function(price) {    
    var quote = this.quotes_controller.getQuote(price.symbol, price.exchange);

    this.view.updateExchangePrice(price.exchange, quote.buy);
};

PortfolioController.prototype.setMainExchange = function(exchange) {
    this.model.setMainExchange(exchange);
    this.updateInvestments();
    this.view.updateMainExchange(exchange);
};

PortfolioController.prototype.createPortfolio = function (name) {
    var portfolio = {
        guid: guid(),
        name: name,
        trades: [],
    };

    this.model.savePortfolio(portfolio);
    this.view.addPortfolio(portfolio);

    this.updateInvestments();
};

PortfolioController.prototype.createTrade = function (portfolio, amount, price) {
    var trade = {
        guid: guid(),
        amount: amount,
        price: price
    };

    this.model.saveTrade(portfolio, trade);
    this.view.addTrade(portfolio, trade);

    this.updateInvestments();
};

PortfolioController.prototype.deletePortfolio = function (guid) {
    this.model.deletePortfolio(guid);
    this.view.removePortfolio(guid);

    this.updateInvestments();
};

PortfolioController.prototype.deleteTrade = function (guid) {
    this.model.deleteTrade(guid);
    this.view.removeTrade(guid);

    this.updateInvestments();
};

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
};

GlobalView.prototype.activateSection = function (section) {
    // activate the main 'quotes' section:
    $__(".navbar-button[target='", section, "']").click();
};

GlobalView.prototype.setWindowTitle = function (title) {
    document.title = title;
};

function GlobalController(view) {
    this.view = view;
}

GlobalController.prototype.start = function() {
    this.view.hookSidebarButtons();
    this.view.activateSection("quotes");
};

GlobalController.prototype.onPriceUpdated = function (price) {
    // TODO: add support for selecting symbol and exchange

    if (price.symbol != 'BTCUSD')
        return;

    if (price.exchange != 'bitstamp')
        return;

    this.view.setWindowTitle('($' + price.sell + ') - Price Tracker');
};

function init_app () {
    global_view = new GlobalView();
    global_controller = new GlobalController(global_view);

    quotes_view = new QuotesView();
    quotes_model = new QuotesModel();
    quotes_controller = new QuotesController(quotes_view, quotes_model);

    portfolio_view = new PortfolioView();
    portfolio_model = new PortfolioModel();
    portfolio_controller = new PortfolioController(portfolio_view, 
                                                   portfolio_model);
    portfolio_controller.setQuotesController(quotes_controller);

    global_controller.start();
    quotes_controller.start();
    portfolio_controller.start();
}

function init_client () {
    var url = location.origin.replace(/^http/, 'ws');

    var wsclient = new WSClient(url);

    wsclient.addHandler("onConnect", function() {
        quotes_controller.onConnect();
        this.requestExchanges();
    });

    wsclient.addHandler("onExchangesListReceived", function(exchanges) {
        this.requestPrices(exchanges);
    });

    wsclient.addHandler("onPriceUpdated", function(price) {
        global_controller.onPriceUpdated(price);
        quotes_controller.onPriceUpdated(price);
        portfolio_controller.onPriceUpdated(price);
    });

    wsclient.addHandler("onError", function (error) {
        quotes_controller.onError(error);
    });

    wsclient.addHandler("onDisconnect", function() {
        quotes_controller.onError({message:'Disconnected'});
    });

    wsclient.connect();
}

$(document).ready(function() {
    init_app();
    init_client();
});