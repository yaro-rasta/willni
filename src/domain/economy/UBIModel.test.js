import { describe, it, expect } from 'bun:test'
import { UBIModel } from './UBIModel.js'

describe('UBIModel — Економіка Синергії 1-33-33-33', () => {
	it('розподіл суми', () => {
		const amount = 1000
		const { founder, ubi, dev, humanitarian } = UBIModel.distribute(amount)

		expect(ubi).toBe(330)
		expect(dev).toBe(330)
		expect(humanitarian).toBe(330)
		expect(founder).toBe(10) // 1000 - 990 = 10 (1%)
	})

	it('calculatePerCapita — від\'єднані не отримують UBI', () => {
		const ubiPool = 1000 // 1000 seed
		const users = [
			{ did: 'user1', isDisconnected: false },
			{ did: 'user2', isDisconnected: false },
			{ did: 'user3', isDisconnected: true },  // Від'єднаний Радою
			{ did: 'user4', isDisconnected: false },
			{ did: 'user5', isDisconnected: true },  // Від'єднаний Радою
		]

		// Має бути 3 активних користувачі, кожен отримує 1000 / 3 = 333 (з округленням донизу)
		const { perCapita, eligibleCount } = UBIModel.calculatePerCapita(ubiPool, users)

		expect(eligibleCount).toBe(3)
		expect(perCapita).toBe(333)
	})
})
