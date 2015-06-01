import { EventEmitter } from 'events'
import debug from 'debug'


function all(list, predicate) {
	return list.map(predicate).reduce((left, right) => left && right)
}

function any(list, predicate) {
	return list.map(predicate).reduce((left, right) => left || right)
}

function none(list, predicate) {
	return !any(list, predicate)
}

export class S2 extends EventEmitter {
	constructor(adapter) {
		super()

		this.queue = []
		this.desiredMaximumQueueLength = 2
		this.full = this.queue.length > this.desiredMaximumQueueLength
		this.sinks = []
		this.sources = []
		this.state = S2.CREATED
		this.adapter = adapter
		this.debug = debug('S2:' + S2.counter++)
	}

	transition(state) {
		const old = this.state
		this.state = state
		this.debug('transitioned: ' + old + ' --> ' + state)
	}

	doStart() {
		this.transition(S2.STARTING)
		this.adapter.open().then(
			() => {
				this.transition(S2.STARTED)
				this.doProcess()
			},
			error => {
				this.debug('emitting error')
				this.emit('error', error)
				this.transition(S2.ENDED)
			})
	}

	doProcess() {
		// Don't do anything if we generate content and we are full.
		if (this.adapter.generator && this.full) return

		// Obtain a chunk from the buffer or null if the adapter is a generator.
		let chunk
		if (this.queue.length) {
			chunk = this.queue.pop()
			this.debug('popped queue', this.queue.length)
			if (this.full && this.queue.length < this.desiredMaximumQueueLength) {
				this.full = false
				this.debug('emitting drain')
				this.emit('drain')
			}
		} else if (this.adapter.generator) {
			chunk = null
		} else return

		// Let the adapter do its job.
		this.transition(S2.PROCESSING)
		this.adapter.process(chunk).then(
			chunk => {
				this.debug('processed chunk', chunk)
				if (typeof chunk === 'undefined') return this.doEnd()
				this.debug('emitting chunk')
				this.emit('data', chunk)
				this.transition(S2.STARTED)
				this.doProcess()
			},
			error => {
				this.debug('emitting error')
				this.emit('error', error)
				this.doEnd()
			}
		)
	}

	doEnd() {
		if (this.queue.length) this.doProcess()
		this.transition(S2.ENDING)
		this.adapter.close()
			.catch(error => {
				this.debug('emitting error')
				this.emit('error', error)
			})
			.then(() => {
				this.transition(S2.ENDED)
				this.debug('emitting end')
				this.emit('end')
			})
	}

	brain() {
		this.debug('brain', this.state)
		switch (this.state) {
		case S2.CREATED:
			this.doStart()
			break
		case S2.STARTED:
			this.doProcess()
			break
		}
	}

	pipe(sink) {
		this.attachSink(sink)
		sink.attachSource(this)
	}

	attachSource(source) {
		this.sources.push(source)
		source.on('data', chunk => {
			this.queue.push(chunk)
			this.debug('pushed queue', this.queue.length)
			if (!this.full && this.queue.length > this.desiredMaximumQueueLength) {
				this.full = true
				this.debug('emitting full')
				this.emit('full')
			}
			this.brain()
		})
		source.on('error', error => {
			this.debug('received error')
			this.debug('emitting error')
			this.emit('error', error)
		})
		source.on('end', () => {
			this.debug('received end from source')
			if (this.state === S2.ENDING || this.state === S2.ENDED) return
			if (all(this.sources, source => source.state === S2.ENDED || source.state === S2.ENDING)) {
				this.debug('all sources ended')
				this.doEnd()
			}
		})
	}

	attachSink(sink) {
		this.sinks.push(sink)
		sink.on('full', () => {
			this.debug('received full')
			this.full = true
			this.debug('emitting full')
			this.emit('full')
		})
		sink.on('drain', () => {
			this.debug('received drain')
			if (none(this.sinks, sink => sink.full)) {
				this.full = false
				this.debug('emitting drain')
				this.emit('drain')
				this.brain()
			}
		})
		sink.on('end', () => {
			this.debug('received end from sink')
			if (this.state === S2.ENDING || this.state === S2.ENDED) return
			if (all(this.sinks, sink => sink.state === S2.ENDED || sink.state === S2.ENDING)) {
				this.debug('all sinks ended')
				this.doEnd()
			}
		})
	}
}

S2.counter = 0
S2.CREATED = 'created'
S2.STARTING = 'starting'
S2.STARTED = 'started'
S2.PROCESSING = 'processing'
S2.ENDING = 'ending'
S2.ENDED = 'ended'
