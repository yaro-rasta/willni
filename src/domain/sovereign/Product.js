/**
 * @docs
 * ### Product
 * Art, Service, or Digital/Physical asset for the iVerse.
 */
export class Product {
	static id = { help: 'Product/Artwork ID', default: '' }
	/** @type {string} */
	id = Product.id.default

	static title = { help: 'Title of Art or Service', default: '' }
	/** @type {string} */
	title = Product.title.default

	static description = { help: 'Detailed context', default: '' }
	/** @type {string} */
	description = Product.description.default

	static price = { help: 'Price (BTC/WILLNI)', default: 0 }
	/** @type {number} */
	price = Product.price.default

	static media = { help: 'Media files (IPFS CIDs)', default: [] }
	/** @type {string[]} */
	media = Product.media.default

	static type = {
		help: 'Product Type',
		options: ['art', 'service', 'digital', 'physical'],
		default: 'art',
	}
	/** @type {'art' | 'service' | 'digital' | 'physical'} */
	type = Product.type.default

	constructor(data = {}) {
		Object.assign(this, data)
	}
}
