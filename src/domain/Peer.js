/**
 * @docs
 * ### Peer
 * Sovereign peer in the mesh network.
 */
export class Peer {
	static id = { help: 'Unique IPNS / Public Key identifier', default: '' }
	/** @type {string} */
	id = Peer.id.default

	static name = { help: 'Citizen name / Callsign', default: '' }
	/** @type {string} */
	name = Peer.name.default

	static avatar = { help: 'Emoji or link to avatar', default: '👤' }
	/** @type {string} */
	avatar = Peer.avatar.default

	static status = {
		help: 'Subject online status',
		options: ['online', 'away', 'offline'],
		default: 'offline',
	}
	/** @type {'online' | 'away' | 'offline'} */
	status = Peer.status.default

	static lastSeen = { help: 'Last activity timestamp', default: '' }
	/** @type {string} */
	lastSeen = Peer.lastSeen.default

	constructor(data = {}) {
		Object.assign(this, data)
	}

	static from(input) {
		if (input instanceof Peer) return input
		return new Peer(input)
	}
}
