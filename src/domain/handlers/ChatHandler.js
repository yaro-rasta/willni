import { Message } from '../sovereign/index.js'

export class ChatHandler {
	async *execute(message, context) {
		const { text } = message.body

		if (!text) {
			yield {
				type: 'error',
				message: 'Text is required. Use -t "Your message"',
			}
			return
		}

		yield { type: 'spinner', text: 'Sending intention to the mesh...' }

		const authorId = context.getSelfId ? context.getSelfId() : 'anonymous-node'
		const model = new Message({
			type: 'text',
			authorId,
			text,
		})

		if (context.identity) {
			model.sign(context.identity)
		}

		// Send via real mesh transport if available
		if (context.transport) {
			await context.transport.send(model)
		}

		await this.#saveIntention(model)
		await new Promise((r) => setTimeout(r, 600))

		yield {
			type: 'text',
			variant: 'success',
			content: `Intention sent: '${text}'`,
		}
	}

	async #saveIntention(model) {
		try {
			const fs = await import('node:fs')
			const path = await import('node:path')
			const logsPath = path.join(process.cwd(), 'data/intentions.jsonl')

			const line = JSON.stringify(model) + '\n'
			fs.appendFileSync(logsPath, line)
		} catch (e) {
			// Silent fail
		}
	}
}
