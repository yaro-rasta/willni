import { DomainMessage } from '../DomainMessage.js'

export class StatusBody {}

export class Status extends DomainMessage {
	static Body = StatusBody
}
