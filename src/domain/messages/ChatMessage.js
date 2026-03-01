import { DomainMessage } from '../DomainMessage.js'

export class ChatBody {
	text = ''

	static text = { alias: 't', default: '' }
}

export class Chat extends DomainMessage {
	static Body = ChatBody
}
