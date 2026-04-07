// OutputMessage is mocked by plain objects with { content: [...] } to avoid @nan0web/co dependency
import {
	CommandParser,
	confirm,
	spinner,
	alert,
	select,
	autocomplete,
} from '@nan0web/ui-cli'

/**
 * PlayCLI - Terminal Sandbox Interface for Sovereign project.
 */
export class PlayCLI {
	constructor({ argv, Messages, handlers, context, logger }) {
		this.argv = argv
		this.handlers = handlers
		this.context = context || {}
		this.logger = logger
		this.parser = new CommandParser(Messages)
	}

	// Pre-process markdown-like bold to ANSI bold
	#md(text) {
		if (typeof text !== 'string') return text
		return text.replace(/\*\*(.+?)\*\*/g, '\x1b[1m$1\x1b[22m')
	}

	async *run() {
		let message
		this.hasError = false

		const selfId = this.context.getSelfId
			? this.context.getSelfId()
			: 'anonymous-node'
		await this.#registerNode(selfId)

		if (
			this.argv.length === 0 ||
			this.argv.includes('--help') ||
			this.argv.includes('-h')
		) {
			yield { content: [this.#generateHelp()] }
			return
		}

		try {
			message = this.parser.parse(this.argv)
		} catch (e) {
			yield { content: [this.#generateHelp()] }
			return
		}

		const HandlerClass = this.handlers.get(message.constructor)
		if (!HandlerClass) {
			yield {
				content: [`No handler found for command: ${message.constructor.name}`],
			}
			return
		}

		const handler = new HandlerClass()
		let generator
		try {
			generator = handler.execute(message, this.context)
		} catch (e) {
			yield { content: [`\x1b[31mExecution Error: ${e.message}\x1b[0m`] }
			return
		}

		let currentSpinner = null

		let result = await generator.next()

		while (!result.done) {
			const event = result.value
			let response = undefined

			if (currentSpinner) {
				const status = event.type === 'error' ? '✖' : '✔'
				currentSpinner.stop(status)
				currentSpinner = null
			}

			if (event.type === 'confirm') {
				response = await confirm({ message: event.message })
			} else if (event.type === 'select') {
				response = await select({
					title: event.message,
					options: event.options,
				})
			} else if (event.type === 'autocomplete') {
				response = await autocomplete({
					title: event.message,
					options: event.options,
					limit: event.limit || 15,
				})
			} else if (event.type === 'spinner') {
				currentSpinner = spinner(this.#md(event.text))
			} else if (event.type === 'alert') {
				const formatted = alert(event.message, event.variant, {
					title: event.title,
				})
				yield { content: [this.#md(formatted)] }
			} else if (event.type === 'status') {
				const { soulId, status, balance } = event.data
				const W = 40
				const pad = (label, val, vLen) => {
					const used = 3 + label.length + vLen
					return ' '.repeat(Math.max(1, W - used))
				}
				const sId = soulId.length > 20 ? soulId.slice(0, 20) + '...' : soulId
				const content = [
					`\n\x1b[33m\u2554${'\u2550'.repeat(W)}\u2557\x1b[0m`,
					`\x1b[33m\u2551\x1b[0m   Node ID: \x1b[36m${sId}\x1b[0m${pad('Node ID: ', sId, sId.length)}\x1b[33m\u2551\x1b[0m`,
					`\x1b[33m\u2560${'\u2550'.repeat(W)}\u2563\x1b[0m`,
					`\x1b[33m\u2551\x1b[0m   Status:  \x1b[32m${status.toUpperCase()}\x1b[0m${pad('Status:  ', status, status.length)}\x1b[33m\u2551\x1b[0m`,
					`\x1b[33m\u2551\x1b[0m   Rep:     \x1b[32m${balance}\x1b[0m${pad('Rep:     ', balance, balance.toString().length)}\x1b[33m\u2551\x1b[0m`,
					`\x1b[33m\u255a${'\u2550'.repeat(W)}\u255d\x1b[0m\n`,
				]
				yield { content }
			} else if (
				['text', 'success', 'json', 'error', 'finish'].includes(event.type)
			) {
				let content = event.content
				if (event.type === 'json' || this.context.json) {
					content = [JSON.stringify(event.data || event.content, null, 2)]
				} else if (event.type === 'text' && event.variant) {
					const colors = {
						info: '\x1b[36m',
						success: '\x1b[32m',
						warning: '\x1b[33m',
						error: '\x1b[31m',
					}
					const color = colors[event.variant] || ''
					content = Array.isArray(content)
						? content.map((c) => `${color}${c}\x1b[0m`)
						: [`${color}${content}\x1b[0m`]
				} else if (event.type === 'error') {
					this.hasError = true
					content = [`\x1b[31m[Error]: ${event.message}\x1b[0m`]
				}
				if (content) {
					content = Array.isArray(content)
						? content.map((c) => this.#md(c))
						: [this.#md(content)]
					yield { content }
				}
			}

			result = await generator.next(response)
		}

		if (currentSpinner) {
			currentSpinner.stop('✔')
		}
	}

	#generateHelp() {
		const C = '\x1b[33m' // gold/yellow
		const D = '\x1b[90m' // dim
		const B = '\x1b[1m' // bold
		const R = '\x1b[0m' // reset

		let out = '\n'
		out += `${C}${B}  ⚜️  Sovereign — Will & I Activation CLI${R}\n`
		out += `${D}  Decentralized interface for sovereign units${R}\n`
		out += '\n'
		out += `${C}  ${B}Usage:${R}  ${C}sovereign${R} ${D}<command>${R} ${D}[options]${R}\n`
		out += '\n'
		out += `${C}  ${B}Commands:${R}\n`
		out += `    ${C}chat${R}      ${D}Send intention to the mesh (-t "message")${R}\n`
		out += `    ${C}sos${R}       ${D}Broadcast life-threat alert with coordinates${R}\n`
		out += `    ${C}raid${R}      ${D}Alert mesh about TCC/Police encounter${R}\n`
		out += `    ${C}help${R}      ${D}Request assistance from peers${R}\n`
		out += `    ${C}logs${R}      ${D}View recent mesh intentions${R}\n`
		out += `    ${C}peers${R}     ${D}Find other nodes in the mesh${R}\n`
		out += `    ${C}status${R}    ${D}Show node state and reputation${R}\n`
		out += '\n'
		return out
	}

	async #registerNode(id) {
		try {
			const fs = await import('node:fs')
			const path = await import('node:path')
			const registryPath = path.join(process.cwd(), 'data/mesh_registry.jsonl')

			const data = {
				id,
				lastSeen: Date.now(),
				status: 'online',
				name:
					id === 'yara-rasta-sovereign-node'
						? 'ЯRаСлав'
						: `Node ${id.slice(0, 4)}`,
				avatar: id === 'yara-rasta-sovereign-node' ? '☀️' : '📡',
			}

			fs.appendFileSync(registryPath, JSON.stringify(data) + '\n')
		} catch (e) {}
	}
}
