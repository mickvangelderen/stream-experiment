import { S2 } from './s2'
import assert from 'assert'
import { FileReadController, FileWriteController } from '../test/controllers'

describe('s2.js', () => {

	it.only('should do stuff', done => {

		const s1 = new S2(new FileReadController({
			path: 'test/read-from-me.txt',
			chunkSize: 80
		}))

		const s2 = new S2(new FileWriteController({
			path: 'test/write-to-me.txt'
		}))

		s1.pipe(s2)

		s2.emit('drain')

		s2.on('error', error => console.error(error, error.stack))
		s2.on('end', done)
	})

})