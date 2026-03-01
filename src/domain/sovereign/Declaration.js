/**
 * @docs
 * ### Declaration
 * Statement of Will by a Sovereign Subject.
 */
export class Declaration {
	static id = { help: 'Declaration Content Hash', default: '' }
	/** @type {string} */
	id = Declaration.id.default

	static subjectId = { help: 'Subject Public Key', default: '' }
	/** @type {string} */
	subjectId = Declaration.subjectId.default

	static text = { help: 'Statement of Will', default: '' }
	/** @type {string} */
	text = Declaration.text.default

	static signature = { help: 'Cryptographic Signature', default: '' }
	/** @type {string} */
	signature = Declaration.signature.default

	static timestamp = { help: 'Record Timestamp (ms)', default: Date.now() }
	/** @type {number} */
	timestamp = Declaration.timestamp.default

	static isPublic = { help: 'Publicly Visible in Registry', default: true }
	/** @type {boolean} */
	isPublic = Declaration.isPublic.default

	constructor(data = {}) {
		Object.assign(this, data)
	}
}
