import { Message } from '../sovereign/index.js'

export class AlertHandler {
	async *execute(message, context) {
		const type = message.constructor.name.toLowerCase()
		const text = message.body.text || `Alert: ${type.toUpperCase()}!`
		const location = message.body.location || [50.450123, 30.523456]

		yield {
			type: 'spinner',
			text: `Broadcasting emergency **${type.toUpperCase()}** to the mesh...`,
		}

		const model = new Message({
			type,
			authorId: context.getSelfId ? context.getSelfId() : 'anonymous',
			text,
			location,
		})

		if (context.identity) {
			model.sign(context.identity)
		}

		// Send via real mesh transport if available
		if (context.transport) {
			await context.transport.send(model)
		}

		await this.#saveIntention(model)
		await new Promise((r) => setTimeout(r, 800))

		const meshPacket = model.toMesh()

		yield {
			type: 'text',
			content: `**${type.toUpperCase()}** DEPLOYED`,
		}

		yield {
			type: 'text',
			variant: 'info',
			content: `Mesh packet: '${meshPacket.slice(0, 32)}...' (${meshPacket.length} bytes)`,
		}
	}

	async #saveIntention(model) {
		try {
			const fs = await import('node:fs')
			const path = await import('node:path')
			const logsPath = path.join(process.cwd(), 'data/intentions.jsonl')

			const line = JSON.stringify(model) + '\n'
			fs.appendFileSync(logsPath, line)
		} catch (e) {}
	}
}
