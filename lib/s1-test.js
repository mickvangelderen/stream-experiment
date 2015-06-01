import { S1 } from './s1'
import assert from 'assert'
import { FileReadController } from '../test/controllers'

describe('s1.js', () => {

	it('should do stuff', done => {

		let a = new FileReadController({
			path: 'test/read-from-me.txt',
			chunkSize: 80
		})

		let s = new S1(a)
		s.on('data', chunk => console.log('Received data', chunk.length))
		s.on('error', error => console.error('Received error', error))
		s.on('end', done)
	})

})