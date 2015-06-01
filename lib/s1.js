import { EventEmitter } from 'events'
import debug from 'debug'

export class S1 extends EventEmitter {
	constructor(adapter) {
		super()

		const self = this

		self.debug = debug('S1:' + S1.counter++)

		self.debug('created')

		adapter.open()
		.then(
			() => {
				self.debug('opened')
				function read() {
					return adapter.process()
					.then(
						chunk => {
							self.debug('pulled', chunk)
							if (typeof chunk === 'undefined')
								return adapter.close()
							self.emit('data', chunk)
							return read()
						},
						error => {
							self.debug('failed to pull', error.message)
							self.emit('error', error)
							return adapter.close()
						}
					)
				}
				return read().then(
					() => {
						self.debug('closed')
					},
					error => {
						self.debug('failed to close', error.message)
						self.emit('error', error)
					}
				)
			},
			error => {
				self.debug('failed to open', error.message)
				self.emit('error', error)
			}
		).then(
			() => self.emit('end')
		)
	}
}

S1.counter = 0