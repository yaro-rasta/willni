<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const isOpen = ref(false)
const messages = ref([
	{ role: 'assistant', text: 'Вітаю! Я SunAI ☀️ Готовий допомогти з курсом "Суперінтелект".' }
])
const input = ref('')
const loading = ref(false)
const messagesContainer = ref(null)

// Session ID for conversation history
const sessionId = ref('')
onMounted(() => {
	sessionId.value = 'chat_' + Math.random().toString(36).slice(2, 10)
})

function toggleChat() {
	isOpen.value = !isOpen.value
	if (isOpen.value) {
		scrollToBottom()
		nextTick(() => {
			document.querySelector('.chat-input textarea')?.focus()
		})
	}
}

function scrollToBottom() {
	nextTick(() => {
		if (messagesContainer.value) {
			messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
		}
	})
}

async function sendMessage() {
	if (!input.value.trim() || loading.value) return

	const userText = input.value.trim()
	input.value = ''

	messages.value.push({ role: 'user', text: userText })
	scrollToBottom()

	loading.value = true

	// Add placeholder for streaming response
	const assistantIdx = messages.value.length
	messages.value.push({ role: 'assistant', text: '' })

	try {
		const res = await fetch(`${API_URL}/api/chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId: sessionId.value,
				messages: [{ role: 'user', text: userText }],
			}),
		})

		if (!res.ok) throw new Error('Network error')

		// Read SSE stream
		const reader = res.body.getReader()
		const decoder = new TextDecoder()

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
						if (data.text) {
							messages.value[assistantIdx].text += data.text
							scrollToBottom()
						}
					} catch {
						// incomplete chunk
					}
				}
			}
		}

		// If no text received, show fallback
		if (!messages.value[assistantIdx].text) {
			messages.value[assistantIdx].text = '...'
		}
	} catch {
		messages.value[assistantIdx].text = "З'єднання перервано. Спробуйте пізніше. ☀️"
	} finally {
		loading.value = false
		scrollToBottom()
	}
}

watch(messages, scrollToBottom, { deep: true })
</script>

<template>
	<div class="chat-widget" :class="{ open: isOpen }">
		<!-- Toggle Button -->
		<button class="chat-toggle" @click="toggleChat" :title="isOpen ? 'Close chat' : 'Open AI Assistant'">
			<span v-if="!isOpen" class="icon-sun">☀️</span>
			<span v-else class="icon-close">×</span>
		</button>

		<!-- Chat Window -->
		<div class="chat-window" v-if="isOpen">
			<div class="chat-header">
				<div class="header-info">
					<span class="status-dot"></span>
					<span class="title">SunIntelligence</span>
				</div>
				<span class="beta-badge">BETA</span>
			</div>

			<div class="chat-messages" ref="messagesContainer">
				<div
					v-for="(msg, i) in messages"
					:key="i"
					class="message"
					:class="msg.role"
				>
					<div class="avatar" v-if="msg.role === 'assistant'">☀️</div>
					<div class="bubble">
						{{ msg.text }}
						<span v-if="loading && i === messages.length - 1 && msg.role === 'assistant'" class="cursor-blink">▊</span>
					</div>
				</div>

				<div v-if="loading && messages[messages.length - 1]?.text === ''" class="message assistant loading-msg">
					<div class="avatar">☀️</div>
					<div class="bubble typing">
						<span>.</span><span>.</span><span>.</span>
					</div>
				</div>
			</div>

			<div class="chat-input">
				<textarea
					v-model="input"
					@keydown.enter.exact.prevent="sendMessage"
					placeholder="Запитай щось про курс..."
					rows="1"
					:disabled="loading"
				></textarea>
				<button class="send-btn" @click="sendMessage" :disabled="!input.trim() || loading">
					↑
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.chat-widget {
	position: fixed;
	bottom: 24px;
	right: 24px;
	z-index: 1000;
	font-family: 'Inter', sans-serif;
}

/* ─── Toggle Button ─── */
.chat-toggle {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	background: linear-gradient(135deg, #FDF200, #ffae00);
	border: none;
	box-shadow: 0 8px 24px rgba(253, 242, 0, 0.4);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28px;
	transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	position: absolute;
	bottom: 0;
	right: 0;
	z-index: 2;
}

.chat-toggle:hover {
	transform: scale(1.1) rotate(10deg);
	box-shadow: 0 12px 32px rgba(253, 242, 0, 0.6);
}

.chat-widget.open .chat-toggle {
	background: #333;
	color: #fff;
	box-shadow: 0 4px 12px rgba(0,0,0,0.2);
	transform: rotate(90deg);
}

.icon-close {
	font-size: 32px;
	line-height: 1;
	margin-top: -2px;
}

/* ─── Chat Window ─── */
.chat-window {
	position: absolute;
	bottom: 72px;
	right: 0;
	width: 380px;
	height: 520px;
	background: rgba(25, 25, 35, 0.95);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 24px;
	box-shadow: 0 24px 80px rgba(0,0,0,0.5);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	transform-origin: bottom right;
	animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
	from { opacity: 0; transform: scale(0.8) translateY(20px); }
	to { opacity: 1; transform: scale(1) translateY(0); }
}

/* ─── Header ─── */
.chat-header {
	padding: 16px 20px;
	background: rgba(255, 255, 255, 0.03);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.header-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-dot {
	width: 8px;
	height: 8px;
	background: #42d392;
	border-radius: 50%;
	box-shadow: 0 0 8px #42d392;
}

.title {
	font-weight: 700;
	font-size: 15px;
	color: #fff;
}

.beta-badge {
	font-size: 10px;
	font-weight: 800;
	background: rgba(253, 242, 0, 0.15);
	color: #FDF200;
	padding: 2px 6px;
	border-radius: 4px;
	border: 1px solid rgba(253, 242, 0, 0.3);
}

/* ─── Messages ─── */
.chat-messages {
	flex: 1;
	overflow-y: auto;
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	scroll-behavior: smooth;
}

.message {
	display: flex;
	gap: 12px;
	max-width: 85%;
	animation: slideUp 0.3s ease;
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
}

.message.user {
	align-self: flex-end;
	flex-direction: row-reverse;
}

.avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: rgba(253, 242, 0, 0.1);
	border: 1px solid rgba(253, 242, 0, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	flex-shrink: 0;
}

.bubble {
	padding: 12px 16px;
	border-radius: 18px;
	font-size: 14px;
	line-height: 1.5;
	word-wrap: break-word;
	white-space: pre-wrap;
}

.message.assistant .bubble {
	background: rgba(255, 255, 255, 0.05);
	color: #e0e0e0;
	border-top-left-radius: 4px;
}

.message.user .bubble {
	background: linear-gradient(135deg, #42d392, #39b17c);
	color: #000;
	font-weight: 500;
	border-bottom-right-radius: 4px;
}

/* Streaming cursor */
.cursor-blink {
	animation: blink-cursor 0.8s step-end infinite;
	color: #FDF200;
	font-size: 12px;
	margin-left: 2px;
}

@keyframes blink-cursor {
	0%, 100% { opacity: 1; }
	50% { opacity: 0; }
}

/* Typing animation */
.typing {
	display: flex;
	gap: 4px;
	padding: 16px !important;
}

.typing span {
	width: 4px;
	height: 4px;
	background: rgba(255, 255, 255, 0.5);
	border-radius: 50%;
	animation: dot-blink 1.4s infinite both;
}

.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-blink {
	0%, 80%, 100% { opacity: 0; transform: scale(0.8); }
	40% { opacity: 1; transform: scale(1.2); }
}

/* ─── Input ─── */
.chat-input {
	padding: 16px;
	background: rgba(0, 0, 0, 0.2);
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	gap: 10px;
	align-items: flex-end;
}

.chat-input textarea {
	flex: 1;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 12px;
	color: #fff;
	font-size: 14px;
	resize: none;
	outline: none;
	transition: border-color 0.2s;
	max-height: 100px;
}

.chat-input textarea:focus {
	border-color: rgba(253, 242, 0, 0.4);
}

.send-btn {
	width: 40px;
	height: 40px;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	color: #fff;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 900;
}

.send-btn:hover:not(:disabled) {
	background: #FDF200;
	color: #000;
	border-color: #FDF200;
}

.send-btn:disabled {
	opacity: 0.5;
	cursor: default;
}

/* ─── Mobile ─── */
@media (max-width: 480px) {
	.chat-window {
		width: calc(100vw - 32px);
		height: calc(100vh - 120px);
		right: -8px;
		bottom: 68px;
	}
}

/* ─── Light Mode ─── */
:root:not(.dark) .chat-window {
	background: rgba(255, 255, 255, 0.95);
	border-color: rgba(0, 0, 0, 0.1);
	box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15);
}

:root:not(.dark) .chat-header {
	background: rgba(0, 0, 0, 0.02);
	border-bottom-color: rgba(0, 0, 0, 0.06);
}

:root:not(.dark) .title {
	color: #1a1a2e;
}

:root:not(.dark) .message.assistant .bubble {
	background: rgba(0, 0, 0, 0.05);
	color: #333;
}

:root:not(.dark) .cursor-blink {
	color: #b8960a;
}

:root:not(.dark) .chat-input {
	background: rgba(0, 0, 0, 0.02);
	border-top-color: rgba(0, 0, 0, 0.06);
}

:root:not(.dark) .chat-input textarea {
	background: #fff;
	border-color: rgba(0, 0, 0, 0.1);
	color: #1a1a2e;
}

:root:not(.dark) .send-btn {
	background: rgba(0, 0, 0, 0.05);
	border-color: rgba(0, 0, 0, 0.1);
	color: #333;
}
</style>
