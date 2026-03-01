import { DomainMessage } from '../DomainMessage.js'

export class PeersBody {}

export class Peers extends DomainMessage {
	static Body = PeersBody
}
