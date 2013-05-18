
var Queue = require('../').Queue;
var should = require('should');

describe('Queue', function () {
	it('should push duplicate entries to the back', function () {
		var q = new Queue();
		q.push(1);
		q.push(2);
		q.push(3);
		q.push(1);
		q.length.should.eql(3);
		q.should.eql([2,3,1]);
	});
	it('should still support the Array quirks', function () {
		var q = new Queue();
		q[3] = 3;
		q.length.should.eql(4);
		q.length = 0;
		should.not.exist(q[3]);
	});
});

