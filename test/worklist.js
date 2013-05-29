
var worklist = require('../');
var Set = worklist.Set;
var esgraph = require('esgraph');
var esprima = require('esprima');

describe('Worklist algorithm', function () {
	var n1 = {node: 'n1'};
	var n2 = {node: 'n2'};
	var cfg = [n1, n2, [n1, n2]];
	function resetcfg() {
		n1.prev = [];
		n1.next = [n2];
		n2.prev = [n1];
		n2.next = [];
	}
	beforeEach(resetcfg);

	it('should call the transfer function with the node', function () {
		var called = 0;
		worklist(cfg, function (input) {
			called++;
			if (called == 1)
				this.should.equal(n1);
			if (called == 2)
				this.should.equal(n2);
			return input;
		});
		(called >= 2).should.be.ok;
	});
	it('should support a starting value', function () {
		var called = 0;
		worklist(cfg, function (input) {
			called++;
			if (called == 1)
				Set.equals(input, new Set(['a'])).should.be.ok;
			return input;
		}, {start: new Set(['a'])});
		(called >= 2).should.be.ok;
	});
	it('should support backwards iteration', function () {
		var called = 0;
		worklist(cfg, function (input) {
			called++;
			if (called == 1)
				this.should.equal(n2);
			if (called == 2)
				this.should.equal(n1);
			return input;
		}, {direction: 'backward'});
		(called >= 2).should.be.ok;
	});
	it('should default merge function to union', function () {
		var called = 0;
		// create two cycle:
		n1.prev = [n1, n2];
		n1.next = [n2, n1];
		n2.next = [n1];
		worklist(cfg, function (input) {
			called++;
			switch (called) {
				case 1: return new Set(['a']);
				case 2: return new Set(['b']);
				case 3:
					input.size.should.eql(2);
					Set.equals(input, new Set(['a', 'b'])).should.be.true;
				break;
			}
			return input;
		});
		(called >= 3).should.be.ok;
	});
	it('should support a custom `merge` function', function () {
		var called = 0;
		var out = new Set('a');
		worklist(cfg, function (input) {
			return out;
		}, {merge: function (a, b) {
			called++;
			b.should.eql(out);
		}});
		(called >= 1).should.be.ok;
	});
	it('should support a custom `equals` function', function () {
		var called = 0;
		var calledeq = 0;
		// create a cycle:
		n1.prev.push(n2);
		n2.next.push(n1);
		worklist(cfg, function (input) {
			called++;
			return input;
		}, {equals: function (a, b) {
			calledeq++;
			return true;
		}});
		called.should.eql(3);
		calledeq.should.eql(1);
	});
	it('should also give the list and the last output', function () {
		var called = 0;
		// create a cycle:
		n1.prev.push(n2);
		n2.next.push(n1);
		worklist(cfg, function (input, list, output) {
			called++;
			list.should.be.an.instanceof(worklist.Queue);
			if (called == 3)
				Set.equals(output, new Set(['a']));
			if (this == n1)
				return new Set(['a']);
			return input;
		});
		called.should.eql(3);
	});
});

