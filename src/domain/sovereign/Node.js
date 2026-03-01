/**
 * @docs
 * ### Node
 * Mesh protocol node status.
 */
export class Node {
	static battery = { help: 'Battery level (%)', default: 100 }
	/** @type {number} */
	battery = Node.battery.default

	static signal = { help: 'LoRa signal strength (dBm)', default: 0 }
	/** @type {number} */
	signal = Node.signal.default

	constructor(data = {}) {
		Object.assign(this, data)
	}
}
