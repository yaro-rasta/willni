/**
 * @docs
 * ### Subject
 * Subject of the Sovereign Digital State — The Living Person.
 */
export class Subject {
	static id = { help: 'Cryptographic ID (Ed25519 Public Key)', default: '' }
	/** @type {string} */
	id = Subject.id.default

	static name = { help: 'Living Person Name', default: '' }
	/** @type {string} */
	name = Subject.name.default

	static lineage = {
		help: 'Lineage / Family name (of the house of...)',
		default: '',
	}
	/** @type {string} */
	lineage = Subject.lineage.default

	static status = {
		help: 'Legal Status',
		options: ['sovereign', 'citizen', 'person'],
		default: 'sovereign',
	}
	/** @type {'sovereign' | 'citizen' | 'person'} */
	status = Subject.status.default

	static reputation = { help: 'Voting Weight (REP)', default: 0 }
	/** @type {number} */
	reputation = Subject.reputation.default

	constructor(data = {}) {
		Object.assign(this, data)
	}
}
