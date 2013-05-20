
var Set = require('../').Set;

describe('Set', function () {
	it('should not add same values twice', function () {
		var s = new Set(['a']);
		s.add('a');
		s.size.should.eql(1);
	});
	it('should copy a set on construction', function () {
		var s1 = new Set(['a']);
		var s2 = new Set(s1);
		s2.size.should.eql(1);
		Set.equals(s1, s2).should.be.true;
		s2.add('b');
		s2.size.should.eql(2);
	});
	it('should support delete', function () {
		var s = new Set(['a']);
		s.delete('a');
		s.size.should.eql(0);
		s.delete('a');
		s.size.should.eql(0);
	});
	it('should support equals', function () {
		var aobj = {};
		var bobj = {};
		var a = new Set(['a', 'b', aobj]);
		var b = new Set(['a', 'b', 'c', bobj]);
		Set.equals(a, b).should.be.false;
		a.delete(aobj);
		b.delete(bobj);
		b.delete('c');
		Set.equals(a, b).should.be.true;
	});
	it('should support union', function () {
		var aobj = {};
		var bobj = {};
		var a = new Set(['a', 'b', aobj]);
		var b = new Set(['a', 'b', bobj]);
		var u = Set.union(a, b);
		u.size.should.eql(4);
		u.has(aobj).should.be.true;
		u.has(bobj).should.be.true;
	});
	it('should support union with a single value', function () {
		var a = new Set(['a']);
		var u = Set.union(a);
		Set.equals(a, u).should.be.true;
		a.should.not.equal(u);
		u = Set.union(undefined, a);
		Set.equals(a, u).should.be.true;
		a.should.not.equal(u);
	});
	it('should support intersect', function () {
		var aobj = {};
		var bobj = {};
		var a = new Set(['a', 'b', aobj]);
		var b = new Set(['a', 'b', bobj]);
		var i = Set.intersect(a, b);
		i.size.should.eql(2);
		i.has(aobj).should.be.false;
	});
	it('should support intersect with a single value', function () {
		var a = new Set(['a']);
		var i = Set.intersect(a);
		Set.equals(a, i).should.be.true;
		a.should.not.equal(i);
		i = Set.intersect(undefined, a);
		Set.equals(a, i).should.be.true;
		a.should.not.equal(i);
	});
	it('should support minus', function () {
		var a = new Set(['a', 'b']);
		var b = new Set(['a']);
		var m = Set.minus(a, b);
		m.size.should.eql(1);
		m.has('a').should.be.false;
	});
	it('should support some Array.prototype methods', function () {
		var s = new Set(['e']);
		var called = 0;
		s.forEach(function (e) {
			called++;
			e.should.eql('e');
		});
		s.map(function (e) {
			called++;
			e.should.eql('e');
			return true;
		}).should.eql([true]);
		called.should.eql(2);
		s = new Set(['a', 'b']);
		s.some(function (e) {
			called++;
			return e == 'a';
		}).should.be.true;
		s.every(function (e) {
			called++;
			return e == 'a';
		}).should.be.false;
		s.some(function (e) {
			called++;
			return false;
		}).should.be.false;
		s.every(function (e) {
			called++;
			return true;
		}).should.be.true;
		called.should.eql(9);
	});
});
