/**
 * @docs
 * ### Payment
 * Financial transaction in the Will-n-i ecosystem ($WILLNI).
 */
export class Payment {
	static id = { help: 'Payment ID', default: '' }
	/** @type {string} */
	id = Payment.id.default

	static orderId = { help: 'Internal order/subscription ID', default: '' }
	/** @type {string} */
	orderId = Payment.orderId.default

	static amount = { help: 'Payment amount', default: 0 }
	/** @type {number} */
	amount = Payment.amount.default

	static currency = { help: 'Currency (e.g. WILLNI)', default: 'WILLNI' }
	/** @type {string} */
	currency = Payment.currency.default

	static status = {
		help: 'Transaction status',
		options: ['pending', 'completed', 'failed', 'refunded'],
		default: 'pending',
	}
	/** @type {'pending' | 'completed' | 'failed' | 'refunded'} */
	status = Payment.status.default

	static createdAt = { help: 'Transaction date', default: '' }
	/** @type {string} */
	createdAt = Payment.createdAt.default

	constructor(data = {}) {
		Object.assign(this, data)
	}

	static from(input) {
		if (input instanceof Payment) return input
		return new Payment(input)
	}
}
