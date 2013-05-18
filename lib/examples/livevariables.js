
var walkes = require('walkes');
var worklist = require('../');
var Set = require('../set');

module.exports = liveVariables;

function liveVariables(cfg) {
	return worklist(cfg, function (input) {
		if (this.type || !this.astNode)
			return input;
		var kill = this.kill = this.kill || findAssignments(this.astNode);
		var generate = this.generate = this.generate || findVariables(this.astNode);
		return Set.union(Set.minus(input, kill), generate);
	}, {direction: 'backward'});
}

function findAssignments(astNode) {
	var variables = new Set();
	walkes(astNode, {
		AssignmentExpression: function (recurse) {
			if (this.left.type === 'Identifier')
				variables.add(this.left.name);
			recurse(this.right);
		},
		FunctionDeclaration: function () {},
		FunctionExpression: function () {},
		VariableDeclarator: function (recurse) {
			variables.add(this.id.name);
			if (this.init)
				recurse(this.init);
		}
	});
	return variables;
}
function findVariables(astNode) {
	var variables = new Set();
	walkes(astNode, {
		AssignmentExpression: function (recurse) {
			if (this.left.type !== 'Identifier')
				recurse(this.left);
			recurse(this.right);
		},
		FunctionDeclaration: function () {},
		FunctionExpression: function () {},
		Identifier: function () {
			variables.add(this.name);
		},
		MemberExpression: function (recurse) {
			recurse(this.object);
		},
		Property: function (recurse) {
			recurse(this.value);
		},
		VariableDeclarator: function (recurse) {
			recurse(this.init);
		}
	});
	return variables;
}

