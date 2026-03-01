<script setup>
import { ref, computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { auth } from '../auth.js'

const { lang } = useData()

// ─── State ──────────────────────────────────────────────────────────
const loading = ref(false)
const error = ref('')
const username = ref('')
const password = ref('')

// ─── i18n ───────────────────────────────────────────────────────────
const t = computed(() => {
	const en = lang.value === 'en-US'
	return {
		title: en ? 'Sign In' : 'Увійти',
		subtitle: en ? 'Welcome back' : 'З поверненням',
		usernameLabel: en ? 'Username' : "Ім'я користувача",
		usernamePlaceholder: en ? 'Your username' : 'Ваш логін',
		passwordLabel: en ? 'Password' : 'Пароль',
		passwordPlaceholder: en ? 'Your password' : 'Ваш пароль',
		loginBtn: en ? 'Enter ☀️' : 'Увійти ☀️',
		loginLoading: en ? 'Signing in...' : 'Вхід...',
		forgotLink: en ? 'Forgot password?' : 'Забули пароль?',
		noAccountText: en ? "Don't have an account?" : 'Немає акаунту?',
		registerLink: en ? 'Register' : 'Зареєструватися',
	}
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
		// Redirect to course content
		window.location.href = withBase('/superintellect/series_1')
	} catch (err) {
		error.value = err.message || 'Login failed'
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div class="login-wrapper">
		<div class="login-container">
			<form class="glass-form" @submit.prevent="handleLogin">
				<div class="login-icon">☀️</div>
				<h2 class="form-title">{{ t.title }}</h2>
				<p class="form-subtitle">{{ t.subtitle }}</p>

				<div v-if="error" class="form-error">{{ error }}</div>

				<div class="form-field">
					<label for="login-username">{{ t.usernameLabel }}</label>
					<input
						id="login-username"
						v-model="username"
						type="text"
						:placeholder="t.usernamePlaceholder"
						required
						autocomplete="username"
						@keyup.enter="handleLogin"
					/>
				</div>

				<div class="form-field">
					<label for="login-password">{{ t.passwordLabel }}</label>
					<input
						id="login-password"
						v-model="password"
						type="password"
						:placeholder="t.passwordPlaceholder"
						required
						autocomplete="current-password"
						@keyup.enter="handleLogin"
					/>
				</div>

				<button type="submit" class="submit-btn" :disabled="loading">
					<span v-if="loading">{{ t.loginLoading }}</span>
					<span v-else>{{ t.loginBtn }}</span>
				</button>

				<div class="form-links">
					<a href="/willni/superintellect/forgot" class="forgot-link">
						{{ t.forgotLink }}
					</a>
				</div>

				<p class="form-footer">
					{{ t.noAccountText }}
					<a href="/willni/superintellect/registration">{{ t.registerLink }}</a>
				</p>
			</form>
		</div>
	</div>
</template>

<style scoped>
*,
*::before,
*::after {
	box-sizing: border-box;
}

.login-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	min-height: 60vh;
	padding: 40px 20px;
}

.login-container {
	width: 100%;
	max-width: 440px;
	font-family: 'Inter', system-ui, sans-serif;
}

/* ─── Glass Form ───────────────────────────────────────────────────── */
.glass-form {
	background: rgba(255, 255, 255, 0.03);
	backdrop-filter: blur(24px);
	-webkit-backdrop-filter: blur(24px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 24px;
	padding: 48px 36px;
	box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
	text-align: center;
}

.login-icon {
	font-size: 56px;
	margin-bottom: 12px;
	animation: pulse 2.5s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.08); }
}

.form-title {
	margin: 0 0 4px;
	font-size: 1.75em;
	font-weight: 800;
	background: linear-gradient(135deg, #fff 30%, #aaa 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	line-height: 1.2;
}

.form-subtitle {
	margin: 0 0 28px;
	font-size: 0.95em;
	color: rgba(255, 255, 255, 0.5);
}

/* ─── Fields ───────────────────────────────────────────────────────── */
.form-field {
	margin-bottom: 16px;
	text-align: left;
}

.form-field label {
	display: block;
	margin-bottom: 6px;
	font-size: 0.82em;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.5);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.form-field input {
	width: 100%;
	padding: 14px 16px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	color: #fff;
	font-size: 16px;
	outline: none;
	transition: all 0.3s ease;
}

.form-field input:focus {
	border-color: rgba(253, 242, 0, 0.5);
	background: rgba(255, 255, 255, 0.08);
	box-shadow: 0 0 20px rgba(253, 242, 0, 0.1);
}

.form-field input::placeholder {
	color: rgba(255, 255, 255, 0.25);
}

/* ─── Error ────────────────────────────────────────────────────────── */
.form-error {
	background: rgba(255, 60, 60, 0.1);
	border: 1px solid rgba(255, 60, 60, 0.25);
	border-radius: 10px;
	padding: 12px 16px;
	color: #ff6b6b;
	font-size: 0.88em;
	margin-bottom: 16px;
}

/* ─── Submit ───────────────────────────────────────────────────────── */
.submit-btn {
	width: 100%;
	padding: 15px;
	background: linear-gradient(135deg, #FDF200, #f0c800);
	border: none;
	border-radius: 14px;
	color: #000;
	font-weight: 700;
	font-size: 1.05em;
	cursor: pointer;
	transition: all 0.3s ease;
	margin-top: 8px;
}

.submit-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 10px 30px rgba(253, 242, 0, 0.3);
}

.submit-btn:active {
	transform: translateY(0);
}

.submit-btn:disabled {
	opacity: 0.7;
	cursor: wait;
	transform: none;
}

/* ─── Links ────────────────────────────────────────────────────────── */
.form-links {
	margin-top: 16px;
}

.forgot-link {
	color: rgba(255, 255, 255, 0.4);
	text-decoration: none;
	font-size: 0.85em;
	transition: color 0.2s;
}

.forgot-link:hover {
	color: #FDF200;
}

.form-footer {
	margin-top: 24px;
	font-size: 0.88em;
	color: rgba(255, 255, 255, 0.4);
}

.form-footer a {
	color: #FDF200;
	text-decoration: none;
	font-weight: 600;
}

.form-footer a:hover {
	text-decoration: underline;
}

/* ═══ Light Theme ══════════════════════════════════════════════════ */
:root:not(.dark) .glass-form {
	background: rgba(255, 255, 255, 0.92);
	border-color: rgba(0, 0, 0, 0.08);
	box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
}

:root:not(.dark) .form-title {
	background: linear-gradient(135deg, #111 30%, #555 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

:root:not(.dark) .form-subtitle {
	color: #666;
}

:root:not(.dark) .form-field label {
	color: #666;
}

:root:not(.dark) .form-field input {
	background: rgba(0, 0, 0, 0.03);
	border-color: rgba(0, 0, 0, 0.1);
	color: #1a1a2e;
}

:root:not(.dark) .form-field input::placeholder {
	color: #aaa;
}

:root:not(.dark) .form-field input:focus {
	border-color: rgba(184, 150, 10, 0.5);
	box-shadow: 0 0 16px rgba(184, 150, 10, 0.1);
}

:root:not(.dark) .submit-btn {
	background: linear-gradient(135deg, #FDF200, #e8b800);
	color: #111;
}

:root:not(.dark) .forgot-link {
	color: #888;
}

:root:not(.dark) .forgot-link:hover {
	color: #b8960a;
}

:root:not(.dark) .form-footer {
	color: #888;
}

:root:not(.dark) .form-footer a {
	color: #b8960a;
}
</style>
