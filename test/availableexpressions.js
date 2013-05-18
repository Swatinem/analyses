
var esprima = require('esprima');
var esgraph = require('esgraph');
var availableExpressions = require('../').examples.availableExpressions;

/**
 * returns the analysis output for the exit node, since this is a
 * forward analysis
 */
function doAnalysis(code) {
	var ast = esprima.parse(code);
	var cfg = esgraph(ast);
	var output = availableExpressions(cfg);
	var exit = cfg[1];

	// exception edges mess up everything, so rather use the node before the exit
	// node
	var normals = exit.prev.filter(function (n) { return n.normal === exit; })
		.reduce(function (arr, elem) {
			if (!~arr.indexOf(elem))
				arr.push(elem);
			return arr;
		}, []);
	if (normals.length === 1)
		exit = normals[0];
	return output.get(exit).values();
}

function expr(code) {
	return esprima.parse(code).body[0].expression;
}

describe('Available Expressions', function () {
	it('should work for basic example', function () {
		var actual = doAnalysis('var a = b + c; var c = a + b;');
		actual.should.includeEql(expr('a + b'));
	});
	it('should work for loops', function () {
		var actual = doAnalysis(
			'var x = a + b; var y = a * x;' +
			'while (y > a + b) {' +
				'a = a + 1; x = a + b;' +
			'} expr;'
		);
		actual.should.includeEql(expr('a + b'));
		actual.should.includeEql(expr('y > a + b'));
	});
	it('should work for branches', function () {
		var actual = doAnalysis(
			'var x = 0;' +
			'if (any) {' +
				'x = a + b;' +
			'} else {' +
				'x = a + b;' +
				'y = a + c;' +
			'} expr;'
		);
		actual.should.includeEql(expr('a + b'));
	});
});

