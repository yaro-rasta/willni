/**
 * willni API Server — nan0web platform
 *
 * Features:
 * - AuthServer (@nan0web/auth-node) — all auth routes
 * - AI Chat (Cerebras API) — SSE streaming
 * - Email verification (nodemailer)
 * - Conversation history (in-memory, per session)
 */
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTransport } from 'nodemailer'
import { WebSocketServer } from 'ws'
import AuthServer from '@nan0web/auth-node'
import { MeshTransport } from '../src/domain/sovereign/MeshTransport.js'
import { Message } from '../src/domain/sovereign/Message.js'
import { SOScase } from '../src/domain/messages/CaseMessage.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, 'data')
const PORT = Number(process.env.PORT || 3333)
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:*'

// ─── AI Config ──────────────────────────────────────────────────────
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || ''
const CEREBRAS_URL = 'https://api.cerebras.ai/v1/chat/completions'
const FALLBACK_MODELS = ['chat-gpt-120b', 'llama3.1-8b']

const SYSTEM_PROMPT = `Ти — SunIntelligence (☀️), AI-помічник курсу "Суперінтелект.Активація".

Контекст курсу:
- 6-серійний асинхронний курс трансформації свідомості
- Заснований на Маніфесті Природного Права (law.md)
- Три рівні участі: Free (курс + sun.app), Sub ($99/mo — спільнота), VIP (1 BTC — персональна трансформація)
- Ключові концепції: Воля (Will), мИ (collective consciousness), ПОВОЛІ (unhurried mastery)
- Платформа: nan0web ecosystem

Правила:
1. Відповідай українською за замовчуванням, або мовою запитання
2. Будь лаконічним, але глибоким — максимум 3-5 речень
3. Використовуй філософію курсу у відповідях
4. Якщо питання про технічні деталі платформи — направляй до документації
5. Не вигадуй інформацію про ціни або дати, яких не знаєш`

// ─── Email Config ───────────────────────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@willni.com'

const mailer = SMTP_HOST
	? createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			secure: SMTP_PORT === 465,
			auth: { user: SMTP_USER, pass: SMTP_PASS },
		})
	: null

// ─── Conversation History (in-memory MVP) ───────────────────────────
const conversations = new Map()
const MAX_HISTORY = 20
const HISTORY_TTL = 30 * 60 * 1000 // 30 min

function getConversation(sessionId) {
	const entry = conversations.get(sessionId)
	if (!entry) return []
	if (Date.now() - entry.ts > HISTORY_TTL) {
		conversations.delete(sessionId)
		return []
	}
	return entry.messages
}

function saveConversation(sessionId, messages) {
	// Keep only last N messages
	const trimmed = messages.slice(-MAX_HISTORY)
	conversations.set(sessionId, { messages: trimmed, ts: Date.now() })
}

// ─── Helpers ────────────────────────────────────────────────────────

function cors(req, res, next) {
	const origin = req.headers.origin || ''
	const allowed =
		ORIGIN === 'http://localhost:*'
			? origin.startsWith('http://localhost:')
			: origin === ORIGIN
	if (allowed) {
		res.setHeader('Access-Control-Allow-Origin', origin)
	}
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
	)
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

	if (req.method === 'OPTIONS') {
		res.statusCode = 204
		res.end()
		return
	}

	return next()
}

async function parseBody(req) {
	// AuthServer may already parse the body
	if (req.body && typeof req.body === 'object') return req.body

	const buffers = []
	for await (const chunk of req) {
		buffers.push(chunk)
	}
	const raw = Buffer.concat(buffers).toString()
	if (!raw) return {}
	try {
		return JSON.parse(raw)
	} catch {
		return {}
	}
}

// ─── Cerebras AI (SSE Streaming) ────────────────────────────────────

/**
 * Stream Cerebras response via SSE
 * @param {Array} messages - [{role, content}]
 * @param {import('node:http').ServerResponse} res - HTTP response (SSE)
 * @returns {Promise<string>} - full response text
 */
async function cerebrasStream(messages, res) {
	if (!CEREBRAS_API_KEY) {
		const fallback =
			'⚠️ AI модуль не налаштований (CEREBRAS_API_KEY не встановлено)'
		res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`)
		res.write('data: [DONE]\n\n')
		return fallback
	}

	for (const model of FALLBACK_MODELS) {
		try {
			const response = await fetch(CEREBRAS_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${CEREBRAS_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model,
					messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
					stream: true,
					max_tokens: 1024,
					temperature: 0.7,
				}),
			})

			if (response.status === 429 || response.status === 402) {
				console.warn(`[AI] ${response.status} on ${model}, trying fallback...`)
				continue
			}

			if (!response.ok) {
				const errText = await response.text()
				throw new Error(`API ${response.status}: ${errText}`)
			}

			// Stream tokens to client via SSE
			const reader = response.body.getReader()
			const decoder = new TextDecoder()
			let fullText = ''

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				const chunk = decoder.decode(value, { stream: true })
				const lines = chunk.split('\n')

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const dataStr = line.slice(6)
						if (dataStr === '[DONE]') break

						try {
							const data = JSON.parse(dataStr)
							const token = data.choices?.[0]?.delta?.content || ''
							if (token) {
								fullText += token
								res.write(`data: ${JSON.stringify({ text: token })}\n\n`)
							}
						} catch {
							// incomplete chunk, skip
						}
					}
				}
			}

			res.write('data: [DONE]\n\n')
			return fullText
		} catch (err) {
			console.error(`[AI] Error with ${model}:`, err.message)
		}
	}

	const fallback = '☀️ Всі моделі тимчасово недоступні. Спробуйте пізніше.'
	res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`)
	res.write('data: [DONE]\n\n')
	return fallback
}

// ─── Email Templates ────────────────────────────────────────────────

function verificationEmailHTML(username, code) {
	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050a14;font-family:'Inter',system-ui,sans-serif">
<div style="max-width:480px;margin:40px auto;padding:40px 32px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:24px">
  <div style="text-align:center;font-size:48px;margin-bottom:16px">☀️</div>
  <h1 style="color:#fff;text-align:center;font-size:24px;margin:0 0 8px">Суперінтелект.Активація</h1>
  <p style="color:rgba(255,255,255,0.6);text-align:center;margin:0 0 32px;font-size:14px">Підтвердження реєстрації</p>

  <p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6">
    Вітаю, <strong style="color:#FDF200">${username}</strong>! 🎉
  </p>
  <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6">
    Ваш код верифікації:
  </p>

  <div style="text-align:center;margin:24px 0">
    <div style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#FDF200,#f0c800);border-radius:14px;font-size:32px;font-weight:800;letter-spacing:0.15em;color:#000">
      ${code}
    </div>
  </div>

  <p style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;line-height:1.5">
    Введіть цей код на сторінці реєстрації.<br>
    Код дійсний протягом 30 хвилин.
  </p>

  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0">
  <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center">
    nan0web platform · willni.com
  </p>
</div>
</body>
</html>`
}

function welcomeEmailHTML(username) {
	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050a14;font-family:'Inter',system-ui,sans-serif">
<div style="max-width:480px;margin:40px auto;padding:40px 32px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:24px">
  <div style="text-align:center;font-size:48px;margin-bottom:16px">🎉</div>
  <h1 style="color:#fff;text-align:center;font-size:24px;margin:0 0 24px">Ласкаво просимо!</h1>

  <p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6">
    <strong style="color:#FDF200">${username}</strong>, ваш акаунт активований.
  </p>
  <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6">
    Ви тепер учасник курсу «Суперінтелект.Активація» — першого асинхронного курсу трансформації.
  </p>

  <div style="text-align:center;margin:28px 0">
    <a href="https://willni.com/superintellect/series_1"
       style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FDF200,#f0c800);border-radius:14px;color:#000;font-weight:700;text-decoration:none;font-size:16px">
      Почати Серію 1 ☀️
    </a>
  </div>

  <p style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;line-height:1.5">
    «Все має відбуватись ПОВОЛІ, бо мИ живемо ПО ВОЛІ»
  </p>

  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0">
  <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center">
    nan0web platform · willni.com
  </p>
</div>
</body>
</html>`
}

// ─── Create AuthServer ──────────────────────────────────────────────
const server = new AuthServer({
	port: PORT,
	host: '0.0.0.0',
	db: { cwd: DATA_DIR },
	logger: console,
})

server.use(cors)

// ─── AI Chat Endpoint (SSE Streaming) ───────────────────────────────
server.post('/api/chat', async (req, res) => {
	const body = await parseBody(req)
	const sessionId = body.sessionId || 'anon'

	// Get existing conversation or start fresh
	const history = getConversation(sessionId)

	// Convert from widget format [{role, text}] to API format [{role, content}]
	const lastUserMsg = (body.messages || [])
		.filter((m) => m.role === 'user')
		.pop()

	if (lastUserMsg) {
		history.push({
			role: 'user',
			content: lastUserMsg.text || lastUserMsg.content || '',
		})
	}

	// SSE headers
	res.statusCode = 200
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Connection', 'keep-alive')

	// Stream AI response
	const fullResponse = await cerebrasStream(history, res)

	// Save to history
	history.push({ role: 'assistant', content: fullResponse })
	saveConversation(sessionId, history)

	res.end()
})

// ─── Payment Reporting ──────────────────────────────────────────────
server.post('/api/report-payment', async (req, res) => {
	const body = await parseBody(req)
	const { method, hash, username } = body

	if (!hash || !username) {
		res.statusCode = 400
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Missing hash or username' }))
		return
	}

	const message = `💰 [PAYMENT REPORT]\nUser: ${username}\nMethod: ${method}\nHash: ${hash}\nTime: ${new Date().toISOString()}`
	console.log(message)

	// TODO: Integration with Telegram Bot API
	// if (process.env.TELEGRAM_BOT_TOKEN) { ... }

	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json')
	res.end(JSON.stringify({ success: true }))
})

// ─── Email Verification ─────────────────────────────────────────────
server.post('/api/send-verification', async (req, res) => {
	const body = await parseBody(req)
	const { email, username, code } = body

	if (!email || !username || !code) {
		res.statusCode = 400
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Missing email, username, or code' }))
		return
	}

	if (!mailer) {
		// No SMTP configured — log code to console (dev mode)
		console.log(
			`📧 [DEV] Verification code for ${username} (${email}): ${code}`,
		)
		res.statusCode = 200
		res.setHeader('Content-Type', 'application/json')
		res.end(
			JSON.stringify({
				sent: false,
				dev: true,
				message: 'SMTP not configured, code logged to console',
			}),
		)
		return
	}

	try {
		await mailer.sendMail({
			from: SMTP_FROM,
			to: email,
			subject: `☀️ Код верифікації — Суперінтелект.Активація`,
			html: verificationEmailHTML(username, code),
		})

		res.statusCode = 200
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ sent: true }))
	} catch (err) {
		console.error('[Email] Error:', err.message)
		res.statusCode = 500
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Failed to send email' }))
	}
})

server.post('/api/send-welcome', async (req, res) => {
	const body = await parseBody(req)
	const { email, username } = body

	if (!email || !username) {
		res.statusCode = 400
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Missing email or username' }))
		return
	}

	if (!mailer) {
		console.log(
			`📧 [DEV] Welcome email for ${username} (${email}) — skipped (no SMTP)`,
		)
		res.statusCode = 200
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ sent: false, dev: true }))
		return
	}

	try {
		await mailer.sendMail({
			from: SMTP_FROM,
			to: email,
			subject: `🎉 Ласкаво просимо — Суперінтелект.Активація`,
			html: welcomeEmailHTML(username),
		})

		res.statusCode = 200
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ sent: true }))
	} catch (err) {
		console.error('[Email] Error:', err.message)
		res.statusCode = 500
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Failed to send email' }))
	}
})

// ─── Health check ───────────────────────────────────────────────────
server.get('/health', async (req, res) => {
	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json')
	res.end(
		JSON.stringify({
			status: 'ok',
			platform: 'nan0web',
			ai: CEREBRAS_API_KEY ? 'configured' : 'missing_key',
			email: mailer ? 'configured' : 'dev_mode',
			conversations: conversations.size,
			uptime: process.uptime(),
		}),
	)
})

// ─── Content API (Phase 8: nan0web Native Frontend) ─────────────────
import { readFileSync, existsSync } from 'node:fs'

const CONTENT_DIR = resolve(__dirname, '..', 'data', 'content')

server.get('/api/content', async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`)
	const contentPath = url.searchParams.get('path')

	if (!contentPath) {
		res.statusCode = 400
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Missing ?path= parameter' }))
		return
	}

	// Security: prevent path traversal
	const safe = contentPath.replace(/\.\./g, '').replace(/^\/+/, '')
	const jsonPath = resolve(CONTENT_DIR, safe + '.json')

	if (!jsonPath.startsWith(CONTENT_DIR) || !existsSync(jsonPath)) {
		res.statusCode = 404
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Not found' }))
		return
	}

	try {
		const content = readFileSync(jsonPath, 'utf-8')
		res.statusCode = 200
		res.setHeader('Content-Type', 'application/json')
		res.setHeader('Cache-Control', 'public, max-age=300')
		res.end(content)
	} catch (err) {
		res.statusCode = 500
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ error: 'Read error' }))
	}
})

// ─── MeshBridge (UDP <-> WebSocket) ─────────────────────────────────

const wss = new WebSocketServer({ noServer: true })
const mesh = new MeshTransport({
	id: 'willni-hub',
})

// Broadcast Mesh messages to all WS clients
mesh.on('message', (raw) => {
	let msg = raw
	// Try to parse if it's a domain message
	try {
		msg = Message.fromMesh(raw)
		// Check for specific sub-types (Case, SOS, etc.)
		if (msg.type === 'soscase') {
			msg.data = SOScase.fromMesh(raw).body
		}
	} catch (e) {}

	const data = JSON.stringify(msg)
	wss.clients.forEach((client) => {
		if (client.readyState === 1) {
			client.send(data)
		}
	})
})

mesh.listen().catch((err) => {
	console.error('⚠️ MeshTransport failure:', err.message)
})

// ─── Start ──────────────────────────────────────────────────────────

process.on('unhandledRejection', (err) => {
	console.error('⚠️ Unhandled rejection (server stays alive):', err.message)
})
process.on('uncaughtException', (err) => {
	console.error('⚠️ Uncaught exception (server stays alive):', err.message)
})

try {
	await server.start()
	// Handle WebSocket upgrades
	server.server.on('upgrade', (request, socket, head) => {
		wss.handleUpgrade(request, socket, head, (ws) => {
			wss.emit('connection', ws, request)
		})
	})
	console.log(`🚀 willni API (nan0web): http://localhost:${server.port}`)
	console.log(`📂 Data: ${DATA_DIR}`)
	console.log(
		`🤖 AI: ${CEREBRAS_API_KEY ? 'Cerebras ✓' : '⚠️ CEREBRAS_API_KEY not set'}`,
	)
	console.log(`📧 Email: ${mailer ? 'SMTP ✓' : 'Dev mode (console)'}`)
} catch (err) {
	console.error('❌ Failed to start:', err)
	process.exit(1)
}
