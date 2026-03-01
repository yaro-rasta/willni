/**
 * @docs
 * ### DomainMessage
 * Base class for messages within the domain.
 */
export class Message {
	static head = { help: 'Message head (metadata, headers)', default: {} }
	/** @type {Object} */
	head = Message.head.default

	static body = { help: 'Message body (payload)', default: {} }
	/** @type {Object} */
	body = Message.body.default

	constructor(data = {}) {
		Object.assign(this, data)
	}

	static from(input) {
		if (input instanceof Message) return input
		return new Message(input)
	}
}

export class DomainMessage extends Message {
	constructor(data = {}) {
		super(data)
	}
}
