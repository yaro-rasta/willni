<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

// UTM tracking
const utmParams = ref({})
onMounted(() => {
	const params = new URLSearchParams(window.location.search)
	utmParams.value = {
		source: params.get('utm_source') || '',
		medium: params.get('utm_medium') || '',
		campaign: params.get('utm_campaign') || '',
	}
	// Store UTM for registration attribution
	if (utmParams.value.source) {
		sessionStorage.setItem('willni_utm', JSON.stringify(utmParams.value))
	}
})

function goRegister() {
	window.location.href = withBase('/superintellect/registration')
}

function goLogin() {
	window.location.href = withBase('/superintellect/login')
}
</script>

<template>
	<div class="landing">
		<!-- Hero -->
		<section class="hero">
			<div class="hero-glow"></div>
			<div class="hero-content">
				<div class="hero-badge">☀️ ПЕРШИЙ КУРС</div>
				<h1 class="hero-title">
					<span class="gradient-text">Суперінтелект</span>
					<span class="subtitle">.Активація</span>
				</h1>
				<p class="hero-desc">
					6-серійний асинхронний курс трансформації свідомості.
					<br>Від <em>волі</em> до <em>Волі</em>. ПОВОЛІ.
				</p>
				<div class="hero-cta">
					<button class="btn-primary" @click="goRegister">
						Почати безкоштовно ☀️
					</button>
					<button class="btn-ghost" @click="goLogin">
						Вже маю акаунт
					</button>
				</div>
			</div>
		</section>

		<!-- Features -->
		<section class="features">
			<div class="feature-grid">
				<div class="feature-card">
					<div class="feature-icon">🎯</div>
					<h3>Асинхронно</h3>
					<p>Проходь у своєму ритмі. Жодних дедлайнів — лише Воля.</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">☀️</div>
					<h3>AI-помічник</h3>
					<p>SunIntelligence — особистий AI з розумінням курсу.</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">🌊</div>
					<h3>6 серій</h3>
					<p>Від основ свідомості до практики суперінтелекту.</p>
				</div>
			</div>
		</section>

		<!-- Tiers -->
		<section class="tiers-section">
			<h2 class="section-title">Три рівні участі</h2>
			<div class="tiers-grid">
				<div class="tier free">
					<div class="tier-badge">Старт</div>
					<h3>Free</h3>
					<div class="tier-price">$0</div>
					<ul>
						<li>✓ Повний доступ до 6 серій</li>
						<li>✓ sun.app (AI-помічник)</li>
						<li>✓ Маніфест Природного Права</li>
					</ul>
					<button class="btn-tier" @click="goRegister">Почати</button>
				</div>
				<div class="tier sub featured">
					<div class="tier-badge">Спільнота</div>
					<h3>Sub</h3>
					<div class="tier-price">$99<span>/mo</span></div>
					<ul>
						<li>✓ Все з Free</li>
						<li>✓ Чат Досягнень</li>
						<li>✓ Спільнота мИ</li>
						<li>✓ Зустрічі з архітекторами</li>
					</ul>
					<button class="btn-tier featured" @click="goRegister">Приєднатись</button>
				</div>
				<div class="tier vip">
					<div class="tier-badge">Трансформація</div>
					<h3>VIP</h3>
					<div class="tier-price">1 BTC</div>
					<ul>
						<li>✓ Все з Sub</li>
						<li>✓ Персональний архітектор</li>
						<li>✓ Глибинна трансформація</li>
						<li>✓ Довічний доступ</li>
					</ul>
					<button class="btn-tier" @click="goRegister">Зв'язатись</button>
				</div>
			</div>
		</section>

		<!-- Quote -->
		<section class="quote-section">
			<blockquote>
				«Все має відбуватись ПОВОЛІ,<br>бо мИ живемо ПО ВОЛІ»
			</blockquote>
		</section>

		<!-- Final CTA -->
		<section class="final-cta">
			<h2>Готовий активувати суперінтелект?</h2>
			<button class="btn-primary large" @click="goRegister">
				Створити акаунт — безкоштовно ☀️
			</button>
			<p class="cta-note">Жодної кредитної картки. Жодних зобов'язань.</p>
		</section>
	</div>
</template>

<style scoped>
.landing {
	max-width: 100%;
	overflow-x: hidden;
	font-family: 'Inter', sans-serif;
}

/* ─── Hero ─── */
.hero {
	position: relative;
	min-height: 85vh;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 80px 24px 60px;
	overflow: hidden;
}

.hero-glow {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 600px;
	height: 600px;
	background: radial-gradient(circle, rgba(253, 242, 0, 0.12) 0%, transparent 70%);
	pointer-events: none;
	animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
	50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
}

.hero-content {
	position: relative;
	z-index: 1;
}

.hero-badge {
	display: inline-block;
	padding: 6px 16px;
	background: rgba(253, 242, 0, 0.1);
	border: 1px solid rgba(253, 242, 0, 0.2);
	border-radius: 20px;
	font-size: 13px;
	font-weight: 700;
	letter-spacing: 0.08em;
	color: #FDF200;
	margin-bottom: 24px;
}

.hero-title {
	font-size: clamp(2.5rem, 6vw, 4.5rem);
	font-weight: 900;
	line-height: 1.1;
	margin: 0 0 20px;
}

.gradient-text {
	background: linear-gradient(135deg, #FDF200, #ffae00, #ff6b00);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.subtitle {
	display: block;
	font-size: 0.5em;
	font-weight: 400;
	color: var(--vp-c-text-2);
	-webkit-text-fill-color: currentColor;
	margin-top: 8px;
}

.hero-desc {
	font-size: 18px;
	line-height: 1.7;
	color: var(--vp-c-text-2);
	max-width: 520px;
	margin: 0 auto 40px;
}

.hero-desc em {
	color: #FDF200;
	font-style: normal;
	font-weight: 600;
}

.hero-cta {
	display: flex;
	gap: 16px;
	justify-content: center;
	flex-wrap: wrap;
}

/* ─── Buttons ─── */
.btn-primary {
	padding: 16px 36px;
	background: linear-gradient(135deg, #FDF200, #f0c800);
	border: none;
	border-radius: 14px;
	color: #000;
	font-size: 17px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	box-shadow: 0 8px 24px rgba(253, 242, 0, 0.3);
}

.btn-primary:hover {
	transform: translateY(-2px) scale(1.02);
	box-shadow: 0 12px 32px rgba(253, 242, 0, 0.5);
}

.btn-primary.large {
	padding: 20px 48px;
	font-size: 19px;
}

.btn-ghost {
	padding: 16px 36px;
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 14px;
	color: var(--vp-c-text-1);
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s;
}

.btn-ghost:hover {
	background: rgba(255, 255, 255, 0.05);
	border-color: rgba(255, 255, 255, 0.3);
}

/* ─── Features ─── */
.features {
	padding: 80px 24px;
}

.feature-grid {
	max-width: 900px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 24px;
}

.feature-card {
	padding: 36px 28px;
	background: rgba(255, 255, 255, 0.03);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 20px;
	text-align: center;
	transition: all 0.3s;
}

.feature-card:hover {
	transform: translateY(-4px);
	border-color: rgba(253, 242, 0, 0.2);
	box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.feature-icon {
	font-size: 40px;
	margin-bottom: 16px;
}

.feature-card h3 {
	font-size: 18px;
	font-weight: 700;
	margin: 0 0 12px;
	color: var(--vp-c-text-1);
}

.feature-card p {
	font-size: 14px;
	line-height: 1.6;
	color: var(--vp-c-text-2);
	margin: 0;
}

/* ─── Tiers ─── */
.tiers-section {
	padding: 80px 24px;
}

.section-title {
	text-align: center;
	font-size: 32px;
	font-weight: 800;
	margin: 0 0 48px;
	color: var(--vp-c-text-1);
}

.tiers-grid {
	max-width: 960px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 24px;
	align-items: start;
}

.tier {
	padding: 36px 28px;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 24px;
	text-align: center;
	transition: all 0.3s;
}

.tier.featured {
	border-color: rgba(253, 242, 0, 0.3);
	background: rgba(253, 242, 0, 0.03);
	transform: scale(1.05);
	box-shadow: 0 16px 48px rgba(253, 242, 0, 0.1);
}

.tier-badge {
	display: inline-block;
	padding: 4px 12px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	font-size: 11px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--vp-c-text-2);
	margin-bottom: 16px;
}

.tier.featured .tier-badge {
	background: rgba(253, 242, 0, 0.15);
	color: #FDF200;
}

.tier h3 {
	font-size: 28px;
	font-weight: 800;
	margin: 0 0 8px;
	color: var(--vp-c-text-1);
}

.tier-price {
	font-size: 42px;
	font-weight: 900;
	color: var(--vp-c-text-1);
	margin-bottom: 24px;
}

.tier-price span {
	font-size: 16px;
	font-weight: 400;
	color: var(--vp-c-text-2);
}

.tier ul {
	list-style: none;
	padding: 0;
	margin: 0 0 28px;
	text-align: left;
}

.tier li {
	padding: 8px 0;
	font-size: 14px;
	color: var(--vp-c-text-2);
	border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.tier li:last-child {
	border-bottom: none;
}

.btn-tier {
	width: 100%;
	padding: 14px;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 14px;
	color: var(--vp-c-text-1);
	font-size: 15px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.3s;
}

.btn-tier:hover {
	background: rgba(255, 255, 255, 0.1);
}

.btn-tier.featured {
	background: linear-gradient(135deg, #FDF200, #f0c800);
	color: #000;
	border: none;
	box-shadow: 0 8px 24px rgba(253, 242, 0, 0.3);
}

.btn-tier.featured:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 32px rgba(253, 242, 0, 0.5);
}

/* ─── Quote ─── */
.quote-section {
	padding: 80px 24px;
	text-align: center;
}

blockquote {
	font-size: clamp(1.3rem, 3vw, 2rem);
	font-weight: 400;
	font-style: italic;
	line-height: 1.6;
	color: var(--vp-c-text-2);
	max-width: 600px;
	margin: 0 auto;
	border: none;
	padding: 0;
}

/* ─── Final CTA ─── */
.final-cta {
	padding: 80px 24px 120px;
	text-align: center;
}

.final-cta h2 {
	font-size: clamp(1.5rem, 3vw, 2.2rem);
	font-weight: 800;
	margin: 0 0 32px;
	color: var(--vp-c-text-1);
}

.cta-note {
	margin-top: 16px;
	font-size: 14px;
	color: var(--vp-c-text-3);
}

/* ─── Light Mode ─── */
:root:not(.dark) .feature-card {
	background: rgba(0, 0, 0, 0.02);
	border-color: rgba(0, 0, 0, 0.06);
}

:root:not(.dark) .tier {
	background: rgba(0, 0, 0, 0.02);
	border-color: rgba(0, 0, 0, 0.08);
}

:root:not(.dark) .tier.featured {
	background: rgba(253, 242, 0, 0.04);
	border-color: rgba(200, 170, 0, 0.3);
}

:root:not(.dark) .btn-ghost {
	border-color: rgba(0, 0, 0, 0.15);
	color: #1a1a2e;
}

:root:not(.dark) .btn-ghost:hover {
	background: rgba(0, 0, 0, 0.03);
}

:root:not(.dark) .btn-tier {
	background: rgba(0, 0, 0, 0.03);
	border-color: rgba(0, 0, 0, 0.08);
	color: #1a1a2e;
}

:root:not(.dark) .hero-badge {
	background: rgba(200, 170, 0, 0.08);
	border-color: rgba(200, 170, 0, 0.2);
	color: #b8960a;
}

/* ─── Mobile ─── */
@media (max-width: 768px) {
	.feature-grid {
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.tiers-grid {
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.tier.featured {
		transform: none;
	}

	.hero {
		min-height: 70vh;
		padding: 60px 20px 40px;
	}

	.hero-cta {
		flex-direction: column;
		align-items: center;
	}
}
</style>
