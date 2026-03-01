#!/usr/bin/env node
import { SovereignCLI } from '../src/ui-cli/SovereignCLI.js'
import Logger from '@nan0web/log'

// Messages
import { Chat } from '../src/domain/messages/ChatMessage.js'
import { Status } from '../src/domain/messages/StatusMessage.js'
import { Peers } from '../src/domain/messages/PeersMessage.js'
import { Logs } from '../src/domain/messages/LogsMessage.js'
import { SOS, RAID, HELP } from '../src/domain/messages/AlertMessages.js'
import { SOScase } from '../src/domain/messages/CaseMessage.js'

// Handlers
import { ChatHandler } from '../src/domain/handlers/ChatHandler.js'
import { StatusHandler } from '../src/domain/handlers/StatusHandler.js'
import { PeersHandler } from '../src/domain/handlers/PeersHandler.js'
import { LogsHandler } from '../src/domain/handlers/LogsHandler.js'
import { AlertHandler } from '../src/domain/handlers/AlertHandler.js'
import { CaseHandler } from '../src/domain/handlers/CaseHandler.js'
import {
	IdentityManager,
	MeshTransport,
} from '../src/domain/sovereign/index.js'

const identity = new IdentityManager('cli/data')
identity.load()

const transport = new MeshTransport()

const argv = process.argv.slice(2)
const debug = argv.includes('--debug')
const json = argv.includes('--json')

const handlers = new Map()
handlers.set(Chat, ChatHandler)
handlers.set(Status, StatusHandler)
handlers.set(Peers, PeersHandler)
handlers.set(Logs, LogsHandler)
handlers.set(SOS, AlertHandler)
handlers.set(RAID, AlertHandler)
handlers.set(HELP, AlertHandler)
handlers.set(SOScase, CaseHandler)

const context = {
	debug,
	json,
	identity,
	transport,
	getSelfId: () => process.env.SOVEREIGN_ID || identity.publicKey,
}

const logger = new Logger({ level: debug ? 'debug' : 'info' })

const cli = new SovereignCLI({
	argv,
	Messages: [Chat, Status, Peers, Logs, SOS, RAID, HELP, SOScase],
	logger,
	handlers,
	context,
})

async function run() {
	try {
		// Start mesh listening
		transport.listen()

		for await (const msg of cli.run()) {
			if (msg.content) {
				const text = Array.isArray(msg.content)
					? msg.content.join('\n')
					: String(msg.content)
				process.stdout.write(text + '\n')
			}
		}

		transport.close()
		process.exit(cli.hasError ? 1 : 0)
	} catch (err) {
		process.stderr.write(`\x1b[31m[Fatal Error]: ${err.message}\x1b[0m\n`)
		if (debug) console.error(err)
		transport.close()
		process.exit(1)
	}
}

run()
