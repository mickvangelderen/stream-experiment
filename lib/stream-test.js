// import { Stream } from './stream';
// import assert from 'assert';

// describe('stream.js', function() {

// 	it('should expose a Stream constructor', function() {
// 		assert.strictEqual(typeof Stream, 'function');
// 	});

// 	it('should do stuff', function() {
// 		var c = new IteratorStreamController(0, 5);
// 		assert.strictEqual(typeof c.i, 'undefined');
// 		c.open();
// 		assert.strictEqual(typeof c.i, 'number');
// 		assert.strictEqual(c.pull(), 0);
// 		assert.strictEqual(c.pull(), 1);
// 		assert.strictEqual(c.pull(), 2);
// 		assert.strictEqual(c.pull(), 3);
// 		assert.strictEqual(c.pull(), 4);
// 		assert.strictEqual(c.pull(), 5);
// 		assert.strictEqual(typeof c.pull(), 'undefined');
// 		c.close();
// 		assert.strictEqual(typeof c.i, 'undefined');
// 	});
// });