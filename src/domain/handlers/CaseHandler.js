import { Case } from '../sovereign/index.js'

export class CaseHandler {
	async *execute(message, context) {
		const { title, defendant, description, evidence } = message.body
		const isList = !title

		// Mode: List cases
		if (isList) {
			yield {
				type: 'spinner',
				text: 'Scanning mesh for active judicial cases...',
			}
			await new Promise((r) => setTimeout(r, 600))

			const cases = await this.#loadCases()
			if (cases.length === 0) {
				yield {
					type: 'text',
					content: 'No active cases in the Sovereign Court.',
				}
				return
			}

			yield {
				type: 'text',
				content: `🏛️ **Sovereign Court Protocol: Active Cases (${cases.length})**\n`,
			}
			for (const c of cases) {
				const model = new Case(c)
				const statusColor =
					model.status === 'resolved' ? '\x1b[32m' : '\x1b[33m'
				yield {
					type: 'text',
					content: `⚖️ **[#${model.id.slice(0, 6)}]** ${model.title}\n   Defendant: **${model.defendant}**\n   Status: ${statusColor}${model.status.toUpperCase()}\x1b[0m | Verdict: **${model.verdict.toUpperCase().replace('_', ' ')}**\n`,
				}
			}
			return
		}

		// Mode: Create case
		yield {
			type: 'spinner',
			text: 'Registering new case in the Mesh Registry...',
		}

		const newCase = new Case({
			id: Math.random().toString(36).substring(2, 10).toUpperCase(),
			title,
			defendant: defendant || 'unknown',
			description: description || 'No description provided.',
			evidence: evidence ? [evidence] : [],
			status: 'investigation',
			votes: { guilty: 0, innocent: 0 },
		})

		await this.#saveCase(newCase)
		await new Promise((r) => setTimeout(r, 1000))

		yield {
			type: 'text',
			variant: 'success',
			content: `Case **#${newCase.id}** successfully registered. Status: INVESTIGATION.`,
		}
	}

	async #loadCases() {
		try {
			const fs = await import('node:fs')
			const path = await import('node:path')
			const dbPath = path.join(process.cwd(), 'data/cases.jsonl')
			if (!fs.existsSync(dbPath)) return []

			const content = fs.readFileSync(dbPath, 'utf8')
			return content
				.split('\n')
				.filter((l) => l.trim())
				.map((l) => JSON.parse(l))
		} catch (e) {
			return []
		}
	}

	async #saveCase(model) {
		const fs = await import('node:fs')
		const path = await import('node:path')
		const dbPath = path.join(process.cwd(), 'data/cases.jsonl')
		const line = JSON.stringify(model) + '\n'
		fs.appendFileSync(dbPath, line)
	}
}
