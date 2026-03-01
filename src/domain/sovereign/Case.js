/**
 * @docs
 * ### Case
 * Legal case for the Sovereign Court.
 */
export class Case {
	static id = { help: 'Case Identifier', default: '' }
	/** @type {string} */
	id = Case.id.default

	static title = { help: 'Case Title', default: '' }
	/** @type {string} */
	title = Case.title.default

	static defendant = { help: 'Defendant (Subject or Entity)', default: '' }
	/** @type {string} */
	defendant = Case.defendant.default

	static description = { help: 'Nature of Natural Law Violation', default: '' }
	/** @type {string} */
	description = Case.description.default

	static evidence = { help: 'Array of evidence links (IPFS/CID)', default: [] }
	/** @type {string[]} */
	evidence = Case.evidence.default

	static status = {
		help: 'Case Status',
		options: ['investigation', 'voting', 'resolved', 'dismissed'],
		default: 'investigation',
	}
	/** @type {'investigation' | 'voting' | 'resolved' | 'dismissed'} */
	status = Case.status.default

	static votes = {
		help: 'Voting results',
		default: { guilty: 0, innocent: 0 },
	}
	/** @type {{guilty: number, innocent: number}} */
	votes = Case.votes.default

	/**
	 * Consensus Logic
	 * @returns {'pending' | 'guilty_consensus' | 'innocent_consensus' | 'guilty_compromise' | 'innocent_compromise'}
	 */
	get verdict() {
		const total = this.votes.guilty + this.votes.innocent
		if (total === 0) return 'pending'
		if (this.votes.guilty === total) return 'guilty_consensus'
		if (this.votes.innocent === total) return 'innocent_consensus'
		if (this.votes.guilty / total >= 0.66) return 'guilty_compromise'
		return 'innocent_compromise'
	}

	/**
	 * @returns {boolean}
	 */
	get isConsensus() {
		const total = this.votes.guilty + this.votes.innocent
		return (
			total > 0 &&
			(this.votes.guilty === total || this.votes.innocent === total)
		)
	}

	constructor(data = {}) {
		Object.assign(this, data)
	}
}
