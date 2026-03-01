/**
 * @docs
 * ### Subscription
 * User subscription to the Will-n-i state services ($99/mo).
 */
export class Subscription {
	static id = { help: 'Subscription ID', default: '' }
	/** @type {string} */
	id = Subscription.id.default

	static userId = { help: 'Subscriber user ID', default: '' }
	/** @type {string} */
	userId = Subscription.userId.default

	static planId = {
		help: 'Subscription plan',
		options: ['free', 'basic', 'co-creator', 'vip'],
		default: 'basic',
	}
	/** @type {'free' | 'basic' | 'co-creator' | 'vip'} */
	planId = Subscription.planId.default

	static status = {
		help: 'Subscription status',
		options: ['active', 'paused', 'cancelled', 'expired'],
		default: 'active',
	}
	/** @type {'active' | 'paused' | 'cancelled' | 'expired'} */
	status = Subscription.status.default

	static expiresAt = { help: 'Expiration date', default: '' }
	/** @type {string} */
	expiresAt = Subscription.expiresAt.default

	constructor(data = {}) {
		Object.assign(this, data)
	}

	get isActive() {
		return this.status === 'active'
	}

	static from(input) {
		if (input instanceof Subscription) return input
		return new Subscription(input)
	}
}
