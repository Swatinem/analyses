
var walkes = require('walkes');
var worklist = require('../');
var Set = require('../set');

module.exports = availableExpressions;

/*
So here is the story:
Each node is supposed to have a `Set` of expressions. And for each expression,
I want to save the `Set` of contained variables for easier killing.

Since JS has no records yet (see http://wiki.ecmascript.org/doku.php?id=strawman:records )
and no concept of structural equality, an expression represented by an AST node
is *never ever* equal to an structurally equal expression unless its the
identical node.
The same goes for `Set`s. Since they are just shimmed using normal Objects, they
are *never ever* equal, although they contain the exact same members.

So as a workaround, I `JSON.stringify` the expression to save it in the Set and
use a mapping table to get to the expression object and the corresponding set of
variables.

Of course, I could just use a custom Set implementation which uses a custom
equality check function. But I want to be forward-compatible with the upcoming
ES6 standard, which should provide a O(1) Sets, instead of the O(n) shim.
*/

function availableExpressions(cfg) {
	var expressionMap = {};

	function findExpressions(ast) {
		var expressions = new Set();
		// FIXME: just handling binary expressions so far
		walkes(ast, {
			Identifier: function () {
				return new Set(this.name);
			},
			Literal: function () {
				return new Set();
			},
			BinaryExpression: function (recurse) {
				var stringified = JSON.stringify(this);
				expressions.add(stringified);
				if (stringified in expressionMap) {
					return expressionMap[stringified].variables;
				}
				var right = recurse(this.right);
				var left = recurse(this.left);
				var variables = Set.union(left, right);
				expressionMap[stringified] = {
					expression: this,
					variables: variables
				};
				return variables;
			}
		});
		return expressions;
	}

	// run the algorithm
	var output = worklist(cfg, function (input, list) {
		if (this.type || !this.astNode)
			return input;
		var kill = this.kill = this.kill || findAssignments(this.astNode);
		var generate = this.generate = this.generate || findExpressions(this.astNode);
		var killed = new Set(input.values().filter(function (expr) {
			var variables = expressionMap[expr].variables;
			return !Set.intersect(variables, kill).size;
		}));
		return Set.union(killed, generate);
	}, {direction: 'forward', merge: worklist.intersect});

	// go over all the nodes and push down the real objects into the output
	cfg[2].forEach(function (node) {
		var out = output.get(node);
		output.set(node, new Set(out.values().map(function (expr) {
			return expressionMap[expr].expression;
		})));
	});

	return output;
}

function findAssignments(ast) {
	var variables = new Set();
	walkes(ast, {
		AssignmentExpression: function (recurse) {
			if (this.left.type === 'Identifier')
				variables.add(this.left.name);
			recurse(this.right);
		},
		VariableDeclarator: function (recurse) {
			variables.add(this.id.name);
			if (this.init)
				recurse(this.init);
		}
	});
	return variables;
}

