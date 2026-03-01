import { Product } from './Product.js'
import { Chronicle } from './Chronicle.js'

/**
 * @docs
 * ### Verse
 * Unique Verse identifier (iVerse).
 * The digital projection of a Sovereign Subject.
 */
export class Verse {
	static id = { help: 'Unique Verse Identifier (iVerse)', default: '' }
	/** @type {string} */
	id = Verse.id.default

	static subjectId = { help: 'Owner ID (Subject Public Key)', default: '' }
	/** @type {string} */
	subjectId = Verse.subjectId.default

	static slug = { help: 'Custom URL slug', default: '' }
	/** @type {string} */
	slug = Verse.slug.default

	static profile = { help: 'Public Profile Content', default: {} }
	/** @type {object} */
	profile = Verse.profile.default

	static products = { help: 'Offered Products/Services', default: [] }
	/** @type {Product[]} */
	products = Verse.products.default

	static chronicles = { help: 'Life/Art Chronology entries', default: [] }
	/** @type {Chronicle[]} */
	chronicles = Verse.chronicles.default

	static ecosystem = {
		help: 'Economic Protocol (1-33-33-33)',
		default: { ubi: 33, dev: 33, treasury: 33, fee: 1 },
	}
	/** @type {{ubi: number, dev: number, treasury: number, fee: number}} */
	ecosystem = Verse.ecosystem.default

	constructor(data = {}) {
		Object.assign(this, data)
	}
}
