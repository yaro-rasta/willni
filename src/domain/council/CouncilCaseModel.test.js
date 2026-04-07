import { describe, it, expect } from 'bun:test'
import { Crypto } from '@nan0web/auth-core'
import { CouncilCaseModel } from './CouncilCaseModel.js'

describe('CouncilCaseModel — Рада та Механізм Захисту', () => {
	it('fail: requires id, initiator, respondent', () => {
		const model = new CouncilCaseModel()
		const res = model.validate()
		expect(res.isValid).toBe(false)
		expect(res.error).toMatch(/id, initiatorDid, and respondentDid are required/)
	})

	it('fail: cannot accuse themselves', () => {
		const { publicKey: myDid } = Crypto.generateKeyPair()
		const model = new CouncilCaseModel({
			id: 'case-1',
			initiatorDid: myDid,
			respondentDid: myDid
		})
		const res = model.validate()
		expect(res.isValid).toBe(false)
		expect(res.error).toMatch(/cannot accuse themselves/)
	})

	it('evaluate: Not finalized if not enough jurors (min 12)', () => {
		const { publicKey: iDid } = Crypto.generateKeyPair()
		const { publicKey: rDid } = Crypto.generateKeyPair()

		const model = new CouncilCaseModel({
			id: 'case-2',
			initiatorDid: iDid,
			respondentDid: rDid,
			jurors: Array(11).fill('did-juror'),
			votesForDisconnect: 8
		})

		const res = model.evaluateDecision()
		expect(res.finalized).toBe(false)
		expect(res.reason).toMatch(/Not enough jurors active/)
	})

	it('evaluate: Disconnect (Кворум 2/3) — 12 jurors, 8 votes', () => {
		const { publicKey: iDid } = Crypto.generateKeyPair()
		const { publicKey: rDid } = Crypto.generateKeyPair()

		const model = new CouncilCaseModel({
			id: 'case-3',
			initiatorDid: iDid,
			respondentDid: rDid,
			jurors: Array(12).fill('did-juror'),
			votesForDisconnect: 8,
			severityLevel: 3 // Значна тяжкість
		})

		const res = model.evaluateDecision()
		expect(res.finalized).toBe(true)
		expect(res.newStatus).toBe('closed-disconnect')
		expect(res.disconnectYears).toBe(9) // Level 3 = 9 years
	})

	it('evaluate: Acquitted (Немає кворуму 2/3) — 12 jurors, 7 votes', () => {
		const { publicKey: iDid } = Crypto.generateKeyPair()
		const { publicKey: rDid } = Crypto.generateKeyPair()

		const model = new CouncilCaseModel({
			id: 'case-4',
			initiatorDid: iDid,
			respondentDid: rDid,
			jurors: Array(12).fill('did-juror'),
			votesForDisconnect: 7,
			severityLevel: 5 // Абсолютна тяжкість
		})

		const res = model.evaluateDecision()
		expect(res.finalized).toBe(true)
		expect(res.newStatus).toBe('closed-acquitted')
	})

	it('Severity Scale mapping (1→1, 2→3, 3→9, 4→33, 5→99)', () => {
		const { publicKey: iDid } = Crypto.generateKeyPair()
		const { publicKey: rDid } = Crypto.generateKeyPair()

		const testSeverity = (level, expectedYears) => {
			const model = new CouncilCaseModel({
				id: `case-sev-${level}`,
				initiatorDid: iDid,
				respondentDid: rDid,
				jurors: Array(12).fill('did-juror'),
				votesForDisconnect: 8,
				severityLevel: level
			})
			const res = model.evaluateDecision()
			expect(res.disconnectYears).toBe(expectedYears)
		}

		testSeverity(1, 1)
		testSeverity(2, 3)
		testSeverity(3, 9)
		testSeverity(4, 33)
		testSeverity(5, 99)
	})
})
