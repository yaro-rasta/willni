/**
 * @docs
 * ### BaseUser
 * Base user / subject schema for nan0web Authorization.
 */
export class BaseUser {
	static id = { help: 'Unique user identifier', default: '' }
	/** @type {string} */
	id = BaseUser.id.default

	static username = { help: 'Display name / username', default: '' }
	/** @type {string} */
	username = BaseUser.username.default

	static email = { help: 'Email address (optional)', default: '' }
	/** @type {string} */
	email = BaseUser.email.default

	static locale = {
		help: 'Interface language',
		options: ['uk', 'en'],
		default: 'uk',
	}
	/** @type {'uk' | 'en'} */
	locale = BaseUser.locale.default

	static createdAt = { help: 'Registration date', default: '' }
	/** @type {string} */
	createdAt = BaseUser.createdAt.default

	constructor(data = {}) {
		Object.assign(this, data)
	}

	static from(input) {
		if (input instanceof BaseUser) return input
		return new BaseUser(input)
	}
}
