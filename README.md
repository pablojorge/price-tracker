# Description

"Price Tracker" is a Node.js app that can be used to obtain the rates of many different symbols at different exchanges. This includes normal currencies, crypto currencies, gold/silver prices, and so on.

It uses [Redis](https://github.com/mranney/node_redis) for caching results, and [cheerio](https://github.com/MatthewMueller/cheerio) (server-side jQuery)

Everything is accesible via both REST and WebSockets APIs.

## REST API

### Exchanges Collection

#### Get Exchanges [`GET /api/v1/exchanges`]

Returns the list of supported exchanges, and supported symbols in each exchange.

Example:

    GET http://localhost:5000/api/v1/exchanges
    
    {
      "amagi": [
        "XAUUSD",
        "XAGUSD"
      ],
      "ambito": [
        "USDARS",
        "USDARSB",
        "USDARSCL",
        "USDARSBOL"
      ],
      "btc-e": [
        "BTCUSD",
        "LTCUSD"
      ],
      "bitfinex": [
        "BTCUSD",
        "LTCUSD"
      ],
      "bitstamp": [
        "BTCUSD"
      ],
      "bullionvault": [
        "XAUUSD",
        "XAGUSD"
      ],
      "cexio": [
        "BTCUSD",
        "LTCUSD"
      ],
      "clarin": [
        "USDARS",
        "USDARSB"
      ],
      "coinbase": [
        "BTCUSD"
      ],
      "coinsetter": [
        "BTCUSD"
      ],
      "cronista": [
        "USDARS",
        "USDARSB",
        "USDARSCL"
      ],
      "infobae": [
        "USDARS",
        "USDARSB",
        "USDARSCL"
      ],
      "lanacion": [
        "USDARS",
        "USDARSB"
      ],
      "okcoin": [
        "BTCUSD",
        "LTCUSD"
      ],
      "virwox": [
        "BTCSLL",
        "USDSLL"
      ]
    }

### Symbols Collection

#### Get Symbols [`GET /api/v1/symbols`]

Returns the list of supported symbols, and the exchanges that provide them.

Example:

    GET http://localhost:5000/api/v1/exchanges
    
    {
      "XAUUSD": [
        "amagi",
        "bullionvault"
      ],
      "XAGUSD": [
        "amagi",
        "bullionvault"
      ],
      "USDARS": [
        "ambito",
        "clarin",
        "cronista",
        "infobae",
        "lanacion"
      ],
      "USDARSB": [
        "ambito",
        "clarin",
        "cronista",
        "infobae",
        "lanacion"
      ],
      "USDARSCL": [
        "ambito",
        "cronista",
        "infobae"
      ],
      "USDARSBOL": [
        "ambito"
      ],
      "BTCUSD": [
        "btc-e",
        "bitfinex",
        "bitstamp",
        "cexio",
        "coinbase",
        "coinsetter",
        "okcoin"
      ],
      "LTCUSD": [
        "btc-e",
        "bitfinex",
        "cexio",
        "okcoin"
      ],
      "BTCSLL": [
        "virwox"
      ],
      "USDSLL": [
        "virwox"
      ]
    }

#### Get Symbol [`GET /api/v1/symbols/<symbol>/<exchange>`]

Returns the information for this symbol in this particular exchange.

Fields:
  * **exchange**: Name of the exchange/source
  * **symbol**: Symbol name
  * **bid**: Best *buy* offer
  * **ask**: Best *sell* offer
  * **updated_on**: Date in which this information was *retrieved* from the exchange (it may have been retrieved recently but the data could still be old)
  * **custom**: Additional data, depending on symbol/exchange
    * **volume24**: Total volume transacted in the last 24 hours
    * **high24**: Highest *sell* value in the last 24 hours
    * **low24**: Lowest *sell* value in the last 24 hours
    * **published_on**: Date in which this information was *published* (this is the real date, but it's not always available)

Example 1:

    GET http://localhost:5000/api/v1/symbols/BTCUSD/bitstamp
    
    {
      "exchange": "bitstamp",
      "symbol": "BTCUSD",
      "bid": 238.58,
      "ask": 238.59,
      "updated_on": "2015-05-24T03:02:03.068Z",
      "custom": {
        "volume24": 2592.47046949,
        "high24": 240.67,
        "low24": 237.4
      }
    }

Example 2:

    GET http://localhost:5000/api/v1/sybols/USDARSB/lanacion
    
    {
      "exchange": "lanacion",
      "symbol": "USDARSB",
      "bid": 12.45,
      "ask": 12.65,
      "updated_on": "2015-05-24T03:02:31.709Z",
      "custom": {
        "published_on": "2015-05-21T03:00:00.000Z"
      }
    }

## WebSockets API

    var ws = new WebSocket(host);
    
    // Using plain objects:
    ws.onopen = function (event) {
        ws.send('{
            "type": "ExchangesRequest",
            "request": {
                "options": {}
            }
        }');
        ws.send('{
            "type": "SymbolRequest",
            "request": {
                "symbol": "LTCUSD",
                "exchange": "btc-e",
                "options": {}
            }
        }');
    };
    
    // Or, using classes:
    ws.onopen = function (event) {
        ws.send((new ExchangesRequest()).toString());
        ws.send((new SymbolRequest("LTCUSD", "btc-e")).toString());
    };


## Live site

The application can be previewed live at <http://price-tracker.herokuapp.com/>

