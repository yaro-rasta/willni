import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Crypto } from '@nan0web/auth-core'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'
import { CouncilCaseModel } from './CouncilCaseModel.js'

describe('CouncilCaseModel OLMUI Scenario (@nan0web/db)', () => {

	it('creates case interactively and saves to DB', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const { publicKey: iDid } = Crypto.generateKeyPair()
		const { publicKey: rDid } = Crypto.generateKeyPair()

		const model = new CouncilCaseModel({ db })
		const events = []
		
		const data = await runGenerator(model.run(), {
			ask: async (intent) => {
				if (intent.field === 'initiatorDid') return { value: iDid }
				if (intent.field === 'severityLevel') return { value: '3' }
				if (intent.field === 'respondentDid') return { value: rDid }
			},
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})

		assert.strictEqual(data.initiatorDid, iDid)
		assert.strictEqual(data.respondentDid, rDid)
		assert.strictEqual(data.severityLevel, 3)
		assert.ok(events.some(e => e.includes('успішно сформовано')))

		const councilCases = await db.loadDocument('council/cases')
		assert.strictEqual(councilCases.length, 1)
		assert.strictEqual(councilCases[0].status, 'initiated')
		assert.strictEqual(councilCases[0].severityLevel, 3)
		assert.strictEqual(councilCases[0].initiatorDid, iDid)
	})

	it('executes Council decision and mutates DB (Quorum Reached -> Disconnect)', async () => {
		const { publicKey: iDid } = Crypto.generateKeyPair()
		const { publicKey: rDid } = Crypto.generateKeyPair()
		const caseId = 'case-quorum-1'

		const db = new DB({ 
			predefined: [['council/cases', [
				{ 
					id: caseId, 
					initiatorDid: iDid, 
					respondentDid: rDid, 
					status: 'active',
					severityLevel: 4,
					votesForDisconnect: 0,
					createdAt: '2026-01-01T00:00:00.000Z'
				}
			]]]
		})
		await db.connect()

		const model = new CouncilCaseModel({ 
			db,
			id: caseId,
			initiatorDid: iDid,
			respondentDid: rDid,
			severityLevel: 4,
			status: 'active',
			votesForDisconnect: 9,
			jurors: Array(12).fill('did-juror')
		})

		const events = []
		const data = await runGenerator(model.executeDecision(), {
			ask: async () => {},
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})
		
		assert.strictEqual(data.finalized, true)
		assert.strictEqual(data.newStatus, 'closed-disconnect')
		assert.strictEqual(data.disconnectYears, 33)

		const councilCases = await db.loadDocument('council/cases')
		assert.strictEqual(councilCases[0].status, 'closed-disconnect')

		const disconnectedInfo = await db.loadDocument('council/disconnected')
		assert.strictEqual(disconnectedInfo.length, 1)
		assert.strictEqual(disconnectedInfo[0].did, rDid)
		assert.strictEqual(disconnectedInfo[0].disconnectYears, 33)
		assert.strictEqual(disconnectedInfo[0].reasonCaseId, caseId)
	})

	it('rejects execution if decision is not finalized', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const model = new CouncilCaseModel({ 
			db,
			id: 'case-unfinalized',
			votesForDisconnect: 9,
			jurors: Array(5).fill('did-juror')
		})

		const events = []
		const data = await runGenerator(model.executeDecision(), {
			ask: async () => {},
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})
		
		assert.strictEqual(data, null)
		assert.ok(events.some(e => e.includes('ще не фіналізовано')))

		const councilCases = await db.loadDocument('council/cases')
		assert.strictEqual(councilCases, undefined)
	})
})
