import { DomainMessage } from '../DomainMessage.js'

export class AlertBody {
	text = ''
	location = null // [lat, long]

	static text = { alias: 't', default: '' }
	static location = { alias: 'l', default: null }
}

export class SOS extends DomainMessage {
	static Body = AlertBody
}

export class RAID extends DomainMessage {
	static Body = AlertBody
}

export class HELP extends DomainMessage {
	static Body = AlertBody
}
