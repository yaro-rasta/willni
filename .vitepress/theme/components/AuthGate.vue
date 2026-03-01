<template>
	<div v-if="ready">
		<!-- ═══ Authenticated ═══ -->
		<div v-if="auth.isAuthenticated.value" class="auth-content">
			<div class="auth-header">
				<div class="auth-badge">
					<span class="auth-badge-icon">🔓</span>
					<span class="auth-badge-text">{{ auth.currentUser.value?.username }}</span>
				</div>
				<button class="logout-btn" @click="handleLogout" :title="t.logoutTitle">
					{{ t.logoutBtn }}
				</button>
			</div>
			<slot />
		</div>

		<!-- ═══ Not Authenticated ═══ -->
		<div v-else class="auth-gate">
			<div class="auth-gate-bg"></div>
			<div class="auth-gate-card">
				<div class="auth-gate-icon">🔐</div>
				<h2 class="auth-gate-title">{{ t.title }}</h2>
				<p class="auth-gate-desc">
					{{ t.description }}
					<strong>{{ t.brand }}</strong>
				</p>

				<div class="auth-gate-form">
					<div v-if="error" class="auth-error">{{ error }}</div>

					<div class="auth-field">
						<label for="gate-username">{{ t.usernameLabel }}</label>
						<input
							id="gate-username"
							v-model="username"
							type="text"
							:placeholder="t.usernamePlaceholder"
							autocomplete="username"
							@keyup.enter="handleLogin"
						/>
					</div>

					<div class="auth-field">
						<label for="gate-password">{{ t.passwordLabel }}</label>
						<input
							id="gate-password"
							v-model="password"
							type="password"
							:placeholder="t.passwordPlaceholder"
							autocomplete="current-password"
							@keyup.enter="handleLogin"
						/>
					</div>

					<button
						class="auth-btn"
						:disabled="loading"
						@click="handleLogin"
					>
						<span v-if="loading" class="auth-btn-text">{{ t.loginLoading }}</span>
						<span v-else class="auth-btn-text">{{ t.loginBtn }}</span>
						<span class="auth-btn-arrow">→</span>
					</button>
				</div>

				<div class="auth-gate-footer">
					<p>
						{{ t.noAccountText }}
						<a href="/willni/superintellect/registration">{{ t.registerLink }}</a>
					</p>
				</div>
			</div>

			<!-- Preview blur -->
			<div class="auth-preview">
				<slot />
			</div>
		</div>
	</div>

	<!-- Loading state -->
	<div v-else class="auth-loading">
		<div class="auth-loading-spinner"></div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import { auth } from '../auth.js'

const { lang } = useData()

const ready = ref(false)
const loading = ref(false)
const error = ref('')
const username = ref('')
const password = ref('')

// ─── i18n ───────────────────────────────────────────────────────────
const t = computed(() => {
	const en = lang.value === 'en-US'
	return {
		title: en ? 'Protected Content' : 'Закритий Контент',
		description: en
			? 'This material is available only to members of'
			: 'Цей матеріал доступний лише учасникам',
		brand: 'Суперінтелект.Активація',
		usernameLabel: en ? 'Username' : "Ім'я користувача",
		usernamePlaceholder: en ? 'Your username' : 'Ваш логін',
		passwordLabel: en ? 'Password' : 'Пароль',
		passwordPlaceholder: en ? 'Your password' : 'Ваш пароль',
		loginBtn: en ? 'Unlock Access' : 'Активувати Доступ',
		loginLoading: en ? 'Verifying...' : 'Перевірка...',
		noAccountText: en ? "No account?" : 'Немає акаунту?',
		registerLink: en ? 'Register here' : 'Зареєструйся тут',
		logoutBtn: en ? 'Sign out' : 'Вийти',
		logoutTitle: en ? 'Sign out of account' : 'Вийти з акаунту',
	}
})

// ─── Init ───────────────────────────────────────────────────────────
onMounted(async () => {
	await auth.init()
	ready.value = true
})

// ─── Actions ────────────────────────────────────────────────────────
async function handleLogin() {
	error.value = ''

	if (!username.value.trim() || !password.value) {
		error.value = lang.value === 'en-US'
			? 'Please fill in all fields'
			: 'Заповніть усі поля'
		return
	}

	loading.value = true
	try {
		await auth.signin(username.value.trim(), password.value)
	} catch (err) {
		error.value = err.message || 'Authentication failed'
	} finally {
		loading.value = false
	}
}

async function handleLogout() {
	await auth.signout()
}
</script>

<style scoped>
.auth-gate {
	position: relative;
	min-height: 60vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
}

.auth-gate-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background:
		radial-gradient(circle at 30% 20%, rgba(253, 242, 0, 0.05), transparent 50%),
		radial-gradient(circle at 70% 80%, rgba(0, 153, 255, 0.05), transparent 50%);
	z-index: 0;
}

.auth-gate-card {
	position: relative;
	z-index: 2;
	max-width: 440px;
	width: 100%;
	background: rgba(255, 255, 255, 0.03);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 24px;
	padding: 48px 40px;
	text-align: center;
}

.auth-gate-icon {
	font-size: 64px;
	margin-bottom: 16px;
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.1); }
}

.auth-gate-title {
	font-size: 28px;
	font-weight: 800;
	margin: 0 0 12px;
	background: linear-gradient(135deg, #fff 30%, #aaa 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.auth-gate-desc {
	color: rgba(255, 255, 255, 0.6);
	font-size: 15px;
	line-height: 1.6;
	margin: 0 0 32px;
}

.auth-gate-desc strong {
	color: #FDF200;
}

.auth-gate-form {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.auth-field {
	text-align: left;
}

.auth-field label {
	display: block;
	font-size: 13px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.5);
	margin-bottom: 6px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.auth-field input {
	width: 100%;
	padding: 14px 16px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: 12px;
	color: #fff;
	font-size: 16px;
	outline: none;
	transition: all 0.3s ease;
	box-sizing: border-box;
}

.auth-field input:focus {
	border-color: rgba(253, 242, 0, 0.5);
	background: rgba(255, 255, 255, 0.08);
	box-shadow: 0 0 20px rgba(253, 242, 0, 0.1);
}

.auth-field input::placeholder {
	color: rgba(255, 255, 255, 0.3);
}

.auth-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	width: 100%;
	padding: 16px;
	background: linear-gradient(135deg, #FDF200, #f0c800);
	border: none;
	border-radius: 14px;
	color: #000;
	font-size: 16px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.3s ease;
	margin-top: 8px;
}

.auth-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 10px 30px rgba(253, 242, 0, 0.3);
}

.auth-btn:active {
	transform: translateY(0);
}

.auth-btn:disabled {
	opacity: 0.7;
	cursor: wait;
	transform: none;
}

.auth-btn-arrow {
	font-size: 20px;
	transition: transform 0.3s ease;
}

.auth-btn:hover .auth-btn-arrow {
	transform: translateX(4px);
}

.auth-error {
	background: rgba(255, 60, 60, 0.1);
	border: 1px solid rgba(255, 60, 60, 0.3);
	border-radius: 10px;
	padding: 12px 16px;
	color: #ff6b6b;
	font-size: 14px;
}

.auth-gate-footer {
	margin-top: 24px;
	font-size: 14px;
	color: rgba(255, 255, 255, 0.4);
}

.auth-gate-footer a {
	color: #FDF200;
	text-decoration: none;
	font-weight: 600;
}

.auth-gate-footer a:hover {
	text-decoration: underline;
}

/* Preview blur */
.auth-preview {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
	filter: blur(8px);
	opacity: 0.15;
	pointer-events: none;
	overflow: hidden;
}

/* ─── Authenticated state ──────────────────────────────────────────── */
.auth-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
	flex-wrap: wrap;
	gap: 12px;
}

.auth-badge {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 16px;
	background: rgba(253, 242, 0, 0.1);
	border: 1px solid rgba(253, 242, 0, 0.2);
	border-radius: 20px;
	font-size: 13px;
	color: #FDF200;
}

.auth-badge-icon {
	font-size: 16px;
}

.auth-badge-text {
	font-weight: 600;
}

.logout-btn {
	padding: 6px 16px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 20px;
	color: rgba(255, 255, 255, 0.5);
	font-size: 13px;
	cursor: pointer;
	transition: all 0.25s ease;
}

.logout-btn:hover {
	background: rgba(255, 60, 60, 0.1);
	border-color: rgba(255, 60, 60, 0.3);
	color: #ff6b6b;
}

.auth-content {
	padding: 20px 0;
}

/* ─── Loading ──────────────────────────────────────────────────────── */
.auth-loading {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 40vh;
}

.auth-loading-spinner {
	width: 32px;
	height: 32px;
	border: 3px solid rgba(253, 242, 0, 0.2);
	border-top-color: #FDF200;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* ═══ Light Theme ══════════════════════════════════════════════════ */
:root:not(.dark) .auth-gate-card {
	background: rgba(0, 0, 0, 0.03);
	border-color: rgba(0, 0, 0, 0.1);
}

:root:not(.dark) .auth-gate-title {
	background: linear-gradient(135deg, #111 30%, #555 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

:root:not(.dark) .auth-field input {
	background: rgba(0, 0, 0, 0.03);
	border-color: rgba(0, 0, 0, 0.12);
	color: #111;
}

:root:not(.dark) .auth-field input:focus {
	border-color: rgba(184, 150, 10, 0.5);
	box-shadow: 0 0 16px rgba(184, 150, 10, 0.1);
}

:root:not(.dark) .auth-gate-desc {
	color: rgba(0, 0, 0, 0.6);
}

:root:not(.dark) .auth-gate-desc strong {
	color: #c4a700;
}

:root:not(.dark) .auth-field label {
	color: #666;
}

:root:not(.dark) .auth-field input::placeholder {
	color: #aaa;
}

:root:not(.dark) .auth-gate-footer {
	color: #888;
}

:root:not(.dark) .auth-gate-footer a {
	color: #b8960a;
}

:root:not(.dark) .logout-btn {
	background: rgba(0, 0, 0, 0.03);
	border-color: rgba(0, 0, 0, 0.1);
	color: #666;
}

:root:not(.dark) .logout-btn:hover {
	background: rgba(255, 60, 60, 0.08);
	border-color: rgba(255, 60, 60, 0.3);
	color: #d33;
}

:root:not(.dark) .auth-badge {
	background: rgba(184, 150, 10, 0.1);
	border-color: rgba(184, 150, 10, 0.2);
	color: #b8960a;
}

:root:not(.dark) .auth-loading-spinner {
	border-color: rgba(184, 150, 10, 0.2);
	border-top-color: #b8960a;
}
</style>
