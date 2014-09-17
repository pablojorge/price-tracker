var ws = require('ws');
var should = require('chai').should();

var messages = require('../public/lib/messages.js');

describe('Server', function () {
    it('should start', function (done) {
        process.env.CACHE = 'internal';
        process.env.CACHE_TTL = '60';
        require('../server');
        done();
    });
});

describe('Client', function () {
    var url = ('ws://localhost:5000/');
    var connection;

    it('should connect', function (done) {
        connection = ws.connect(url);
        connection.on('open', function () {
            done();
        });
    });

    describe('when asks for exchanges', function () {
        var request = new messages.ExchangesRequest(),
            response;

        it('should get a response', function (done) {            
            connection.send(request.toString());
            connection.on('message', function (message) {
                response = messages.Response.fromString(message);
                done();
            });
        });

        describe('response', function () {
            it('should have exchange bitstamp', function () {
                response.should.have.property('bitstamp');
            });

            it('should have BTCUSD for bitstamp', function () {
                response.bitstamp.should.include('BTCUSD');
            });
        });
    });
});