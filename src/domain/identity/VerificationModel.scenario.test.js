import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Crypto } from '@nan0web/auth-core'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'
import { VerificationModel } from './VerificationModel.js'

describe('VerificationModel OLMUI Scenario (@nan0web/db)', () => {

	it('completes 2LW protocol and updates DB', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: w1 } = Crypto.generateKeyPair()
		const { publicKey: w2 } = Crypto.generateKeyPair()

		const model = new VerificationModel({ db, did: myDid })
		const events = []
		
		const data = await runGenerator(model.run(), {
			ask: async (intent) => {
				if (intent.field === 'isGenesis') return { value: false }
				if (intent.field === 'witness1') return { value: w1 }
				if (intent.field === 'witness2') return { value: w2 }
			},
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})

		assert.strictEqual(data.did, myDid)
		assert.strictEqual(data.isGenesis, false)
		assert.strictEqual(data.witnesses.length, 2)

		const registry = await db.loadDocument('identity/verified')
		assert.strictEqual(registry.length, 1)
		assert.strictEqual(registry[0].did, myDid)
		assert.ok(registry[0].witnesses.includes(w1))
		assert.ok(registry[0].witnesses.includes(w2))
	})

	it('completes Genesis 3+ protocol and updates DB', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: w1 } = Crypto.generateKeyPair()
		const { publicKey: w2 } = Crypto.generateKeyPair()
		const { publicKey: w3 } = Crypto.generateKeyPair()

		const model = new VerificationModel({ db })
		delete model.isGenesis
		const events = []
		
		const data = await runGenerator(model.run(), {
			ask: async (intent) => {
				if (intent.field === 'did') return { value: myDid }
				if (intent.field === 'isGenesis') return { value: 'true' }
				if (intent.field === 'witness1') return { value: w1 }
				if (intent.field === 'witness2') return { value: w2 }
				if (intent.field === 'witness3') return { value: w3 }
			},
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})

		assert.strictEqual(data.isGenesis, true)
		assert.strictEqual(data.witnesses.length, 3)

		const registry = await db.loadDocument('identity/verified')
		assert.strictEqual(registry[0].isGenesis, true)
	})

	it('rejects invalid inputs without saving to DB', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: w1 } = Crypto.generateKeyPair()

		const model = new VerificationModel({ db })
		const events = []
		
		const data = await runGenerator(model.run(), {
			ask: async (intent) => {
				if (intent.field === 'did') return { value: myDid }
				if (intent.field === 'isGenesis') return { value: false }
				if (intent.field === 'witness1') return { value: w1 }
				if (intent.field === 'witness2') return { value: w1 } // same witness! Error.
			},
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})

		assert.strictEqual(data, null)
		assert.ok(events.some(e => e.includes('Помилка')))
		assert.ok(events.some(e => e.includes('unique individuals')))

		const registry = await db.loadDocument('identity/verified')
		assert.strictEqual(registry, undefined)
	})
})
