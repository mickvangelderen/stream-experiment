import fs from 'fs';

export class FileReadController {
	constructor({ path, flags = 'r', mode = 0o666, chunkSize = 4096 } = {}) {
		this.path = path
		this.flags = flags
		this.mode = mode
		this.chunkSize = chunkSize
		this.fd = null
	}

	open() {
		return new Promise((resolve, reject) => {
			fs.open(this.path, this.flags, this.mode, (err, fd) => {
				if (err) return reject(err)
				this.fd = fd
				resolve()
			})
		})
	}

	pull() {
		return new Promise((resolve, reject) => {
			let buffer = Buffer(this.chunkSize)
			fs.read(this.fd, buffer, 0, this.chunkSize, null, (err, bytesRead) => {
				if (err) return reject(err)
				resolve(bytesRead ? buffer.slice(0, bytesRead) : undefined)
			})
		})
	}

	close() {
		return new Promise((resolve, reject) => {
			fs.close(this.fd, (err) => {
				if (err) reject(err)
				this.fd = null
				resolve()
			})
		})
	}
}

export class FileWriteController {
	constructor({ path, flags = 'w', mode = 0o666 } = {}) {
		this.path = path
		this.flags = flags
		this.mode = mode
		this.fd = null
	}

	open() {
		return new Promise((resolve, reject) => {
			fs.open(this.path, this.flags, this.mode, (err, fd) => {
				if (err) return reject(err)
				this.fd = fd
				resolve()
			})
		})
	}

	push(chunk) {
		return new Promise((resolve, reject) => {
			fs.write(this.fd, chunk, 0, chunk.length, null, (err, bytesWritten) => {
				if (err) return reject(err)
				resolve()
			})
		})
	}

	close() {
		return new Promise((resolve, reject) => {
			fs.close(this.fd, (err) => {
				if (err) reject(err)
				this.fd = null
				resolve()
			})
		})
	}
}