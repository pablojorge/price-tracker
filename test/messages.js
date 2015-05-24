var should = require('chai').should();
var messages = require('../public/lib/messages.js');

describe("SymbolRequest", function () {
	var options = {opt1: 'value1', opt2: 'value2'};
	var request = new messages.SymbolRequest("symbol", "exchange", options);

	describe('when deserialized', function () {
		var deserialized = messages.Request.fromString(request.toString());		

		it('should have the correct symbol', function () {
			deserialized.symbol.should.equal(request.symbol);
		});

		it('should have the correct exchange', function () {
			deserialized.exchange.should.equal(request.exchange);
		});

		it('should have the correct options', function () {
			deserialized.options.should.deep.equal(request.options);
		});

		describe('the hash() function', function() {
			it('should exist', function () {
				should.exist(deserialized.hash);
			});

			it('should return the same value', function () {
				deserialized.hash().should.equal(request.hash());
			});
		});
	});
});