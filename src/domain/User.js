import { BaseUser } from './BaseUser.js'

/**
 * @docs
 * ### User (Sovereign Citizen)
 * Registered user of the Will-n-i digital state.
 */
export class User extends BaseUser {
	static role = {
		help: 'System role',
		options: ['citizen', 'co-creator', 'elder', 'admin'],
		default: 'citizen',
	}
	/** @type {'citizen' | 'co-creator' | 'elder' | 'admin'} */
	role = User.role.default

	static verified = { help: 'Verified (2LW protocol)', default: false }
	/** @type {boolean} */
	verified = User.verified.default

	constructor(data = {}) {
		super(data)
		Object.assign(this, data)
	}

	static from(input) {
		if (input instanceof User) return input
		return new User(input)
	}
}
