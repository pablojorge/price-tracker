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
            description: 'Ambito',
            links: [{desc: 'Info', link: 'http://www.ambito.com.ar/economia/mercados/monedas/dolar/'}]
        },
        'binance' : {
            description: 'Binance',
            links: [{desc: 'Markets', link: 'https://www.binance.com/en/markets'}]
        },
        'bitfinex' : {
            description: 'Bitfinex',
            links: [{desc: 'Stats', link: 'https://www.bitfinex.com/pages/stats'}]
        },
        'bitstamp' : {
            description: 'Bitstamp',
            links: [{desc: 'Trade View', link: 'https://www.bitstamp.net/market/tradeview/'}]
        },
        'blockchain' : {
            description: 'Blockchain',
            links: [{desc: 'Markets', link: 'https://exchange.blockchain.com/markets'}]
        },
        'bna' : {
            description: 'Banco Nacion',
            links: [{desc: 'Info', link: 'http://www.bna.com.ar/'}]
        },
        'bullionvault' : {
            description: 'BullionVault',
            links: [{desc: 'Home', link: 'https://www.bullionvault.com'}]
        },
        'coinbase' : {
            description: 'Coinbase',
            links: [{desc: 'Charts', link: 'https://coinbase.com/charts'}]
        },
        'cronista' : {
            description: 'Cronista',
            links: [{desc: 'Home', link: 'http://www.cronista.com/MercadosOnline/monedas.html'}]
        },
        'gemini' : {
            description: 'Gemini',
            links: [{desc: 'Home', link: 'https://gemini.com/'}]
        },
        'kraken' : {
            description: 'Kraken',
            links: [{desc: 'Charts', link: 'https://www.kraken.com/charts'}]
        },
        'okcoin' : {
            description: 'OKCoin',
            links: [{desc: 'Market', link: 'https://www.okcoin.com/market.do'}]
        },
        'poloniex': {
            description: 'Poloniex',
            links: [{desc: 'Exchange', link: 'https://poloniex.com/exchange'}]
        },
        'santander': {
            description: 'Santander',
            links: [{desc: 'Cotizacion', link: 'https://banco.santanderrio.com.ar/exec/cotizacion/index.jsp'}]
        },
        'xapo' : {
            description: 'Xapo',
            links: [{desc: 'Home', link: 'https://www.xapo.com/'}]
        }
    };

    this.symbols = {
        'BCHUSD' : {
            description: '(Bitcoin Cash)',
            exchanges: ['bitstamp', 'blockchain', 'coinbase', 'kraken'],
            icon: 'BCHUSD.png',
            prefix: '$',
            column: '2',
            unit: 'BCH'
        },
        'BTCUSD' : {
            description: '(Bitcoin)',
            exchanges: ['binance', 'bitstamp', 'blockchain', 'coinbase',
                        'xapo',
                        'okcoin', 'bitfinex',
                        'kraken', 'poloniex',
                        'gemini'],
            icon: 'BTCUSD.png',
            prefix: '$',
            column: '2',
            unit: 'BTC'
        },
        'BTGUSD' : {
            description: '(Bitcoin Gold)',
            exchanges: ['bitfinex'],
            icon: 'BTGUSD.png',
            prefix: '$',
            column: '2',
            unit: 'BTC'
        },
        'ETCUSD' : {
            description: '(Ethereum Classic)',
            exchanges: ['coinbase', 'binance', 'poloniex', 'bitfinex'],
            icon: 'ETCUSD.png',
            prefix: '$',
            column: '2',
            unit: 'ETH'
        },
        'ETHUSD' : {
            description: '(Ethereum)',
            exchanges: ['bitstamp', 'blockchain', 'coinbase', 'binance',
                        'kraken', 'poloniex', 'bitfinex', 'gemini', 'okcoin'],
            icon: 'ETHUSD.png',
            prefix: '$',
            column: '2',
            unit: 'ETH'
        },
        'LTCUSD' : {
            description: '(Litecoin)',
            exchanges: ['bitstamp', 'blockchain', 'coinbase', 'binance', 
                        'okcoin', 'bitfinex', 'kraken', 'poloniex'],
            icon: 'LTCUSD.png',
            prefix: '$',
            column: '2',
            unit: 'LTC'
        },
        'ZECUSD' : {
            description: '(ZCash)',
            exchanges: ['binance', 'coinbase', 'kraken', 'poloniex'],
            icon: 'ZECUSD.png',
            prefix: '$',
            column: '2',
            unit: 'ZEC'
        },
        'XMRUSD' : {
            description: '(Monero)',
            exchanges: ['binance', 'poloniex'],
            icon: 'XMRUSD.png',
            prefix: '$',
            column: '2',
            unit: 'XMR'
        },
        'XLMUSD' : {
            description: '(Stellar Lumens)',
            exchanges: ['binance', 'blockchain', 'coinbase', 'poloniex'],
            icon: 'XLMUSD.png',
            prefix: '$',
            column: '2',
            unit: 'XLM'
        },
        'XRPUSD' : {
            description: '(Ripple)',
            exchanges: ['bitstamp', 'binance', 'blockchain', 'coinbase', 'poloniex'],
            icon: 'XRPUSD.png',
            prefix: '$',
            column: '2',
            unit: 'XRP'
        },
        'USDARS' : {
            description: '(Dolar oficial)',
            exchanges: ['ambito', 'cronista', 'santander', 'bna'],
            icon: 'USDARS.png',
            prefix: 'AR$',
            column: '1'
        },
        'USDARSB' : {
            description: '(Dolar blue)',
            exchanges: ['ambito', 'cronista'],
            icon: 'USDARSB.svg',
            prefix: 'AR$',
            column: '1'
        },
        'USDARSCL' : {
            description: '(Cont. liqui)',
            exchanges: ['cronista'],
            icon: 'USDARSCL.svg',
            prefix: 'AR$',
            column: '1'
        },
        'XAGUSD' : {
            description: '(Silver)',
            exchanges: ['bullionvault'],
            icon: 'XAGUSD.png',
            prefix: '$',
            column: '2',
            unit: 'XAG'
        },
        'XAUUSD' : {
            description: '(Gold)',
            exchanges: ['bullionvault'],
            icon: 'XAUUSD.png',
            prefix: '$',
            column: '2',
            unit: 'XAU'
        },
        'PAXGUSD' : {
            description: '(Paxos Gold)',
            exchanges: ['kraken'],
            icon: 'PAXGUSD.png',
            prefix: '$',
            column: '2',
            unit: 'PAXG'
        },
    };

    this.symbol_list = [
        'USDARS', 'USDARSB', 'USDARSCL',
        null,
        'BTCUSD', 'BCHUSD', 'BTGUSD',
        null,
        'ETHUSD', 'ETCUSD',
        null,
        'LTCUSD', 'XMRUSD', 'ZECUSD',
        null,
        'XLMUSD', 'XRPUSD',
        null,
        'XAUUSD', 'PAXGUSD', 'XAGUSD'
    ];
}

QuotesView.prototype.render = function() {
    var self = this;

    this.symbol_list.forEach(function(symbol) {
        self.addSymbol(symbol, self.symbols[symbol]);
    });
};

QuotesView.prototype.drawExchangeChart = function(symbol, exchange, force) {
    var series_url = (
        location.origin + '/api/v1/symbols/' +
        symbol + '/' + exchange + '/series'
    );

    var chart = $__('#exchange-chart-', symbol, '-', exchange).highcharts();

    if (chart !== undefined && !force)
        return;

    chart = this.generateExchangeChart(symbol, exchange);

    chart.showLoading('Loading data...');

    $.getJSON(series_url, function (response) {
        var series = function (name) {
            return response.data.series.map(function (item) {
                return [
                    new Date(item.date) * 1,
                    item[name].open,
                    item[name].high,
                    item[name].low,
                    item[name].close,
                ];
            });
        };

        chart.series[0].setData(series('ask'));

        chart.hideLoading();
    });
};

QuotesView.prototype.redrawExchangeChart = function(symbol, exchange) {
    this.drawExchangeChart(symbol, exchange, true);
};

QuotesView.prototype.updateExchangeChart = function(symbol, exchange, ohlc) {
    var chart = $__('#exchange-chart-', symbol, '-', exchange).highcharts();

    if (chart === undefined)
        return;

    var series = chart.series[0],
        last = series.data[series.data.length - 1],
        date = new Date(ohlc.date) * 1,
        point = [
            date,
            ohlc.ask.open,
            ohlc.ask.high,
            ohlc.ask.low,
            ohlc.ask.close
        ];

    if (last === undefined) {
        return;
    }

    if (last.x === date) {
        last.update(point);
    } else {
        series.addPoint(point);
    }
};

QuotesView.prototype.getDeltaStyle = function(model) {
    return model.getPreference("delta-style") || "percent";
};

QuotesView.prototype.setDeltaStyle = function(model, style) {
    model.setPreference("delta-style", style);
};

QuotesView.prototype.getSelectedSymbol = function(model) {
    return model.getSelectedSymbol() ||
           this.symbol_list[0];
};

QuotesView.prototype.getSelectedExchange = function(model, symbol) {
    return model.getSelectedExchange(symbol) ||
           this.symbols[symbol].exchanges[0];
};

QuotesView.prototype.onSymbolSelected = function(model, symbol) {
    var exchange = this.getSelectedExchange(model, symbol);

    $(".select-symbol").removeClass('custom-nav-selected');
    $(".select-symbol").addClass('custom-nav-not-selected');

    $__("#select-symbol-", symbol).removeClass('custom-nav-not-selected');
    $__("#select-symbol-", symbol).removeClass('custom-nav-hover');
    $__("#select-symbol-", symbol).addClass('custom-nav-selected');

    $(".exchanges-body").addClass("hide");
    $__("#exchanges-body-", symbol).removeClass("hide");

    $(".exchanges-modal-body").addClass("hide");
    $__("#exchanges-modal-body-", symbol).removeClass("hide");

    this.onExchangeSelected(model, symbol, exchange);
};

QuotesView.prototype.onNextSymbolRequested = function(model) {
    var self = this;
    var current_symbol = self.getSelectedSymbol(model);
    var current_found = false;
    var next_symbol = null;

    self.symbol_list.forEach(function(symbol) {
        if (!symbol)
            return;

        if (!model.isSymbolVisible(symbol))
            return;

        if (symbol == current_symbol) {
            current_found = true;
            return;
        }

        if (current_found && !next_symbol) {
            next_symbol = symbol;
        }
    });

    model.setSelectedSymbol(next_symbol);
    self.onSymbolSelected(model, next_symbol);
};

QuotesView.prototype.onPreviousSymbolRequested = function(model) {
    var self = this;
    var current_symbol = self.getSelectedSymbol(model);
    var current_found = false;
    var next_symbol = self.symbol_list[0];

    self.symbol_list.forEach(function(symbol) {
        if (!symbol)
            return;

        if (!model.isSymbolVisible(symbol))
            return;

        if (symbol == current_symbol) {
            current_found = true;
            return;
        }

        if (!current_found) {
            next_symbol = symbol;
        }
    });

    model.setSelectedSymbol(next_symbol);
    self.onSymbolSelected(model, next_symbol);
};

QuotesView.prototype.onNextExchangeRequested = function(model) {
    var self = this;
    var current_symbol = self.getSelectedSymbol(model);
    var current_exchange = self.getSelectedExchange(model, current_symbol);
    var current_found = false;
    var next_exchange = null;

    self.symbols[current_symbol].exchanges.forEach(function(exchange) {
        if (!model.isExchangeVisible(current_symbol, exchange)) {
            return;
        }

        if (exchange == current_exchange) {
            current_found = true;
            return;
        }

        if (current_found && !next_exchange) {
            next_exchange = exchange;
        }
    });

    if (!next_exchange) {
        return;
    }

    model.setSelectedExchange(current_symbol, next_exchange);
    self.onExchangeSelected(model, current_symbol, next_exchange);
};

QuotesView.prototype.onPreviousExchangeRequested = function(model) {
    var self = this;
    var current_symbol = self.getSelectedSymbol(model);
    var current_exchange = self.getSelectedExchange(model, current_symbol);
    var current_found = false;
    var next_exchange = null;

    self.symbols[current_symbol].exchanges.forEach(function(exchange) {
        if (!model.isExchangeVisible(current_symbol, exchange)){
            return;
        }

        if (!next_exchange) {
            next_exchange = exchange;
        }
    });

    self.symbols[current_symbol].exchanges.forEach(function(exchange) {
        if (!model.isExchangeVisible(current_symbol, exchange)){
            return;
        }

        if (exchange == current_exchange) {
            current_found = true;
            return;
        }

        if (!current_found) {
            next_exchange = exchange;
        }
    });

    model.setSelectedExchange(current_symbol, next_exchange);
    self.onExchangeSelected(model, current_symbol, next_exchange);
};

QuotesView.prototype.onReloadRequested = function(model) {
    var self = this;
    var symbol = self.getSelectedSymbol(model),
        exchange = self.getSelectedExchange(model, symbol);

    self.redrawExchangeChart(symbol, exchange);
}

QuotesView.prototype.onDeltaStyleSwitchRequested = function(model) {
    var style = this.getDeltaStyle(model),
        new_style = (style == "percent") ? "price" : "percent";

    this.onDeltaStyleSelected(new_style);
    this.setDeltaStyle(model, new_style);
};

QuotesView.prototype.onExchangeSelected = function(model, symbol, exchange) {
    $(".select-exchange").removeClass('custom-nav-selected');
    $(".select-exchange").addClass('custom-nav-not-selected');

    $__("#select-exchange-", symbol, '-', exchange).removeClass('custom-nav-not-selected');
    $__("#select-exchange-", symbol, '-', exchange).removeClass('custom-nav-hover');
    $__("#select-exchange-", symbol, '-', exchange).addClass('custom-nav-selected');

    $(".exchange-details").addClass("hide");
    $__("#exchange-details-", symbol, '-', exchange).removeClass("hide");

    $(".exchange-chart").addClass("hide");
    $__("#exchange-chart-", symbol, '-', exchange).removeClass("hide");

    $__(".symbol-prices-view-", symbol).addClass("hide");
    $__("#symbol-prices-view-", symbol, '-', exchange).removeClass("hide");

    this.drawExchangeChart(symbol, exchange);
    var price = model.getQuote(symbol, exchange);
    if (price == null) return; // during startup the quotes are not available
    this.renderWindowTitle(price, model);
};

QuotesView.prototype.onDeltaStyleSelected = function (delta_style) {
    if (delta_style === "percent") {
        $(".change-price").addClass('hide');
        $(".change-percent").removeClass('hide');
    } else if (delta_style === "price") {
        $(".change-price").removeClass('hide');
        $(".change-percent").addClass('hide');
    } else {
        console.log("Unexpected delta_style", delta_style);
    }
};

QuotesView.prototype.hookPriceLabels = function (model) {
    var self = this;

    $(".change-price").bind('click', function(event) {
        event.preventDefault();

        self.onDeltaStyleSelected("percent");
        self.setDeltaStyle(model, "percent");

        return false;
    });

    $(".change-percent").bind('click', function(event) {
        event.preventDefault();

        self.onDeltaStyleSelected("price");
        self.setDeltaStyle(model, "price");

        return false;
    });

    $('.change-price, .change-percent').hover(
        function() {
            $(this).addClass('custom-nav-hover');
        },
        function() {
            $(this).removeClass('custom-nav-hover');
        }
    );
};

QuotesView.prototype.hookSelectionButtons = function (model) {
    var self = this;

    $(".select-symbol").bind('click', function(event) {
        event.preventDefault();

        var symbol = $(this).attr("target");
        model.setSelectedSymbol(symbol);
        self.onSymbolSelected(model, symbol);

        return false;
    });

    $('.select-symbol').hover(
        function() {
            if (!$(this).hasClass('custom-nav-selected')) {
                $(this).removeClass('custom-nav-not-selected');
                $(this).addClass('custom-nav-hover');
            }
        },
        function() {
            $(this).removeClass('custom-nav-hover');

            if (!$(this).hasClass('custom-nav-selected')) {
                $(this).addClass('custom-nav-not-selected');
            }
        }
    );

    $(".select-exchange").bind('click', function(event) {
        event.preventDefault();

        var symbol = self.getSelectedSymbol(model),
            exchange = $(this).attr("target");
        model.setSelectedExchange(symbol, exchange);
        self.onExchangeSelected(model, symbol, exchange);

        return false;
    });

    $('.select-exchange').hover(
        function() {
            if (!$(this).hasClass('custom-nav-selected')) {
                $(this).removeClass('custom-nav-not-selected');
                $(this).addClass('custom-nav-hover');
            }
        },
        function() {
            $(this).removeClass('custom-nav-hover');

            if (!$(this).hasClass('custom-nav-selected')) {
                $(this).addClass('custom-nav-not-selected');
            }
        }
    );
};

QuotesView.prototype.hookKeyboardShortcuts = function (model) {
    var self = this;

    document.body.onkeydown = function(event) {
        if (event.key == 'j') {
            self.onNextSymbolRequested(model);
        } else if (event.key == 'k') {
            self.onPreviousSymbolRequested(model);
        } else if (event.key == 'n') {
            self.onNextExchangeRequested(model);
        } else if (event.key == 'p') {
            self.onPreviousExchangeRequested(model);
        } else if (event.key == 'c') {
            self.onDeltaStyleSwitchRequested(model);
        } else if (event.key == 's') {
            $("#symbols-modal").modal('show');
        } else if (event.key == 'e') {
            $("#exchanges-modal").modal('show');
        } else if (event.key == 'r') {
            self.onReloadRequested(model);
        } else if (event.key == '?') {
            $("#keyboard-shortcuts-modal").modal('show');
        }
    }
};

QuotesView.prototype.hookFixedButtons = function (model) {
    var self = this;

    $("#symbols-modal-save").bind('click', function(event) {
        self.symbol_list.forEach(function(symbol) {
            var checkbox = $__("#checkbox-symbol-", symbol);
            model.setSymbolVisible(symbol, checkbox.prop("checked"));
        });

        self.restoreVisibility(model);

        return true;
    });

    $("#exchanges-modal-save").bind('click', function(event) {
        var symbol = self.getSelectedSymbol(model);

        self.symbols[symbol].exchanges.forEach(function(exchange) {
            var checkbox = $__("#checkbox-exchange-", symbol, "-", exchange);
            model.setExchangeVisible(symbol, exchange, checkbox.prop("checked"));
        });

        self.restoreVisibility(model);

        return true;
    });

    $("#chart-reload").bind('click', function(event) {
        self.onReloadRequested()

        return false;
    });
};

QuotesView.prototype.restoreSelectionStatus = function (model) {
    var symbol = this.getSelectedSymbol(model);
    this.onSymbolSelected(model, symbol);
};

QuotesView.prototype.restorePreferences = function (model) {
    var style = this.getDeltaStyle(model);
    this.onDeltaStyleSelected(style);
};

QuotesView.prototype.restoreVisibility = function (model) {
    var self = this;

    self.symbol_list.forEach(function(symbol) {
        if (!symbol)
            return;

        var checkbox = $__("#checkbox-symbol-", symbol),
            visible = model.isSymbolVisible(symbol);

        checkbox.prop("checked", visible);

        if (visible) {
            $__("#row-symbol-", symbol).removeClass("hide");
        } else {
            $__("#row-symbol-", symbol).addClass("hide");
        }

        var exchange = self.getSelectedExchange(model, symbol);
        self.onExchangeSelected(model, symbol, exchange);

        self.symbols[symbol].exchanges.forEach(function(exchange) {
            var checkbox = $__("#checkbox-exchange-", symbol, "-", exchange),
                visible = model.isExchangeVisible(symbol, exchange);

            checkbox.prop("checked", visible);

            if (visible) {
                $__("#row-exchange-", symbol, '-', exchange).removeClass("hide");
            } else {
                $__("#row-exchange-", symbol, '-', exchange).addClass("hide");
            }
        });
    });
};

QuotesView.prototype.renderSymbolExchangesBody = function (symbol, info) {
    return $__(
        '<div class="row">',
        '  <div class="hide exchanges-body" ',
        '       id="exchanges-body-', symbol, '">',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.renderSymbolDetailsBody = function (symbol, info) {
    return $__(
        '<div class="row">',
        '  <div id="details-body-', symbol, '">',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.renderSymbolChartsBody = function (symbol, info) {
    return $__(
        '<div class="row">',
        '  <div id="charts-body-', symbol, '">',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.renderSymbolNav = function (symbol, info) {
    return $__(
        '<div style="margin-left: 0px; margin-right: 0px; margin-top: 5px;"',
        '    class="row" id="row-symbol-', symbol,'">',
        '  <div class="col-xs-6 select-symbol custom-nav custom-nav-not-selected"',
        '       target="', symbol, '" ',
        '       id="select-symbol-', symbol,'">',
        '    <span style="font-size: small;"> ',
        '      <img src="img/symbol/', info.icon, '" width=16 height=16></img> ',
               symbol, ' ', info.description,
        '    </span>',
        '  </div>',
        '  <div style="margin-top: 8px" id="symbol-prices-view-container-', symbol,'">',
        '  </div>',        
        '</div>'
    );
};

QuotesView.prototype.renderExchangeInSymbolPricesView = function (symbol, exchange) {
    var base_id = __('exchange-price-', symbol, '-', exchange);

    return $__(
        '  <div style="margin-top: 8px" class="symbol-prices-view-', symbol,' hide"',
        '       id="symbol-prices-view-', symbol, '-', exchange,'">',
        '    <div class="col-xs-6 ', base_id, '-progress">',
        '      <div class="progress progress-striped active">',
        '        <div class="progress-bar" style="width: 100%">',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div class="col-xs-6 hide ', base_id, '-error">',
        '      <div class="alert alert-danger">',
        '        <strong>Error</strong>',
        '        <span class="', base_id, '-error-msg"></span>',
        '      </div>',
        '    </div>',
        '    <div class="', base_id, '-prices hide" style="text-align: right;">',
        '      <div class="col-xs-6" style="text-align: right; padding-left: 0px; padding-right: 0px;">',
        '        <img src="img/exchange/', exchange, '.ico" width=16 height=16> ',
        '        <span style="font-size: small"',
        '            class="label label-primary ', base_id, '-ask">',
        '        </span>',
        '        <span style="font-size: small"',
        '            class="label label-default hide change-price ', base_id, '-change-price">',
        '        </span>',
        '        <span style="font-size: small"',
        '            class="label label-default change-percent ', base_id, '-change-percent">',
        '        </span>',
        '      </div>',
        '    </div>',
        '  </div>'
    );
};

QuotesView.prototype.renderSymbolModalCheckbox = function (symbol, info) {
    return $__(
        '<div class="checkbox">',
        '  <label>',
        '    <input type="checkbox" id="checkbox-symbol-', symbol, '">',
        '    <img src="img/symbol/', info.icon, '" width="32" height="32">',
        '    <large>', symbol, '</large> <small>', info.description, '</small>',
        '  </label>',
        '</div>'
    );
};

QuotesView.prototype.renderExchangesModalBody = function (symbol, info) {
    return $__(
        '<div id="exchanges-modal-body-', symbol, '" class="exchanges-modal-body">',
        '</div>'
    );
};

QuotesView.prototype.renderSymbolNavSep = function () {
    return $__(
        '<li role="presentation" class="separator bottom-separator">',
        '</li>',
    );
};

QuotesView.prototype.addSymbol = function (symbol, info) {
    if (!symbol) {
        $__("#main-quotes-symbol-nav-bar").append(this.renderSymbolNavSep());
        return;
    }

    $__("#main-quotes-symbol-nav-bar").append(this.renderSymbolNav(symbol, info));
    $__("#main-quotes-exchanges-section").append(this.renderSymbolExchangesBody(symbol, info));
    $__("#main-quotes-details-section").append(this.renderSymbolDetailsBody(symbol, info));
    $__("#main-quotes-charts-column").append(this.renderSymbolChartsBody(symbol, info));
    $__("#symbols-modal-body").append(this.renderSymbolModalCheckbox(symbol, info));
    $__("#exchanges-modal-body").append(this.renderExchangesModalBody(symbol, info));

    var self = this;
    info.exchanges.forEach(function(exchange) {
        self.addExchangeForSymbol(symbol, exchange);
    });
};

QuotesView.prototype.renderExchangePrices = function (symbol, exchange) {
    var base_id = __('exchange-price-', symbol, '-', exchange);

    return $__(
        '<div class="row" style="margin-left: 15px; margin-right: 0px" id="row-exchange-', symbol, '-', exchange, '">',
        '  <div target="', exchange, '"',
        '       class="col-xs-5 select-exchange custom-nav custom-nav-not-selected"',
        '       id="select-exchange-', symbol, '-', exchange, '">', 
        '    <span style="font-size: xx-small;"> ',
        '       <img src="img/exchange/', exchange, '.ico" ',
        '            width=16 height=16> ', 
        '      <span style="font-size: small">', this.exchanges[exchange].description, '</span>',
        '    </span>',
        '  </div>',
        '  <div style="margin-top: 8px">',
        '    <div class="col-xs-7 ', base_id, '-progress">',
        '      <div class="progress progress-striped active">',
        '        <div class="progress-bar" style="width: 100%">',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div class="col-xs-7 hide ', base_id, '-error">',
        '      <div class="alert alert-danger">',
        '        <strong>Error</strong>',
        '        <span class="', base_id, '-error-msg"></span>',
        '      </div>',
        '    </div>',
        '    <div class="', base_id, '-prices hide" style="text-align: right;">',
        '      <div class="col-xs-7" style="text-align: right; padding-left: 0px;">',
        '        <span style="font-size: small"',
        '            class="label label-primary ', base_id, '-ask">',
        '        </span>',
        '        <span style="font-size: small"',
        '            class="label label-default hide change-price ', base_id, '-change-price">',
        '        </span>',
        '        <span style="font-size: small"',
        '            class="label label-default change-percent ', base_id, '-change-percent">',
        '        </span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.renderExchangeDetails = function (symbol, exchange) {
    var base_id = __('exchange-details-', symbol, '-', exchange);

    var links = this.exchanges[exchange].links.map(function (value) {
        return __(
            '<a href="', value.link, '" target="_blank">', value.desc, '</a>'
        );
    });

    return $__(
        '<div id="', base_id, '" ',
        '     class="hide exchange-details"',
        '     style="margin: 15px; margin-left: 25px;">',
        '  <div class="row" style="margin-left: 0px">',
        '    <h5>',
        '        <span class="glyphicon glyphicon-info-sign"> ',
        '        </span> ',
                 this.exchanges[exchange].description, '/', symbol,
        '    (', links.join(", "), ')',
        '    </h5>',
        '    <hr>',
        '  </div>',
        '  <div>',
        '    <div class="row" style="padding-top: 0px;">',
        '      <div class="col-xs-4" style="text-align: right;">',
        '        <span style="font-size: small;">',
        '          <strong>Buy/Sell:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="text-align: right;">',
        '        <span class="label label-primary" ',
        '              id="', base_id, '-bid-ask"',
        '              style="font-size: small">',
        '        </span>',
        '      </div>',
        '    </div>',
        '    <div class="row" style="padding-top: 7px;">',
        '      <div class="col-xs-4" style="text-align: right;">',
        '        <span style="font-size: small;">',
        '          <strong>Daily gain:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="text-align: right;">',
        '        <span class="label label-info" ',
        '              id="', base_id, '-daily-gain"',
        '              style="font-size: small">',
        '        </span>',
        '      </div>',
        '    </div>',
        '    <div class="row" style="padding-top: 7px;">',
        '      <div class="col-xs-4" style="text-align: right;">',
        '        <span style="font-size: small;">',
        '          <strong>Open/Close:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="text-align: right;">',
        '        <span class="label label-info" ',
        '              id="', base_id, '-open-close"',
        '              style="font-size: small">',
        '        </span>',
        '      </div>',
        '    </div>',
        '    <div class="row" style="padding-top: 7px;">',
        '      <div class="col-xs-4" style="text-align: right;">',
        '        <span style="font-size: small;">',
        '          <strong>Daily High:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="text-align: right;">',
        '        <span class="label label-info" ',
        '              id="', base_id, '-daily-high"',
        '              style="font-size: small">',
        '        </span>',
        '      </div>',
        '    </div>',
        '    <div class="row" style="padding-top: 7px;">',
        '      <div class="col-xs-4" style="text-align: right;">',
        '        <span style="font-size: small;">',
        '          <strong>Daily Low:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="text-align: right;">',
        '        <span class="label label-info" ',
        '              id="', base_id, '-daily-low"',
        '              style="font-size: small">',
        '        </span>',
        '      </div>',
        '    </div>',
        '    <div id="', base_id, '-custom"></div>',
        '  </div>',
        '  <div id="', base_id, '-dates" style="padding-top: 15px;">',
        '    <div class="row">',
        '      <div class="col-xs-4" style="font-size: x-small; font-style: italic; text-align: right;">',
        '        <span>',
        '          <strong>Last update:</strong>',
        '        </span>',
        '      </div>',
        '      <div class="col-xs-8" style="font-size: x-small; font-style: italic; text-align: right; padding-left: 0px;">',
        '        <span id="', base_id, '-last-update-date">',
        '        </span>',
        '        <span id="', base_id, '-last-update-ago">',
        '        </span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
    );
};

QuotesView.prototype.renderExchangeChart = function (symbol, exchange) {
    var base_id = __('exchange-chart-', symbol, '-', exchange);

    return $__(
        '<div id="', base_id, '" ',
        '     class="hide exchange-chart"',
        '     style="margin: 15px;">',
        '</div>'
    );
};

QuotesView.prototype.renderExchangeModalCheckbox = function (symbol, exchange) {
    return $__(
        '<div class="checkbox">',
        '  <label>',
        '    <input type="checkbox" id="checkbox-exchange-', symbol, '-', exchange, '">',
        '    <img src="img/exchange/', exchange, '.ico" ',
        '         width=16 height=16> ', 
        '      <span style="font-size: small">', this.exchanges[exchange].description, '</span>',
        '  </label>',
        '</div>'
    );
};

QuotesView.prototype.generateExchangeChart = function (symbol, exchange) {
    var self = this,
        selector = __('#exchange-chart-', symbol, '-', exchange);

    var formatter = function() {
        var date = Highcharts.dateFormat('%A, %B %e, %Y', (new Date(this.points[0].key))),
            prefix = self.symbols[symbol].prefix,
            point = this.points[0].point;

        var change_price = point.close - point.open,
            change_percent = change_price / point.open * 100,
            change_color = (change_price > 0 ?
                             'green' :
                             (change_price < 0 ?
                                 'red' :
                                 'black')),
            change_symbol = (change_price > 0 ? '+' : (change_price < 0 ? '-' : ''));

        return __(
            '<span style="font-size: x-small">', date, '</span><br/>',
            'Open: <b>', prefix, point.open.toFixed(2), '</b><br/>',
            'High: <b>', prefix, point.high.toFixed(2), '</b><br/>',
            'Low: <b>', prefix, point.low.toFixed(2), '</b><br/>',
            'Close: <b>', prefix, point.close.toFixed(2), '</span></b><br/>',
            '<i>Gain: </i>',
            '<span style="color: ', change_color,'; font-weight: bold;">',
            change_symbol, prefix, Math.abs(change_price).toFixed(2),
            ' (', change_symbol, Math.abs(change_percent).toFixed(2), '%)',
            '</span>'
        );
    };

    $(selector).highcharts('StockChart', {
        chart: {
            type: 'candlestick',
            zoomType: 'x'
        },
        rangeSelector : {
            buttons: [
                {type: 'day', count: 1, text: '1d'},
                {type: 'week', count: 1, text: '1w'},
                {type: 'month', count: 1, text: '1m'},
                {type: 'year', count: 1, text: '1y'},
                {type: 'all', text: 'All'}
            ],
            inputEnabled: false, // it supports only days
            selected : 4 // all
        },
        title : {
            text : __(self.exchanges[exchange].description, '/', symbol)
        },
        xAxis: {
            type: 'datetime',
            minRange: 3600 * 1000, // one hour
            title: {
                text: 'Date'
            }
        },
        tooltip: {
            formatter: formatter
        },
        series : [
            {
                name : 'Price',
                data: [],
                tooltip: {
                    valueDecimals: 2,
                    valuePrefix: self.symbols[symbol].prefix,
                }
            },
        ]
    });

    return $(selector).highcharts();
};

QuotesView.prototype.addExchangeForSymbol = function (symbol, exchange) {
    $__('#exchanges-body-', symbol).append(
        this.renderExchangePrices(symbol, exchange)
    );

    $__('#symbol-prices-view-container-', symbol).append(
        this.renderExchangeInSymbolPricesView(symbol, exchange)
    );

    $__('#details-body-', symbol).append(
        this.renderExchangeDetails(symbol, exchange)
    );

    $__('#charts-body-', symbol).append(
        this.renderExchangeChart(symbol, exchange)
    );

    $__('#exchanges-modal-body-', symbol).append(
        this.renderExchangeModalCheckbox(symbol, exchange)
    );
};

QuotesView.prototype.renderPrice = function (price, prev) {
    var selector_base = __(".exchange-price-", price.symbol, "-", price.exchange),
        prices_selector = __(selector_base, "-prices"),
        ask_selector = __(selector_base, "-ask"),
        change_price_selector = __(selector_base, "-change-price"),
        change_percent_selector = __(selector_base, "-change-percent"),
        error_selector = __(selector_base, "-error"),
        progress_selector = __(selector_base, "-progress");

    $(ask_selector).html(__(
        this.symbols[price.symbol].prefix,
        price.ask ? price.ask.toFixed(2) : "N/A"
    ));

    var change_price = price.stats.daily.ask.close - price.stats.daily.ask.open,
        change_percent = change_price / price.stats.daily.ask.open * 100,
        glyphicon = change_price > 0 ?
                        'glyphicon-circle-arrow-up' : (
                        change_price < 0 ?
                            'glyphicon-circle-arrow-down' :
                            'glyphicon-minus-sign'
                        );

    $(change_price_selector).html(__(
        '<span class="glyphicon ', glyphicon, '" aria-hidden="true"></span> ',
        this.symbols[price.symbol].prefix,
        Math.abs(change_price).toFixed(2)
    ));

    $(change_percent_selector).html(__(
        '<span class="glyphicon ', glyphicon, '" aria-hidden="true"></span> ',
        Math.abs(change_percent).toFixed(2), '%'
    ));

    $(prices_selector).removeClass("hide");
    $(error_selector).addClass("hide");
    $(progress_selector).addClass("hide");
};

QuotesView.prototype.updateLabelsColors = function (price) {
    var base_id = __(price.symbol, "-", price.exchange),
        change_price_selector = __(".exchange-price-", base_id, "-change-price"),
        change_percent_selector = __(".exchange-price-", base_id, "-change-percent"),
        daily_gain_selector = __(".exchange-details-", base_id, "-daily-gain"),
        open_close_selector = __(".exchange-details-", base_id, "-open-close"),
        daily_low_selector = __(".exchange-details-", base_id, "-daily-low"),
        daily_high_selector = __(".exchange-details-", base_id, "-daily-high");

    var set_label_class = function(selector, label_class) {
        $(selector)
            .removeClass(__("label-info ",
                            "label-primary ",
                            "label-danger ",
                            "label-success ",
                            "label-default"))
            .addClass(__("label-", label_class));
    };

    var change = price.stats.daily.ask.close - price.stats.daily.ask.open;

    if (change > 0) {
        set_label_class(change_price_selector, "success");
        set_label_class(change_percent_selector, "success");
        set_label_class(daily_gain_selector, "success");
        set_label_class(open_close_selector, "success");
        set_label_class(daily_high_selector, "success");
        set_label_class(daily_low_selector, "success");
    } else if (change < 0) {
        set_label_class(change_price_selector, "danger");
        set_label_class(change_percent_selector, "danger");
        set_label_class(daily_gain_selector, "danger");
        set_label_class(open_close_selector, "danger");
        set_label_class(daily_high_selector, "danger");
        set_label_class(daily_low_selector, "danger");
    } else {
        set_label_class(change_price_selector, "default");
        set_label_class(change_percent_selector, "default");
        set_label_class(daily_gain_selector, "default");
        set_label_class(open_close_selector, "default");
        set_label_class(daily_high_selector, "default");
        set_label_class(daily_low_selector, "default");
    }
};

QuotesView.prototype.renderDetails = function (price) {
    var selector_base = __("#exchange-details-", price.symbol, "-", price.exchange),
        last_update = (new Date(price.stats.last_change || price.updated_on)).toLocaleString(),
        symbol_prefix = this.symbols[price.symbol].prefix;

    var change_price = price.stats.daily.ask.close - price.stats.daily.ask.open,
        change_percent = change_price / price.stats.daily.ask.open * 100;

    $__(selector_base, "-last-update-date").html(last_update);

    $__(selector_base, "-bid-ask").html(__(
        price.bid ? __(symbol_prefix, price.bid.toFixed(2)) : "N/A", 
        ' <span class="glyphicon glyphicon-resize-horizontal" aria-hidden="true"></span> ',
        price.ask ? __(symbol_prefix, price.ask.toFixed(2)) : "N/A"
    ));

    $__(selector_base, "-daily-gain").html(__(
        '<span class="glyphicon ',
            change_price > 0 ?
                'glyphicon-circle-arrow-up' : (
                change_price < 0 ?
                    'glyphicon-circle-arrow-down' :
                    'glyphicon-minus-sign'
                ),
        '" aria-hidden="true"></span> ',
        symbol_prefix,
              Math.abs(change_price).toFixed(2),
        ' (', Math.abs(change_percent).toFixed(2), '%)'
    ));

    $__(selector_base, "-open-close").html(__(
        symbol_prefix, price.stats.daily.ask.open.toFixed(2),
        ' <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> ',
        symbol_prefix, price.stats.daily.ask.close.toFixed(2)
    ));

    $__(selector_base, "-daily-high").html(__(
        '<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span> ',
        symbol_prefix, price.stats.daily.ask.high.toFixed(2)
    ));

    $__(selector_base, "-daily-low").html(__(
        '<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> ',
        symbol_prefix, price.stats.daily.ask.low.toFixed(2)
    ));
};

QuotesView.prototype.renderCustomFields = function (price) {
    var selector_base = __("#exchange-details-", price.symbol, "-", price.exchange, "-custom"),
        self = this;

    var render_func = {
        published_on: function (value) {},
        volume24: function (value) {
            $__(selector_base, '-volume24-value').html(
                __(value.toFixed(2), ' ', self.symbols[price.symbol].unit)
            );
        },
        low24: function (value) {},
        high24: function (value) {}
    };

    for (var field in price.custom) {
        render_func[field](price.custom[field]);
    }
};

QuotesView.prototype.addCustomFields = function (price) {
    var selector_base = __("#exchange-details-", price.symbol, "-", price.exchange, "-custom");

    for (var field in price.custom) {
        var custom_selector = __(selector_base, "-", field);
        if (!$(custom_selector).length) {
            $__(selector_base).append(
                this.addCustomField(price.symbol, price.exchange, field)
            );
        }
    }
};

QuotesView.prototype.addCustomField = function (symbol, exchange, field) {
    var base_id = __("exchange-details-", symbol, "-", exchange, "-custom");

    var field_desc = {
        volume24: 'Volume:',
    };

    var field_body = {
        volume24: __(
            '<div class="col-xs-8" style="text-align: right;">',
            '  <span class="label label-warning" ',
            '        id="', base_id, '-volume24-value"',
            '        style="font-size: small">',
            '  </span>',
            '</div>'
        ),
    };

    if (!(field in field_body))
        return '';

    return $__(
        '<div class="row" id="', base_id, '-', field, '" style="padding-top: 7px;">',
        '  <div class="col-xs-4" style="text-align: right;">',
        '    <span style="font-size: small;">',
        '      <strong>', field_desc[field], '</strong>',
        '    </span>',
        '  </div>',
        '  <div>', field_body[field], '</div>',
        '</div>'
    );
};

QuotesView.prototype.renderPriceError = function (error) {
    var selector_base = __("#exchange-price-", error.info.symbol, "-", error.info.exchange),
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

QuotesView.prototype.updateQuoteTimer = function (quote) {
    var selector_base = __("#exchange-details-", quote.symbol, "-", quote.exchange),
        last_update = (new Date(quote.stats.last_change || quote.updated_on));

    $__(selector_base, "-last-update-ago").html(
        __('(', this.timedelta(last_update), ' ago)')
    );
};

QuotesView.prototype.setWindowTitle = function (title) {
    document.title = title;
};

QuotesView.prototype.renderWindowTitle = function (price, model) {
    if (price.symbol != this.getSelectedSymbol(model))
        return;

    if (price.exchange != this.getSelectedExchange(model, price.symbol))
        return;

    this.setWindowTitle(__(
        this.symbols[price.symbol].prefix,
        price.ask ? price.ask.toFixed(2) : "N/A",
        " (", price.symbol, "@", price.exchange, ")"
    ));
};

QuotesView.prototype.onPriceUpdated = function (price, model) {
    this.renderWindowTitle(price, model);
    this.addCustomFields(price);
    this.updateLabelsColors(price);
    this.renderPrice(price);
    this.updateExchangeChart(price.symbol, price.exchange, price.stats.daily);
    this.renderDetails(price);
    this.renderCustomFields(price);
    this.updateQuoteTimer(price);
};

function QuotesModel() {
    this.quotes = {};
    this.selected = undefined;
    this.preferences = undefined;
    this.visible = undefined;
}

QuotesModel.prototype.save = function () {
    localStorage["quotes.selected"] = JSON.stringify(this.selected);
    localStorage["quotes.preferences"] = JSON.stringify(this.preferences);
    localStorage["quotes.visible"] = JSON.stringify(this.visible);
};

QuotesModel.prototype.load = function () {
    this.selected = JSON.parse(localStorage["quotes.selected"] || null) || {
        symbol: null,
        exchange: {}
    };
    this.preferences = JSON.parse(localStorage["quotes.preferences"] || null) || {};
    this.visible = JSON.parse(localStorage["quotes.visible"] || null) || {
        symbols: {},
        exchanges: {},
    };
};

QuotesModel.prototype.getSelectedSymbol = function () {
    return this.selected.symbol;
};

QuotesModel.prototype.getSelectedExchange = function (symbol) {
    return this.selected.exchange[symbol];
};

QuotesModel.prototype.getPreference = function (preference) {
    return this.preferences[preference];
};

QuotesModel.prototype.setPreference = function (preference, value) {
    this.preferences[preference] = value;
    this.save();
};

QuotesModel.prototype.setSelectedSymbol = function (symbol) {
    this.selected.symbol = symbol;
    this.save();
};

QuotesModel.prototype.setSelectedExchange = function (symbol, exchange) {
    this.selected.exchange[symbol] = exchange;
    this.save();
};

QuotesModel.prototype.setSymbolVisible = function (symbol, visible) {
    this.visible.symbols[symbol] = visible;
    this.save();
};

QuotesModel.prototype.setExchangeVisible = function (symbol, exchange, visible) {
    if (!(symbol in this.visible.exchanges))
        this.visible.exchanges[symbol] = {};

    this.visible.exchanges[symbol][exchange] = visible;

    this.save();
};

QuotesModel.prototype.isSymbolVisible = function (symbol) {
    if (!(symbol in this.visible.symbols))
        return true;

    return this.visible.symbols[symbol];
};

QuotesModel.prototype.isExchangeVisible = function (symbol, exchange) {
    if (!(symbol in this.visible.exchanges))
        return true;

    if (!(exchange in this.visible.exchanges[symbol]))
        return true;

    return this.visible.exchanges[symbol][exchange];
};

QuotesModel.prototype.updateQuote = function(quote) {
    if (!(quote.symbol in this.quotes))
        this.quotes[quote.symbol] = {};

    var prev = this.quotes[quote.symbol][quote.exchange];
    this.quotes[quote.symbol][quote.exchange] = quote;
    return prev;
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
    this.model.load();
    this.view.render();
    this.view.hookPriceLabels(this.model);
    this.view.hookSelectionButtons(this.model);
    this.view.hookKeyboardShortcuts(this.model);
    this.view.hookFixedButtons(this.model);
    this.view.restoreVisibility(this.model);
    this.view.restoreSelectionStatus(this.model);
    this.view.restorePreferences(this.model);
};

QuotesController.prototype.onPriceUpdated = function (price) {
    this.updated_on = new Date();
    this.model.updateQuote(price);
    this.view.onPriceUpdated(price, this.model);
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

function init_app () {
    quotes_view = new QuotesView();
    quotes_model = new QuotesModel();
    quotes_controller = new QuotesController(quotes_view, quotes_model);

    quotes_controller.start();
}

function init_client () {
    var url = location.origin.replace(/^http/, 'ws');

    var wsclient = new WSClient(url);

    wsclient.addHandler("onConnect", function() {
        quotes_controller.onConnect();
        this.requestExchanges();
    });

    wsclient.addHandler("onDisconnect", function() {
        quotes_controller.onError({message:'Disconnected'});
    });

    wsclient.addHandler("onExchangesListReceived", function(exchanges) {
        this.requestPrices(exchanges);
    });

    wsclient.addHandler("onPriceUpdated", function(price) {
        quotes_controller.onPriceUpdated(price);
    });

    wsclient.addHandler("onError", function (error) {
        quotes_controller.onError(error);
    });

    wsclient.start();
}

$(document).ready(function() {
    init_app();
    init_client();
});
