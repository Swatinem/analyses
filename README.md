# analyses

Basic data flow analyses framework based on esprima

[![Build Status](https://travis-ci.org/Swatinem/analyses.png?branch=master)](https://travis-ci.org/Swatinem/analyses)
[![Coverage Status](https://coveralls.io/repos/Swatinem/analyses/badge.png?branch=master)](https://coveralls.io/r/Swatinem/analyses)
[![Dependency Status](https://gemnasium.com/Swatinem/analyses.png)](https://gemnasium.com/Swatinem/analyses)

## Installation

    $ npm install analyses

## Dependencies

analyses depends on a globally available `Map`, which can either be provided by
running with `--harmony` or by preloading a shim before using the library.
analyses itself explicitly does not depend on a shim itself, to be more forward
compatible and to give you more choice.

Since the collections, specifically `Set` in `--harmony`
[do not support any method to iterate over them](https://code.google.com/p/v8/issues/detail?id=2323),
analyses provides a minimal `analyses.Set` shim with some useful set operations.
This will change once native `--harmony` Sets are actually useful.

## Usage

```js
var cfg = esgraph(esprima.parse('…'));
var output = analyses(cfg, function (input, list) {
	this; // the cfg node
	input; // the input set
	list; // the worklist `.push()` nodes to it.
	return new analyses.Set(); // either return a new output Set
	// or return an output Set and `enqueue: false` so the worklist algorithm does
	// not check and enqueue successors itself.
	return {output: new analyses.Set(), enqueue: false}
}, {
	// direction:
	// forward or backward; defaults to forward
	direction: 'forward',
	// custom merge function:
	// typically union or intersect; defaults to union
	// merge function takes an array of inputs
	// `analyses.merge()` wraps a function which takes a pair `a, b` of inputs
	merge: analyses.merge(analyses.Set.union),
	// custom equals function:
	// this is used to determine if the output of a node still changes and to
	// not enqueue any more successors and stop the iteration; defaults to
	// Set.equals
	equals: analyses.Set.equals
});
// the output is a `Map` from CFG nodes to a result set of type `analyses.Set`
output.get(cfg[0]).values()
```

## License

  LGPLv3

