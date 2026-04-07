import { describe, it, expect } from 'bun:test'
import { ProposalModel } from './ProposalModel.js'

describe('ProposalModel — Спільне Творення (Co-Creation)', () => {
	it('fail: requires id, title, author, amount', () => {
		const model = new ProposalModel()
		const res = model.validate()
		expect(res.isValid).toBe(false)
		expect(res.error).toMatch(/id, title, authorDid/)
	})

	it('fail: requires positive amount', () => {
		const model = new ProposalModel({
			id: 'prop-1',
			title: 'A title',
			authorDid: 'user-001',
			requestedAmount: 0
		})
		const res = model.validate()
		expect(res.isValid).toBe(false)
		expect(res.error).toMatch(/positive/)
	})

	it('evaluateFundingStrategy — Rejected (below 2/3)', () => {
		const totalActiveSpace = 100
		const model = new ProposalModel({
			id: 'prop-2',
			title: 'Build UI for Council',
			authorDid: 'user-002',
			requestedAmount: 1000,
			supportVotes: 60 // 60 < Math.ceil(100 * 2/3) => 67
		})

		const res = model.evaluateFundingStrategy(totalActiveSpace)
		expect(res.isFunded).toBe(false)
		expect(res.status).toBe('rejected')
		expect(model.status).toBe('rejected')
	})

	it('evaluateFundingStrategy — Funded (>= 2/3)', () => {
		const totalActiveSpace = 60
		const model = new ProposalModel({
			id: 'prop-3',
			title: 'Host Node Infrastructure',
			authorDid: 'user-003',
			requestedAmount: 500,
			supportVotes: 40 // exactly 60 * 2/3 = 40
		})

		const res = model.evaluateFundingStrategy(totalActiveSpace)
		expect(res.isFunded).toBe(true)
		expect(res.status).toBe('funded')
		expect(model.status).toBe('funded')
	})

	it('Marketplace percentages are correct', () => {
		expect(ProposalModel.MARKETPLACE_AUTHOR_PERCENT).toBe(0.91)
		expect(ProposalModel.MARKETPLACE_COMMUNITY_PERCENT).toBe(0.09)
	})
})
