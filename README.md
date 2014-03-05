## Description

"Price Tracker" is a Node.js app that can be used to obtain the rates of many different symbols at different exchanges. This includes normal currencies, crypto currencies, gold/silver prices, and so on.

It uses [Redis](https://github.com/mranney/node_redis) for caching results, and [cheerio](https://github.com/MatthewMueller/cheerio) (server-side jQuery)

Everything is accesible via both REST and WebSockets APIs.

### REST API

To obtain the list of supported exchanges, and supported symbols in each exchange:

    GET /request/exchanges
    
    Example: http://localhost:5000/request/exchanges
    ==>
    {
      "bitstamp": [
        "BTCUSD"
      ],
      "bullionvault": [
        "XAUUSD",
        "XAGUSD"
      ],
      "ambito": [
        "USDARSB",
        "USDARS"
      ],
      "coinbase": [
        "BTCUSD"
      ],
      "btc-e": [
        "BTCUSD",
        "LTCUSD"
      ],
      "virwox": [
        "BTCSLL",
        "USDSLL"
      ]
    }
    
To obtain a particular rate:

    GET /request/price/<exchange>/<symbol>  

    Example: http://localhost:5000/request/price/btc-e/LTCUSD 
    ==>
    {
      "exchange": "btc-e",
      "symbol": "LTCUSD",
      "buy": 16.773,
      "sell": 16.8,
      "retrieved_on": "2014-03-05T04:27:52.141Z",
      "updated_on": "2014-03-05T04:27:52.141Z"
    }
   
### WebSockets API

    var ws = new WebSocket(host);

    ws.onopen = function (event) {
        ws.send((new ExchangesRequest()).toString());
        ws.send((new PriceRequest("btc-e", "LTCUSD")).toString());
    };


## Live site

The application can be previewed live at <http://young-river-7409.herokuapp.com/>

