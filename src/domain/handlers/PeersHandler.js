export class PeersHandler {
	async *execute(message, context) {
		yield { type: 'spinner', text: 'Scanning LoRa mesh for peers...' }
		await new Promise((r) => setTimeout(r, 800))

		const selfId = context.getSelfId ? context.getSelfId() : 'primary-node'

		let meshPeers = []
		try {
			const fs = await import('node:fs')
			const path = await import('node:path')
			const registryPath = path.join(process.cwd(), 'data/mesh_registry.jsonl')

			if (fs.existsSync(registryPath)) {
				const content = fs.readFileSync(registryPath, 'utf8')
				const registryLines = content
					.split('\n')
					.filter((line) => line.trim())
					.map((line) => JSON.parse(line))

				// Take latest entry for each ID
				const latestEntries = {}
				for (const entry of registryLines) {
					latestEntries[entry.id] = entry
				}

				meshPeers = Object.values(latestEntries).filter((p) => p.id !== selfId)
			}
		} catch (e) {
			// Fallback
		}

		const defaultPeers = [
			{ id: 'yara-rasta', name: 'ЯRаСлав', status: 'online', avatar: '☀️' },
			{ id: 'socrates', name: 'Socrates', status: 'away', avatar: '🏛️' },
			{ id: 'tesla', name: 'Nikola Tesla', status: 'offline', avatar: '⚡' },
		].filter((p) => p.id !== selfId && !meshPeers.find((mp) => mp.id === p.id))

		const allPeers = [...meshPeers, ...defaultPeers]

		if (allPeers.length === 0) {
			yield { type: 'text', content: 'No other peers found in range.' }
		} else {
			yield {
				type: 'text',
				content: `Found **${allPeers.length}** peers in the mesh:\n`,
			}
			for (const peer of allPeers) {
				const color =
					peer.status === 'online'
						? '\x1b[32m'
						: peer.status === 'away'
							? '\x1b[33m'
							: '\x1b[90m'
				yield {
					type: 'text',
					content: `${peer.avatar} **${peer.name}** (${peer.id}) — ${color}${peer.status.toUpperCase()}\x1b[0m`,
				}
			}
		}
	}
}
