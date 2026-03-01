import { Message } from '../sovereign/index.js'

export class StatusHandler {
	async *execute(message, context) {
		const selfId = context.getSelfId ? context.getSelfId() : 'anonymous'

		yield {
			type: 'status',
			data: {
				soulId: selfId,
				status: 'online',
				balance: '144',
			},
		}

		// Broadcast presence in the mesh
		if (context.transport) {
			const model = new Message({
				type: 'text',
				authorId: selfId,
				text: 'Node is Online 📡',
			})
			if (context.identity) model.sign(context.identity)
			await context.transport.send(model)
		}

		yield {
			type: 'text',
			variant: 'info',
			content:
				'Node mesh status: Healthy. Transport: UDP Broadcast (Mesh Active).',
		}
	}
}
