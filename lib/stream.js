const CREATED = 'created'
const OPENING = 'opening'
const OPENED = 'opened'
const PULLING = 'pulling'
const CLOSING = 'closing'
const CLOSED = 'closed'

let events = require('events');

export class Stream {
	constructor(adapter) {
		this.events = new events.EventEmitter()
		this.queue = []
		this.desiredQueueLength = 2
		this.adapter = adapter
		this.state = CREATED
		this.pushingPromise = null

		let pushToAdapter =
		this.events.on('data', chunk => {
			if (this.adapter.push) {
				if (this.pushingPromise) {
					this.queue.push(chunk)
				} else {
					this.pushingPromise = this.adapter.push(chunk)
					.then(result => {
						this.events.emit('data', result);
						if (this.queue.length) {
							this.pushingPromise = this.adapter.push(this.queue.shift())
							.then()
						}
					})
				}
			} else {
				this.queue.push(chunk)
			}
		})

	}

	start() {
		const writable = sinks
			.map(sink => sink.writable)
			.reduce((l, r) => r + r)
		if (writable === sinks.length) {
			// All sinks are writable
			sinks.forEach(sink => sink.push(this.queue.shift()))
		}
		sources.forEach(source => source.start())
		adapter.start()
	}

	enqueue(item) {
		this.queue.push(item);
	}
}

