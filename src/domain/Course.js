/**
 * @docs
 * ### Course
 * Online course offered in the Will-n-i ecosystem.
 */
export class Course {
	static id = { help: 'Unique course ID', default: '' }
	/** @type {string} */
	id = Course.id.default

	static title = { help: 'Course title', default: '' }
	/** @type {string} */
	title = Course.title.default

	static description = { help: 'Course description', default: '' }
	/** @type {string} */
	description = Course.description.default

	static instructorId = { help: 'Instructor user ID', default: '' }
	/** @type {string} */
	instructorId = Course.instructorId.default

	static price = { help: 'Course price (WILLNI)', default: 0 }
	/** @type {number} */
	price = Course.price.default

	static status = {
		help: 'Course status',
		options: ['draft', 'published', 'archived'],
		default: 'draft',
	}
	/** @type {'draft' | 'published' | 'archived'} */
	status = Course.status.default

	static createdAt = { help: 'Creation date', default: '' }
	/** @type {string} */
	createdAt = Course.createdAt.default

	constructor(data = {}) {
		Object.assign(this, data)
	}

	static from(input) {
		if (input instanceof Course) return input
		return new Course(input)
	}
}
