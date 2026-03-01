<script setup>
import { reactive, ref, computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { auth } from '../auth.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const { lang } = useData()

// ─── State ──────────────────────────────────────────────────────────
const step = ref('register') // register | confirm | success
const loading = ref(false)
const error = ref('')
const fieldErrors = reactive({
	username: '',
	email: '',
	password: '',
	passwordConfirm: '',
	manifesto: '',
})

function clearFieldError(field) {
	fieldErrors[field] = ''
	// Also clear general error when user starts typing
	if (error.value) error.value = ''
}

const form = reactive({
	username: '',
	email: '',
	password: '',
	passwordConfirm: '',
	level: 'free',
	manifestoAgreed: false,
})

const confirmCode = ref('')

// ─── i18n ───────────────────────────────────────────────────────────
const t = computed(() => {
	const en = lang.value === 'en-US'
	return {
		title: en ? 'Superintellect.Activation' : 'Суперінтелект.Активація',
		subtitle: en ? 'Join the pilot group' : 'Приєднуйся до пілотної групи',
		description: en
			? 'First asynchronous transformation course'
			: 'Перший асинхронний курс трансформації',

		// Tiers
		freeTitle: 'Free',
		freeDesc: en ? 'Course + sun.app (free)' : 'Курс + sun.app (безкоштовно)',
		subTitle: 'Sub ($99)',
		subDesc: en ? 'Community + Achievement Chat' : 'Спільнота + Чат Досягнень',
		vipTitle: 'VIP (1 BTC)',
		vipDesc: en ? 'Personal transformation with architect(s)' : 'Персональна трансформація з архітектором(и)',

		// Form labels
		usernameLabel: en ? 'Username' : "Ім'я користувача",
		usernamePlaceholder: en ? 'Your unique username' : 'Ваш унікальний логін',
		emailLabel: 'Email',
		emailPlaceholder: 'you@email.com',
		passwordLabel: en ? 'Password' : 'Пароль',
		passwordPlaceholder: en ? 'Minimum 6 characters' : 'Мінімум 6 символів',
		passwordConfirmLabel: en ? 'Confirm Password' : 'Підтвердити Пароль',
		passwordConfirmPlaceholder: en ? 'Repeat password' : 'Повторіть пароль',
		levelLabel: en ? 'Participation Level' : 'Рівень Участі',

		// Manifesto
		manifestoText: en ? 'I accept the' : 'Я приймаю',
		manifestoLink: en ? 'Natural Law Manifesto' : 'Маніфест Природного Права',
		lawPath: withBase(en ? '/en/law' : '/law'),

		// Buttons
		registerBtn: en ? 'Create Account ☀️' : 'Створити Акаунт ☀️',
		registerLoading: en ? 'Creating...' : 'Створення...',

		// Confirm step
		confirmTitle: en ? 'Check your email' : 'Перевірте пошту',
		confirmDesc: en
			? 'We sent a verification code to your email.'
			: 'Ми надіслали код верифікації на вашу пошту.',
		codeLabel: en ? 'Verification Code' : 'Код Верифікації',
		codePlaceholder: en ? 'Enter 6-digit code' : 'Введіть 6-значний код',
		confirmBtn: en ? 'Verify & Enter ✓' : 'Підтвердити ✓',
		confirmLoading: en ? 'Verifying...' : 'Перевірка...',

		// Success
		successTitle: en ? '🎉 Welcome aboard!' : '🎉 Ласкаво просимо!',
		successMsg: en
			? 'Your account is active. Start exploring the course.'
			: 'Ваш акаунт активний. Починайте дослідження курсу.',
		seriesBtn: en ? 'Start Series 1 (free)' : 'Почати Серію 1 (безкоштовно)',

		// Links
		hasAccountText: en ? 'Already have an account?' : 'Вже маєте акаунт?',
		loginLink: en ? 'Sign In' : 'Увійти',
		orText: en ? 'or' : 'або',

		// Errors
		passwordMismatch: en ? 'Passwords do not match' : 'Паролі не збігаються',
		manifestoRequired: en ? 'Please accept the Manifesto' : 'Будь ласка, прийміть Маніфест',
		usernameInvalid: en
			? 'Username: 3-30 characters, latin letters, digits, or hyphens only'
			: "Ім'я користувача: 3-30 символів, лише латинські літери, цифри або дефіс",
	}
})

// ─── Actions ────────────────────────────────────────────────────────

function clearAllFieldErrors() {
	Object.keys(fieldErrors).forEach(k => fieldErrors[k] = '')
	error.value = ''
}

function validateFields() {
	clearAllFieldErrors()
	let valid = true

	// Username
	const usernameRe = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,28}[a-zA-Z0-9]$/
	if (!form.username.trim()) {
		fieldErrors.username = t.value.usernameRequired || "Обов'язкове поле"
		valid = false
	} else if (!usernameRe.test(form.username.trim())) {
		fieldErrors.username = t.value.usernameInvalid
		valid = false
	}

	// Email
	if (!form.email.trim()) {
		fieldErrors.email = t.value.emailRequired || "Обов'язкове поле"
		valid = false
	}

	// Password
	if (form.password.length < 6) {
		fieldErrors.password = t.value.passwordPlaceholder
		valid = false
	}

	// Password confirm
	if (form.password !== form.passwordConfirm) {
		fieldErrors.passwordConfirm = t.value.passwordMismatch
		valid = false
	}

	// Manifesto
	if (!form.manifestoAgreed) {
		fieldErrors.manifesto = t.value.manifestoRequired
		valid = false
	}

	return valid
}

// Map server errors to specific fields
const SERVER_ERROR_FIELDS = {
	'User already exists': 'username',
	'Invalid username format': 'username',
	'Invalid email format': 'email',
	'Password too short': 'password',
}

async function handleRegister() {
	if (!validateFields()) return

	loading.value = true
	try {
		const result = await auth.signup({
			username: form.username.trim(),
			email: form.email.trim(),
			password: form.password,
		})

		// Send verification email (fire & forget)
		if (result?.code) {
			fetch(`${API_URL}/api/send-verification`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: form.email.trim(),
					username: form.username.trim(),
					code: result.code,
				}),
			}).catch(() => {})
		}

		step.value = 'confirm'
	} catch (err) {
		const msg = err.message || 'Registration failed'
		const field = SERVER_ERROR_FIELDS[msg]
		if (field) {
			fieldErrors[field] = translateError(msg)
		} else {
			error.value = translateError(msg)
		}
	} finally {
		loading.value = false
	}
}

async function handleConfirm() {
	error.value = ''
	loading.value = true

	try {
		await auth.confirmSignup(form.username.trim(), confirmCode.value.trim())
		// Auto-login after confirmation
		await auth.signin(form.username.trim(), form.password)

		// Send welcome email (fire & forget)
		fetch(`${API_URL}/api/send-welcome`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: form.email.trim(),
				username: form.username.trim(),
			}),
		}).catch(() => {})

		step.value = 'success'
	} catch (err) {
		error.value = translateError(err.message) || 'Verification failed'
	} finally {
		loading.value = false
	}
}

const ERROR_MAP = {
	'User already exists': 'Користувач з таким іменем вже існує',
	'Invalid username format': "Невірний формат ім'я користувача",
	'Invalid email format': 'Невірний формат email',
	'Password too short': 'Пароль занадто короткий',
	'Invalid verification code': 'Невірний код верифікації',
	'User not found': 'Користувача не знайдено',
	'Invalid password': 'Невірний пароль',
	'Server is not responding. Check that the API server is running.':
		'Сервер не відповідає. Перевірте, чи запущений API сервер.',
}

function translateError(msg) {
	if (!msg) return msg
	const en = lang.value === 'en-US'
	if (en) return msg
	return ERROR_MAP[msg] || msg
}

function navigateTo(path) {
	window.location.href = withBase(path)
}
</script>

<template>
	<div class="reg-wrapper">
		<div class="reg-container">

			<!-- ═══ Step 1: Registration Form ═══ -->
			<form
				v-if="step === 'register'"
				class="glass-form"
				@submit.prevent="handleRegister"
			>
				<h2 class="form-title">{{ t.title }}</h2>
				<p class="form-subtitle">{{ t.subtitle }}</p>
				<p class="form-description">{{ t.description }}</p>

				<!-- Tiers -->
				<div class="tiers">
					<label class="tier-card" :class="{ active: form.level === 'free' }">
						<input type="radio" v-model="form.level" value="free" />
						<span class="tier-name">{{ t.freeTitle }}</span>
						<span class="tier-desc">{{ t.freeDesc }}</span>
					</label>
					<label class="tier-card" :class="{ active: form.level === 'subscription' }">
						<input type="radio" v-model="form.level" value="subscription" />
						<span class="tier-name">{{ t.subTitle }}</span>
						<span class="tier-desc">{{ t.subDesc }}</span>
					</label>
					<label class="tier-card vip" :class="{ active: form.level === 'vip' }">
						<input type="radio" v-model="form.level" value="vip" />
						<span class="tier-name">{{ t.vipTitle }}</span>
						<span class="tier-desc">{{ t.vipDesc }}</span>
					</label>
				</div>

				<!-- Error -->
				<div v-if="error" class="form-error">{{ error }}</div>

				<!-- Fields -->
				<div class="form-field" :class="{ 'has-error': fieldErrors.username }">
					<label for="reg-username">{{ t.usernameLabel }}</label>
					<input
						id="reg-username"
						v-model="form.username"
						type="text"
						:placeholder="t.usernamePlaceholder"
						required
						autocomplete="username"
						pattern="[a-zA-Z0-9][a-zA-Z0-9_-]{1,28}[a-zA-Z0-9]"
						minlength="3"
						maxlength="30"
						@input="clearFieldError('username')"
					/>
					<span v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</span>
				</div>

				<div class="form-field" :class="{ 'has-error': fieldErrors.email }">
					<label for="reg-email">{{ t.emailLabel }}</label>
					<input
						id="reg-email"
						v-model="form.email"
						type="email"
						:placeholder="t.emailPlaceholder"
						required
						autocomplete="email"
						@input="clearFieldError('email')"
					/>
					<span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
				</div>

				<div class="form-field" :class="{ 'has-error': fieldErrors.password }">
					<label for="reg-password">{{ t.passwordLabel }}</label>
					<input
						id="reg-password"
						v-model="form.password"
						type="password"
						:placeholder="t.passwordPlaceholder"
						required
						minlength="6"
						autocomplete="new-password"
						@input="clearFieldError('password')"
					/>
					<span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
				</div>

				<div class="form-field" :class="{ 'has-error': fieldErrors.passwordConfirm }">
					<label for="reg-password-confirm">{{ t.passwordConfirmLabel }}</label>
					<input
						id="reg-password-confirm"
						v-model="form.passwordConfirm"
						type="password"
						:placeholder="t.passwordConfirmPlaceholder"
						required
						minlength="6"
						autocomplete="new-password"
						@input="clearFieldError('passwordConfirm')"
					/>
					<span v-if="fieldErrors.passwordConfirm" class="field-error">{{ fieldErrors.passwordConfirm }}</span>
				</div>

				<!-- Manifesto -->
				<div class="form-field checkbox-field">
					<label class="checkbox-label">
						<input v-model="form.manifestoAgreed" type="checkbox" required />
						<span>
							{{ t.manifestoText }}
							<a :href="t.lawPath" target="_blank">{{ t.manifestoLink }}</a>
						</span>
					</label>
				</div>

				<!-- Submit -->
				<button type="submit" class="submit-btn" :disabled="loading">
					<span v-if="loading" class="btn-loading">{{ t.registerLoading }}</span>
					<span v-else>{{ t.registerBtn }}</span>
				</button>

				<!-- Login link -->
				<p class="form-footer">
					{{ t.hasAccountText }}
					<a href="/willni/superintellect/login">{{ t.loginLink }}</a>
				</p>
			</form>

			<!-- ═══ Step 2: Confirm Code ═══ -->
			<form
				v-else-if="step === 'confirm'"
				class="glass-form confirm-form"
				@submit.prevent="handleConfirm"
			>
				<div class="confirm-icon">📨</div>
				<h2 class="form-title">{{ t.confirmTitle }}</h2>
				<p class="form-description">{{ t.confirmDesc }}</p>

				<div v-if="error" class="form-error">{{ error }}</div>

				<div class="form-field">
					<label for="confirm-code">{{ t.codeLabel }}</label>
					<input
						id="confirm-code"
						v-model="confirmCode"
						type="text"
						:placeholder="t.codePlaceholder"
						required
						autocomplete="one-time-code"
						class="code-input"
					/>
				</div>

				<button type="submit" class="submit-btn" :disabled="loading">
					<span v-if="loading">{{ t.confirmLoading }}</span>
					<span v-else>{{ t.confirmBtn }}</span>
				</button>
			</form>

			<!-- ═══ Step 3: Success ═══ -->
			<div v-else-if="step === 'success'" class="success-screen">
				<div class="icon-success">✨</div>
				<h2 class="form-title">{{ t.successTitle }}</h2>
				<p class="form-description">{{ t.successMsg }}</p>

				<div v-if="form.level !== 'free'" class="payment-nag">
					<p class="nag-text">Для активації рівня <strong>{{ form.level.toUpperCase() }}</strong> необхідно здійснити оплату.</p>
					<button class="submit-btn" @click="navigateTo('/superintellect/payment')">
						Оплатити та Активувати ⚡️
					</button>
				</div>
				<button v-else class="submit-btn" @click="navigateTo('/superintellect/series_1')">
					{{ t.seriesBtn }}
				</button>
			</div>

		</div>
	</div>
</template>

<style scoped>
*,
*::before,
*::after {
	box-sizing: border-box;
}

.reg-wrapper {
	display: flex;
	justify-content: center;
	width: 100%;
	padding: 20px;
}

.reg-container {
	width: 100%;
	max-width: 500px;
	font-family: 'Inter', system-ui, sans-serif;
}

/* ─── Glass Form ───────────────────────────────────────────────────── */
.glass-form {
	background: rgba(255, 255, 255, 0.03);
	backdrop-filter: blur(24px);
	-webkit-backdrop-filter: blur(24px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 24px;
	padding: 40px 32px;
	box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.form-title {
	text-align: center;
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
	text-align: center;
	margin: 0 0 4px;
	font-size: 0.95em;
	color: rgba(255, 255, 255, 0.6);
	font-weight: 600;
}

.form-description {
	text-align: center;
	margin: 0 0 28px;
	font-size: 0.9em;
	color: rgba(255, 255, 255, 0.45);
	line-height: 1.5;
}

/* ─── Tiers ────────────────────────────────────────────────────────── */
.tiers {
	display: grid;
	gap: 8px;
	margin-bottom: 24px;
}

.tier-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.25s ease;
	background: rgba(255, 255, 255, 0.02);
	position: relative;
}

.tier-card input {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}

.tier-card.active {
	border-color: rgba(100, 126, 255, 0.5);
	background: rgba(100, 126, 255, 0.08);
}

.tier-card.vip.active {
	border-color: rgba(255, 215, 0, 0.5);
	background: rgba(255, 215, 0, 0.06);
}

.tier-card:hover {
	background: rgba(255, 255, 255, 0.05);
}

.tier-name {
	font-weight: 700;
	font-size: 0.95em;
	color: rgba(255, 255, 255, 0.9);
}

.tier-desc {
	font-size: 0.8em;
	color: rgba(255, 255, 255, 0.45);
}

/* ─── Fields ───────────────────────────────────────────────────────── */
.form-field {
	margin-bottom: 16px;
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

.form-field input[type="text"],
.form-field input[type="email"],
.form-field input[type="password"] {
	width: 100%;
	padding: 13px 16px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	color: #fff;
	font-size: 16px;
	outline: none;
	transition: all 0.3s ease;
}

.form-field input:focus {
	border-color: rgba(100, 126, 255, 0.5);
	background: rgba(255, 255, 255, 0.08);
	box-shadow: 0 0 16px rgba(100, 126, 255, 0.15);
}

.form-field input::placeholder {
	color: rgba(255, 255, 255, 0.25);
}

/* ─── Checkbox ─────────────────────────────────────────────────────── */
.checkbox-field {
	margin-top: 4px;
}

.checkbox-label {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	cursor: pointer;
	font-size: 0.88em;
	line-height: 1.5;
	color: rgba(255, 255, 255, 0.6);
	font-weight: 400 !important;
	text-transform: none !important;
	letter-spacing: normal !important;
}

.checkbox-label input {
	margin-top: 4px;
	accent-color: #647eff;
}

.checkbox-label a {
	color: #FDF200;
	text-decoration: none;
	font-weight: 600;
}

.checkbox-label a:hover {
	text-decoration: underline;
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
	text-align: center;
}

/* Field-level errors */
.form-field.has-error input {
	border-color: rgba(255, 80, 80, 0.7) !important;
	box-shadow: 0 0 12px rgba(255, 80, 80, 0.2) !important;
	animation: shake 0.4s ease;
}

.form-field.has-error label {
	color: #ff6b6b !important;
}

.field-error {
	display: block;
	margin-top: 6px;
	font-size: 0.8em;
	color: #ff6b6b;
	line-height: 1.3;
	animation: fadeIn 0.3s ease;
}

@keyframes shake {
	0%, 100% { transform: translateX(0); }
	20% { transform: translateX(-6px); }
	40% { transform: translateX(6px); }
	60% { transform: translateX(-4px); }
	80% { transform: translateX(4px); }
}

@keyframes fadeIn {
	from { opacity: 0; transform: translateY(-4px); }
	to { opacity: 1; transform: translateY(0); }
}

/* ─── Submit ───────────────────────────────────────────────────────── */
.submit-btn {
	width: 100%;
	padding: 14px;
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

.btn-loading {
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

/* ─── Footer ───────────────────────────────────────────────────────── */
.form-footer {
	text-align: center;
	margin-top: 20px;
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

/* ─── Confirm Step ─────────────────────────────────────────────────── */
.confirm-form {
	text-align: center;
}

.confirm-icon {
	font-size: 64px;
	margin-bottom: 12px;
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-8px); }
}

.code-input {
	text-align: center;
	font-size: 24px !important;
	letter-spacing: 0.2em;
	font-weight: 700;
}

/* ─── Success ──────────────────────────────────────────────────────── */
.success-card {
	text-align: center;
}

.success-icon {
	font-size: 72px;
	margin-bottom: 12px;
	animation: float 3s ease-in-out infinite;
}

.success-user {
	margin: 20px 0;
}

.user-badge {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 20px;
	background: rgba(253, 242, 0, 0.1);
	border: 1px solid rgba(253, 242, 0, 0.2);
	border-radius: 20px;
	font-size: 0.9em;
	color: #FDF200;
	font-weight: 600;
}

.series-link {
	display: inline-block;
	margin-top: 16px;
	padding: 12px 28px;
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 12px;
	color: rgba(255, 255, 255, 0.85);
	text-decoration: none;
	font-weight: 600;
	transition: all 0.25s ease;
}

.series-link:hover {
	border-color: #FDF200;
	color: #FDF200;
	transform: translateY(-2px);
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

:root:not(.dark) .form-subtitle,
:root:not(.dark) .form-description {
	color: #666;
}

:root:not(.dark) .tier-card {
	background: rgba(0, 0, 0, 0.02);
	border-color: rgba(0, 0, 0, 0.08);
}

:root:not(.dark) .tier-name {
	color: #1a1a2e;
}

:root:not(.dark) .tier-desc {
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

:root:not(.dark) .checkbox-label {
	color: #444;
}

:root:not(.dark) .checkbox-label a {
	color: #b8960a;
}

:root:not(.dark) .form-footer {
	color: #888;
}

:root:not(.dark) .form-footer a {
	color: #b8960a;
}

:root:not(.dark) .submit-btn {
	background: linear-gradient(135deg, #FDF200, #e8b800);
	color: #111;
}

:root:not(.dark) .series-link {
	border-color: rgba(0, 0, 0, 0.15);
	color: #1a1a2e;
}

:root:not(.dark) .series-link:hover {
	border-color: #b8960a;
	color: #b8960a;
}

.payment-nag {
	margin-top: 24px;
	padding: 20px;
	background: rgba(253, 242, 0, 0.05);
	border: 1px dashed rgba(253, 242, 0, 0.3);
	border-radius: 16px;
	text-align: center;
}

.nag-text {
	font-size: 14px;
	color: var(--vp-c-text-2);
	margin-bottom: 16px;
}
</style>
