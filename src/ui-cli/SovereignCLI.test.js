import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { SovereignCLI } from './SovereignCLI.js'
import { Chat } from '../domain/messages/ChatMessage.js'
import { Logs } from '../domain/messages/LogsMessage.js'
import { SOS } from '../domain/messages/AlertMessages.js'
import { SOScase } from '../domain/messages/CaseMessage.js'
import { ChatHandler } from '../domain/handlers/ChatHandler.js'
import { AlertHandler } from '../domain/handlers/AlertHandler.js'
import { LogsHandler } from '../domain/handlers/LogsHandler.js'
import { CaseHandler } from '../domain/handlers/CaseHandler.js'

class MockTransport {
	async send(msg) {
		this.lastSent = msg
	}
	on() {}
	off() {}
	listen() {}
	close() {}
}

const handlers = new Map()
handlers.set(Chat, ChatHandler)
handlers.set(SOS, AlertHandler)
handlers.set(Logs, LogsHandler)
handlers.set(SOScase, CaseHandler)

const context = {
	identity: {
		sign: () => 'fake-signature',
		publicKey: 'fake-pubkey',
	},
	transport: new MockTransport(),
	getSelfId: () => 'test-node',
}

const SNAPSHOT_DIR = path.join(process.cwd(), 'src/ui-cli/snapshots')

if (!fs.existsSync(SNAPSHOT_DIR)) {
	fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
}

// Reset data files for deterministic tests
const CASES_PATH = path.join(process.cwd(), 'data/cases.jsonl')
const INTENTIONS_PATH = path.join(process.cwd(), 'data/intentions.jsonl')

if (fs.existsSync(CASES_PATH)) fs.unlinkSync(CASES_PATH)
if (fs.existsSync(INTENTIONS_PATH)) fs.unlinkSync(INTENTIONS_PATH)

async function runScenario(name, argv) {
	const cli = new SovereignCLI({
		argv,
		Messages: [Chat, Logs, SOS, SOScase],
		handlers,
		context,
	})

	const output = []
	for await (const msg of cli.run()) {
		if (msg.content) {
			output.push(...(Array.isArray(msg.content) ? msg.content : [msg.content]))
		}
	}

	const cleanOutput = output
		.join('\n')
		.replace(/\x1b\[[0-9;]*m/g, '') // remove ANSI colors for snapshot
		.replace(
			/[0-9]{2}\.[0-9]{2}\.[0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2}/g,
			'DD.MM.YYYY HH:MM:SS',
		) // normalize dates
		.replace(/[0-9]{13}/g, 'TIMESTAMP') // normalize timestamps
		.replace(/#[A-Z0-9]{3,20}/g, '#CASEID') // normalize any #ID (like #WOK7ZD7P or [#IFJGIJ])

	const snapshotPath = path.join(SNAPSHOT_DIR, `${name}.txt`)

	if (process.env.UPDATE_SNAPSHOTS || !fs.existsSync(snapshotPath)) {
		fs.writeFileSync(snapshotPath, cleanOutput, 'utf8')
	}

	const expected = fs.readFileSync(snapshotPath, 'utf8')
	assert.equal(cleanOutput, expected, `Snapshot mismatch for ${name}`)
}

test('CLI Scenario — Help', async () => {
	await runScenario('help', ['--help'])
})

test('CLI Scenario — Chat message', async () => {
	await runScenario('chat', ['chat', '-t', 'Hello Mesh!'])
})

test('CLI Scenario — SOS Alert', async () => {
	await runScenario('sos', ['sos', '-t', 'Broke my leg!'])
})

test('CLI Scenario — Create Case', async () => {
	await runScenario('soscase_create', [
		'soscase',
		'-t',
		'Violation of Privacy',
		'-d',
		'Apple',
		'--desc',
		'Tracking without consent',
	])
})

test('CLI Scenario — List Cases', async () => {
	await runScenario('soscase_list', ['soscase'])
})

test('CLI Scenario — Logs view', async () => {
	// Create dummy intention for logs
	const logsPath = path.join(process.cwd(), 'data/intentions.jsonl')
	if (!fs.existsSync(path.dirname(logsPath)))
		fs.mkdirSync(path.dirname(logsPath), { recursive: true })
	fs.writeFileSync(
		logsPath,
		JSON.stringify({
			type: 'text',
			authorId: 'test-node',
			text: 'Legacy message',
			timestamp: 1740787200000,
		}) + '\n',
	)

	await runScenario('logs', ['logs'])
})
