import dgram from 'node:dgram'
import { EventEmitter } from 'node:events'
import { Message } from './Message.js'

/**
 * MeshTransport - UDP Broadcast transport for Bit-Sovereign protocol.
 */
export class MeshTransport extends EventEmitter {
	constructor(port = 4220) {
		super()
		this.port = port
		this.client = dgram.createSocket({ type: 'udp4', reuseAddr: true })
	}

	/**
	 * Start listening for mesh messages.
	 */
	listen() {
		this.client.on('message', (msg, rinfo) => {
			try {
				const meshString = msg.toString()
				const message = Message.fromMesh(meshString)
				this.emit('message', message, rinfo)
			} catch (e) {
				this.emit('error', e)
			}
		})

		this.client.on('error', (err) => {
			this.emit('error', err)
		})

		this.client.on('listening', () => {
			const address = this.client.address()
			this.client.setBroadcast(true)
			this.emit('ready', address)
		})

		this.client.bind(this.port)
	}

	/**
	 * Send message to the mesh.
	 * @param {Message} message
	 */
	async send(message) {
		const packet = message.toMesh()
		const buffer = Buffer.from(packet)

		return new Promise((resolve, reject) => {
			this.client.send(
				buffer,
				0,
				buffer.length,
				this.port,
				'255.255.255.255',
				(err) => {
					if (err) reject(err)
					else resolve()
				},
			)
		})
	}

	close() {
		this.client.close()
	}
}
