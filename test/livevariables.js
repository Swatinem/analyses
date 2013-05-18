
var esprima = require('esprima');
var esgraph = require('esgraph');
var liveVariables = require('../').examples.liveVariables;
var Set = require('../').Set;

/**
 * returns the analysis output for the entry node, since this is a
 * backwards analysis
 */
function doAnalysis(code) {
	var ast = esprima.parse(code);
	var cfg = esgraph(ast);
	var output = liveVariables(cfg);
	return output.get(cfg[0]);
}

describe('Live Variables', function () {
	it('should work for basic example', function () {
		var actual = doAnalysis('var a = b + c;');
		Set.equals(actual, new Set(['b', 'c'])).should.be.true;
	});
	it('should work for loops', function () {
		var actual = doAnalysis(
			'var y = 0; var u = a + b; var y = a * u;' +
			'while (y > u) {' +
				'a = a + 1; u = a + b; x = u;' +
			'}'
		);
		Set.equals(actual, new Set(['a', 'b'])).should.be.true;
	});
	it('should work for branches', function () {
		var actual = doAnalysis(
			'var x = 0;' +
			'if (any) {' +
				'x = y;' +
			'} else {' +
				'x = z;' +
			'}'
		);
		Set.equals(actual, new Set(['y', 'z', 'any'])).should.be.true;
	});
	it('should work for objects', function () {
		var actual = doAnalysis(
			'var x = {a: a, b: b};' +
			'y.x = x.a;'
		);
		Set.equals(actual, new Set(['y', 'a', 'b'])).should.be.true;
	});
});

