import { FileReadController, FileWriteController } from './controllers';
import assert from 'assert';

describe('controllers.js', function() {

	describe('FileReadController', function() {
		it('should expose a FileReadController constructor', function() {
			assert.strictEqual(typeof FileReadController, 'function');
		})

		it('should read a file', function(done) {
			let c = new FileReadController({
				path: 'test/read-from-me.txt',
				chunkSize: 40
			})

			c.open()
			.then(() => c.pull())
			.then(function read(chunk) {
				if (!chunk) return c.close()
				return c.pull().then(read)
			})
			.then(done, done)
		})
	})

	describe('FileWriteController', function() {
		it('should expose a FileWriteController constructor', function() {
			assert.strictEqual(typeof FileWriteController, 'function');
		})

		it('should write a file', function(done) {
			let c = new FileWriteController({
				path: 'test/write-to-me.txt'
			})

			c.open()
			.then(() => c.push(new Buffer('Hello')))
			.then(() => c.push(new Buffer(' ')))
			.then(() => c.push(new Buffer('World!\n')))
			.then(() => c.close(), error => {
				return c.close().then(() => { throw error }, () => { throw error })
			})
			.then(done, done)
		})

		it('should pipe input to output', function(done) {
			let i = new FileReadController({
				path: 'test/read-from-me.txt',
				chunkSize: 80
			})

			let o = new FileWriteController({
				path: 'test/write-to-me.txt'
			})

			o.open()
			.then(() => i.open())
			.then(function pipe() {
				return i.pull().then(chunk => chunk ? o.push(chunk).then(pipe) : i.close())
			})
			.then(() => o.close())
			.then(done, done)
		})
	})

})