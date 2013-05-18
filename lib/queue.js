
module.exports = Queue;

/**
 * This is a really small priority queue that makes sure that duplicate elements
 * are being inserted at the end
 */
function Queue() {
	var q = [];
	q.__proto__ = Queue.prototype;
	return q;
}

Queue.prototype = Object.create(Array.prototype);
Queue.prototype.push = function Queue_push(elem) {
	var pos = this.indexOf(elem);
	if (pos != -1)
		this.splice(pos, 1);
	Array.prototype.push.call(this, elem);
};
