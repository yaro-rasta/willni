import { describe, it, expect } from 'bun:test'
import { AntiCorruptionModel } from './AntiCorruptionModel.js'

describe('AntiCorruptionModel — Право на Fork (Захист від узурпації)', () => {
	it('fail: requires signalId and did', () => {
		const model = new AntiCorruptionModel()
		const res = model.validate()
		expect(res.isValid).toBe(false)
		expect(res.error).toMatch(/signalId and did are required/)
	})

	it('pass: isValid with correct fields', () => {
		const model = new AntiCorruptionModel({ signalId: 'vote-1', did: 'user-001' })
		expect(model.validate().isValid).toBe(true)
	})

	it('evaluateForkSignal — Fork not triggered (below 33%)', () => {
		const totalUsers = 100
		const signals = [
			{ did: 'user-1' },
			{ did: 'user-2' },
			{ did: 'user-3' },
			// user-2 votes twice (duplicate should be ignored)
			{ did: 'user-2' }
		] // Unique: 3

		const res = AntiCorruptionModel.evaluateForkSignal(signals, totalUsers)
		expect(res.isForkTriggered).toBe(false)
		expect(res.uniqueSignalsCount).toBe(3)
		expect(res.thresholdRequired).toBe(34) // 100 * 1/3 rounded up
	})

	it('evaluateForkSignal — Fork IS triggered (> 33%)', () => {
		const totalUsers = 60
		// Threshold: 60 * 1/3 = 20. We need at least 20 unique signals.
		const signals = Array.from({ length: 25 }, (_, i) => ({ did: `user-${i + 1}` }))

		const res = AntiCorruptionModel.evaluateForkSignal(signals, totalUsers)
		expect(res.isForkTriggered).toBe(true)
		expect(res.uniqueSignalsCount).toBe(25)
		expect(res.thresholdRequired).toBe(20)
	})
})
