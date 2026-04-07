/**
 * @docs
 * ### Message
 * Mesh protocol message.
 */
export class Message {
	static id = { help: 'Mesh message ID', default: '' }
	/** @type {string} */
	id = Message.id.default

	static authorId = { help: 'Peer ID (Sovereign Subject)', default: '' }
	/** @type {string} */
	authorId = Message.authorId.default

	static text = { help: 'Message text intent', default: '' }
	/** @type {string} */
	text = Message.text.default

	static location = { help: 'Precise coordinates [lat, lon]', default: null }
	/** @type {[number, number] | null} */
	location = Message.location.default

	static type = {
		help: 'Intent type (Mesh)',
		options: ['text', 'sos', 'raid', 'help'],
		default: 'text',
	}
	/** @type {'text' | 'sos' | 'raid' | 'help'} */
	type = Message.type.default

	static timestamp = { help: 'Creation date in ms', default: Date.now() }
	/** @type {number} */
	timestamp = Message.timestamp.default

	static signature = { help: 'Cryptographic signature (Ed25519)', default: '' }
	/** @type {string} */
	signature = Message.signature.default

	constructor(data = {}) {
		Object.assign(this, data)
		if (!this.timestamp) this.timestamp = Date.now()
	}

	/**
	 * ISO-like date string for sorting: YYYY-MM-DD HH:MM:SS.SSS
	 * @returns {string}
	 */
	formatDate() {
		return new Date(this.timestamp).toISOString().slice(0, 23).replace('T', ' ')
	}

	/**
	 * Validate packet size for Mesh (LoRa limits ~256 bytes).
	 * @returns {boolean}
	 */
	isValid() {
		const size = Buffer.byteLength(this.toMesh())
		return size <= 256
	}

	/**
	 * Sign message using IdentityManager.
	 * @param {import('./IdentityManager').IdentityManager} identity
	 */
	sign(identity) {
		const content = JSON.stringify({
			authorId: this.authorId,
			text: this.text,
			type: this.type,
			timestamp: this.timestamp,
		})
		this.signature = identity.sign(content)
	}

	/**
	 * Compact serialization for LoRa (Bit-Sovereign protocol).
	 * Format: [ID]:[SIG]:[TYPE]:[TIMESTAMP]:[DATA]
	 * @returns {string}
	 */
	toMesh() {
		return [
			this.authorId,
			this.signature,
			this.type,
			this.timestamp,
			this.text,
		].join(':')
	}

	static from(input) {
		if (input instanceof Message) return input
		return new Message(input)
	}

	/**
	 * Hydrate message from mesh string.
	 * @param {string} meshString
	 * @returns {Message}
	 */
	static fromMesh(meshString) {
		const [authorId, signature, type, timestamp, ...textParts] =
			String(meshString).split(':')
		return new Message({
			authorId,
			signature,
			type,
			timestamp: Number(timestamp),
			text: textParts.join(':'),
		})
	}
}
