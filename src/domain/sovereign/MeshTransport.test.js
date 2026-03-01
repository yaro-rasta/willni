import test from 'node:test'
import assert from 'node:assert/strict'
import { MeshTransport, Message } from './index.js'

test('MeshTransport — send and receive broadcast message', async () => {
	const node1 = new MeshTransport(4221)
	const node2 = new MeshTransport(4221) // same port for broadcast

	const receivedMessages = []

	node2.on('message', (msg) => {
		receivedMessages.push(msg)
	})

	node1.listen()
	node2.listen()

	// Wait for sockets to be ready
	await new Promise((resolve) => {
		let readyCount = 0
		const check = () => {
			readyCount++
			if (readyCount === 2) resolve()
		}
		node1.on('ready', check)
		node2.on('ready', check)
	})

	const msg = new Message({
		authorId: 'test-node-1',
		text: 'Hello from Mesh!',
		type: 'text',
		signature: 'fake-sig',
	})

	await node1.send(msg)

	// Wait for network propagation
	await new Promise((r) => setTimeout(r, 100))

	assert.equal(receivedMessages.length, 1, 'Node 2 should receive 1 message')
	assert.equal(receivedMessages[0].text, 'Hello from Mesh!')
	assert.equal(receivedMessages[0].authorId, 'test-node-1')

	node1.close()
	node2.close()
})
