import test from 'node:test'
import assert from 'node:assert/strict'
import { Crypto } from '@nan0web/auth-core'
import { MeshMessage, Subject } from './index.js'

test('Sovereign Identity — sign and verify MeshMessage', () => {
	// 1. Generate Sovereign Identity (Subject)
	const { publicKey, privateKey } = Crypto.generateKeyPair()
	const me = new Subject({
		id: publicKey,
		name: 'ЯRаСлав',
		status: 'sovereign',
	})

	assert.equal(me.id, publicKey)

	// 2. Create message
	const msg = new MeshMessage({
		authorId: me.id,
		text: 'This is a sovereign message signed with Ed25519',
		type: 'text',
	})

	// 3. Sign message content
	// We sign a string representation of the message (canonical JSON or just the text)
	const contentToSign = JSON.stringify({
		authorId: msg.authorId,
		text: msg.text,
		type: msg.type,
		timestamp: msg.timestamp,
	})

	msg.signature = Crypto.sign(privateKey, contentToSign)
	assert.ok(msg.signature)

	// 4. Verify message
	const isVerified = Crypto.verify(me.id, contentToSign, msg.signature)
	assert.strictEqual(
		isVerified,
		true,
		'Message should be cryptographically verified',
	)

	// 5. Verify failure on tempered content
	const tamperedContent = contentToSign.replace('sovereign', 'tampered')
	const isBroken = Crypto.verify(me.id, tamperedContent, msg.signature)
	assert.strictEqual(
		isBroken,
		false,
		'Tampered content should fail verification',
	)

	// 6. Test Bit-Sovereign Serialization (toMesh/fromMesh)
	const meshString = msg.toMesh()
	assert.ok(meshString.includes(msg.signature))
	assert.ok(meshString.includes(msg.text))

	const hydrated = MeshMessage.fromMesh(meshString)
	assert.equal(hydrated.authorId, msg.authorId)
	assert.equal(hydrated.signature, msg.signature)
	assert.equal(hydrated.text, msg.text)
	assert.equal(hydrated.timestamp, msg.timestamp)

	// Verify hydrated message
	const hydratedContent = JSON.stringify({
		authorId: hydrated.authorId,
		text: hydrated.text,
		type: hydrated.type,
		timestamp: hydrated.timestamp,
	})
	assert.ok(
		Crypto.verify(hydrated.authorId, hydratedContent, hydrated.signature),
	)
})
