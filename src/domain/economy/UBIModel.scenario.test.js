import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'
import { UBIModel } from './UBIModel.js'

describe('UBIModel OLMUI Scenario (@nan0web/db)', () => {

	it('distributes 1-33-33-33 and saves to DB via generator', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const model = new UBIModel({ db, amount: 10000 })
		const events = []
		
		const data = await runGenerator(model.run(), {
			ask: async () => ({ value: 10000 }),
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})

		assert.strictEqual(data.ubi, 3300)
		assert.strictEqual(data.founder, 100)

		const history = await db.loadDocument('economy/ubi_distribution')
		assert.strictEqual(history.length, 1)
		assert.strictEqual(history[0].ubi, 3300)
		assert.strictEqual(history[0].amount, 10000)
	})

	it('fails gracefully when amount is invalid', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const model = new UBIModel({ db, amount: -500 })
		const events = []
		
		const data = await runGenerator(model.run(), {
			ask: async () => {},
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})

		assert.strictEqual(data, null)
		assert.ok(events.some(e => e.includes('warn:Помилка')))

		const history = await db.loadDocument('economy/ubi_distribution')
		assert.strictEqual(history, undefined) // nothing was saved
	})
})
