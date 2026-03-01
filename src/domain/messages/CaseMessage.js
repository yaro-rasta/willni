import { DomainMessage } from '../DomainMessage.js'

export class CaseBody {
	title = ''
	defendant = ''
	description = ''
	evidence = ''

	static title = { alias: 't', default: '' }
	static defendant = { alias: 'd', default: '' }
	static description = { alias: 'desc', default: '' }
	static evidence = { alias: 'e', default: '' }
}

export class SOScase extends DomainMessage {
	static Body = CaseBody
}
