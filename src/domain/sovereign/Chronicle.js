/**
 * @docs
 * ### Chronicle
 * Life or Art history entry for the iVerse chronology.
 */
export class Chronicle {
	static id = { help: 'Entry ID', default: '' }
	/** @type {string} */
	id = Chronicle.id.default

	static date = { help: 'Event Date', default: '' }
	/** @type {string} */
	date = Chronicle.date.default

	static event = { help: 'Event Description', default: '' }
	/** @type {string} */
	event = Chronicle.event.default

	static media = { help: 'Associated Media', default: [] }
	/** @type {string[]} */
	media = Chronicle.media.default

	constructor(data = {}) {
		Object.assign(this, data)
	}
}
