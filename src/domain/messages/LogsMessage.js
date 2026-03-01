import { DomainMessage } from '../DomainMessage.js'

export class LogsBody {
	follow = false
	static follow = { alias: 'f', default: false }
}

export class Logs extends DomainMessage {
	static Body = LogsBody
}
