export class LogsHandler {
	async *execute(message, context) {
		const isFollow = message.body.follow

		if (!isFollow) {
			yield { type: 'spinner', text: 'Retrieving mesh intentions...' }
			await new Promise((r) => setTimeout(r, 600))
		}

		try {
			const fs = await import('node:fs')
			const path = await import('node:path')
			const logsPath = path.join(process.cwd(), 'data/intentions.jsonl')

			// 1. Show existing logs from file
			if (fs.existsSync(logsPath)) {
				const content = fs.readFileSync(logsPath, 'utf8')
				const logs = content
					.split('\n')
					.filter((line) => line.trim())
					.map((line) => JSON.parse(line))

				if (logs.length > 0) {
					yield {
						type: 'text',
						content: `Last **${logs.length > 12 ? 12 : logs.length}** intentions discovered from history:\n`,
					}

					for (const log of logs.slice(-12)) {
						yield { type: 'text', content: this.#formatLog(log) }
					}
				}
			}

			// 2. Monitor Live Mesh if follow is true
			if (isFollow) {
				yield {
					type: 'text',
					variant: 'info',
					content:
						'📡 **Listening to Mesh (UDP Broadcast) in real-time...** Press Ctrl+C to stop.\n',
				}

				if (!context.transport) {
					yield {
						type: 'error',
						message: 'Mesh transport not available for live monitoring.',
					}
					return
				}

				// Create a promise that stays open and yields messages via a queue
				const queue = []
				let resolveNext = null

				const onMessage = (msg) => {
					queue.push(msg)
					if (resolveNext) {
						resolveNext()
						resolveNext = null
					}
				}

				context.transport.on('message', onMessage)

				try {
					while (true) {
						if (queue.length === 0) {
							await new Promise((r) => {
								resolveNext = r
							})
						}
						const liveMsg = queue.shift()
						yield { type: 'text', content: this.#formatLog(liveMsg) }
					}
				} finally {
					context.transport.off('message', onMessage)
				}
			}
		} catch (e) {
			yield { type: 'error', message: `Failed to process logs: ${e.message}` }
		}
	}

	#formatLog(log) {
		const dateStr = new Date(log.timestamp)
			.toISOString()
			.slice(0, 23)
			.replace('T', ' ')

		const types = {
			sos: { color: '\x1b[31m', icon: '🆘' },
			raid: { color: '\x1b[31m', icon: '🚨' },
			help: { color: '\x1b[33m', icon: '🤝' },
			text: { color: '\x1b[90m', icon: '💬' },
		}

		const typeInfo = types[log.type] || types.text
		const locStr = log.location
			? ` \x1b[90m(${log.location[0].toFixed(6)}, ${log.location[1].toFixed(6)})\x1b[0m`
			: ''

		return `[\x1b[90m${dateStr}\x1b[0m] ${typeInfo.icon} ${typeInfo.color}**${log.authorId.slice(0, 8)}**\x1b[0m:${locStr} ${log.text}`
	}
}
