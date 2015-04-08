
var Queue = require('./queue');
var Set = require('./set');

var exports = module.exports = worklist;

// expose the utilities to have them tested separately
exports.Queue = Queue;
exports.Set = Set;
exports.examples = require('./examples');

/**
 * Implementation of a general worklist algorithm
 * `cfg` is a control flow graph created by `esgraph`,
 * `transferFunction` gets called with (this = node, input, worklist)
 * it operates on the input `Set` and can return an output set, in which case
 * the worklist algorithm automatically enqueues all the successor nodes, or it
 * might return an {output: output, enqueue: false} object in which case it is
 * itself responsible to enqueue the successor nodes.
 * `options` defines the `direction`, a `merge` function and an `equals`
 * function which merge the inputs to a node and determine if a node has changed
 * its output respectively.
 * Returns a `Map` from node -> output
 */
function worklist(cfg, transferFunction, options) {
	options = options || {};
	var direction = options.direction || 'forward';
	var merge = options.merge || worklist.merge(Set.union);
	var equals = options.equals || Set.equals;
	var list = new Queue();
	if (direction === 'forward') {
		list.push(cfg[0]);
		var predecessors = worklist.predecessors;
		var successors = worklist.successors;
	} else {
		list.push(cfg[1]);
		var predecessors = worklist.successors;
		var successors = worklist.predecessors;
	}
	var start = options.start || new Set();

	var output = new Map();
	while (list.length) {
		var node = list.shift();
		var pre = predecessors(node)
			.map(function (n) { return output.get(n); });
		var input = pre.length ? merge(pre) : start;
		var oldOutput = output.get(node);
		var out = transferFunction.call(node, input, list, oldOutput);
		if (!out || out instanceof Set)
			out = {output: out, enqueue: true};
		output.set(node, out.output);
		if (out.enqueue && (!oldOutput || !equals(out.output, oldOutput)))
			successors(node).forEach(function (aSuccessor) { list.push(aSuccessor); });
	}
	return output;
};

worklist.predecessors = function (node) {
	return node.prev;
};
worklist.successors = function (node) {
	return node.next;
};

worklist.merge = function (fn) {
	return function (inputs) {
		if (inputs.length == 1)
			return new Set(inputs[0]);
		return inputs.reduce(fn);
	};
};

