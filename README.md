# Description

"Price Tracker" is a Node.js app that can be used to obtain the rates of many different symbols at different exchanges. This includes normal currencies, crypto currencies, gold/silver prices, and so on.

It uses [Redis](https://github.com/mranney/node_redis) to store data, and [cheerio](https://github.com/MatthewMueller/cheerio) (server-side jQuery) for scraping.

Everything is accesible via both REST and WebSockets APIs.

The application can be accessed live at <http://price-tracker.herokuapp.com/>

## REST API

### Exchanges Collection

#### Get Exchanges

Returns the list of supported exchanges, and supported symbols in each exchange.

**Request:**

  * `GET /api/v1/exchanges`

Example:

    $ curl http://localhost:5000/api/v1/exchanges
    {
      "data": [
        {
          "exchange": "ambito",
          "symbols": [
            "USDARS",
            "USDARSB"
          ]
        },
        {
          "exchange": "kraken",
          "symbols": [
            "BTCUSD",
            "LTCUSD"
          ]
        },
        [...]
      ]
    }

### Symbols Collection

#### Get Symbols

Returns the list of supported symbols, and the exchanges that provide them.

**Request:**

  * `GET /api/v1/symbols`

Example:

    $ curl http://localhost:5000/api/v1/exchanges
    {
      "data": [
        {
          "symbol": "XAUUSD",
          "exchanges": [
            "bullionvault"
          ]
        },
        {
          "symbol": "USDARSB",
          "exchanges": [
            "ambito",
            "cronista"
          ]
        },
        {
          "symbol": "BTCUSD",
          "exchanges": [
            "kraken",
            "bitfinex",
            "bitstamp",
            "coinbase",
            "okcoin"
          ]
        },
        [...]
      ]
    }

#### Get Symbol

Returns the information for this symbol in this particular exchange.

**Request:**

  * `GET /api/v1/symbols/<symbol>/<exchange>`

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
  * **stats**: Additional info generated from historical data
    * **last_change**: Date of last registered price change
    * **daily**: Daily OHLC
      * **date**: Period starting date
      * **bid**:
        * **open**: Period opening bid price
        * **high**: Period highest bid price
        * **low**: Period lowest bid price
        * **closing**: Period closing bid price
      * **ask**:
        * **open**: Period opening ask price
        * **high**: Period highest ask price
        * **low**: Period lowest ask price
        * **closing**: Period closing ask price

Example 1:

    $ curl http://localhost:5000/api/v1/symbols/BTCUSD/bitstamp
    {
      "data": {
        "exchange": "bitstamp",
        "symbol": "BTCUSD",
        "bid": 248.15,
        "ask": 248.35,
        "updated_on": "2015-06-27T20:55:54.519Z",
        "custom": {},
        "stats": {
          "last_change": "2015-06-27T20:55:54.519Z",
          "daily": {
            "date": "2015-06-27T00:00:00.000Z",
            "bid": {
              "open": 242.98,
              "high": 249.18,
              "low": 242.36,
              "close": 248.15
            },
            "ask": {
              "open": 243.01,
              "high": 249.62,
              "low": 242.37,
              "close": 248.35
            }
          }
        }
      }
    }

Example 2:

    $ curl http://localhost:5000/api/v1/symbols/USDARSB/cronista
    {
      "data": {
        "exchange": "cronista",
        "symbol": "USDARSB",
        "bid": 13.4,
        "ask": 13.6,
        "updated_on": "2015-06-27T20:56:14.129Z",
        "custom": {
          "published_on": "2015-06-25T03:00:00.000Z"
        },
        "stats": {
          "daily": {
            "date": "2015-06-27T00:00:00.000Z",
            "bid": {
              "open": 13.4,
              "high": 13.4,
              "low": 13.4,
              "close": 13.4
            },
            "ask": {
              "open": 13.6,
              "high": 13.6,
              "low": 13.6,
              "close": 13.6
            }
          }
        }
      }
    }

#### Get Price Series

Returns all stored prices for this particular symbol in this exchange in the specified date range.

**Request:**

  * `GET /api/v1/symbols/<symbol>/<exchange>/series?start=<start>&end=<end>`

Fields:
  * **exchange**: Name of the exchange/source
  * **symbol**: Symbol name
  * **series**: List of elements with the following fields:
    * **date**: Period start date
    * **bid**: *buy* offers OHLC for this period
    * **ask**: *sell* offers OHLC for this period

Example:

    $ curl http://localhost:5000/api/v1/symbols/USDARSB/cronista/series
    {
      "data": {
        "exchange": "cronista",
        "symbol": "USDARSB",
        "series": [
          {
            "date": "2015-06-17T00:00:00.000Z",
            "bid": {
              "open": 12.6,
              "high": 12.75,
              "low": 12.6,
              "close": 12.75
            },
            "ask": {
              "open": 12.8,
              "high": 12.95,
              "low": 12.8,
              "close": 12.95
            }
          },
          {
            "date": "2015-06-18T00:00:00.000Z",
            "bid": {
              "open": 12.75,
              "high": 12.78,
              "low": 12.75,
              "close": 12.78
            },
            "ask": {
              "open": 12.95,
              "high": 13.08,
              "low": 12.95,
              "close": 13.08
            }
          }
        ]
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
                "exchange": "kraken",
                "options": {}
            }
        }');
    };
    
    // Or, using classes:
    ws.onopen = function (event) {
        ws.send((new ExchangesRequest()).toString());
        ws.send((new SymbolRequest("LTCUSD", "kraken")).toString());
    };
    
    ws.onmessage = function (event) {
        var object = JSON.parse(event.data);
    
        if (object.type == "Exchanges") {
            object.response.data.forEach(function(item) {
                item.symbols.forEach(function(symbol) {
                    console.log("exchange:", item.exchange, "symbol:", symbol);
                });
            });
        } else if (object.type == "Symbol") {
            console.log("symbol:", object.response.data.symbol);
            console.log("exchange:", object.response.data.exchange);
            console.log("bid:", object.response.data.bid);
            console.log("ask:", object.response.data.ask);
        }
    };

Using [wscat](https://www.npmjs.com/package/wscat):

    $ wscat -c ws://localhost:5000
    Connected (press CTRL+C to quit)
    > {"type": "SubscribeRequest", "request": {"symbol": "BTCUSD", "exchange": "bitstamp", "options": {}}}
    < {"type":"Symbol","response":{"data":{"exchange":"bitstamp","symbol":"BTCUSD","bid":9251.95,"ask":9256.49,"updated_on":"2020-05-23T02:25:05.187Z","custom":{},"stats":{"last_change":"2020-05-23T02:25:05.187Z","daily":{"date":"2020-05-23T00:00:00.000Z","bid":{"open":9164.45,"high":9270.33,"low":9164.45,"close":9251.95},"ask":{"open":9171.96,"high":9276.07,"low":9171.96,"close":9256.49}}}}}}
    < {"type":"Symbol","response":{"data":{"exchange":"bitstamp","symbol":"BTCUSD","bid":9251.95,"ask":9256.48,"updated_on":"2020-05-23T02:25:07.101Z","custom":{},"stats":{"last_change":"2020-05-23T02:25:07.101Z","daily":{"date":"2020-05-23T00:00:00.000Z","bid":{"open":9164.45,"high":9270.33,"low":9164.45,"close":9251.95},"ask":{"open":9171.96,"high":9276.07,"low":9171.96,"close":9256.48}}}}}}

## Running

1. Install node:

```
Ubuntu: $ sudo apt-get install npm
macOS: $ brew install node
```

1. Install dependencies:

```
$ npm install
```

1. Run Redis: install from source (<https://redis.io/download>) or run it inside a container:

```
$ docker run -d -p 6379:6379 redis
```

1. Start the server:

```
$ node server.js
```

The server will be ready to accept connections at <http://localhost:5000>. Try with:

```
$ curl http://localhost:5000/api/v1/symbols/BTCUSD/bitstamp
```

## Quick local testing:

Use the `util/run-plugin.js` tool to import a plugin and run it to fetch all supported symbols:

```
$ cd util
$ node run-plugin.js ../app/plugins/Cronista.js
symbol: USDARSCL response: Symbol {...}
symbol: USDARSCL response: Symbol {...}
symbol: USDARSCL response: Symbol {...}
```
