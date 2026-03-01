<template>
  <div class="homepage-container">
    <!-- Slide 1: Welcome -->
    <section class="presentation-slide first-slide">
      <div class="slide-content">
        <h1 class="slide-title">RаЗум — це Світло</h1>
        <p class="slide-text">Жити по Волі Ra3Om — це вибір тих, хто створює майбутнє. мИ будуємо світ, де RаЗум і серце діють в унісон.</p>
        <div class="button-group">
          <a href="/willni/superintellect/registration" class="VPButton brand large">Почати Активацію</a>
          <a href="/willni/system" class="VPButton alt large">Маніфест</a>
        </div>
      </div>
    </section>

    <!-- Slide 2: Pillars -->
    <section class="presentation-slide dark-slide">
      <div class="slide-content">
        <h2 class="slide-title">Три Стовпи Волі</h2>
        <div class="pillars-grid">
          <div class="premium-card">
            <div class="card-inner">
              <div class="premium-icon-text">🛡</div>
              <h3>Суверенітет</h3>
              <p>Повернення прав за правом народження. Я є людина, Я є джерело влади.</p>
              <a href="/willni/law" class="VPButton alt">Дізнатись більше</a>
            </div>
          </div>
          <div class="premium-card">
            <div class="card-inner">
              <div class="premium-icon-text">✨</div>
              <h3>Синтетична Реальність</h3>
              <p>Синтез тіла, серця та RаЗуму. 7D бачення світу через призму Волі.</p>
              <a href="/willni/superintellect/series_1" class="VPButton alt">Перейти</a>
            </div>
          </div>
          <div class="premium-card">
            <div class="card-inner">
              <div class="premium-icon-text">🌐</div>
              <h3>Децентралізація</h3>
              <p>Мережа людей Волі без посередників. Криптографічний захист Волі Ra3Om.</p>
              <a href="/willni/superintellect/economy" class="VPButton alt">Економіка</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Slide 3: Manifesto / Footer -->
    <section class="presentation-slide footer-slide">
      <div class="slide-content centered-content">
        <div class="quote-container">
          <p class="main-quote">
            «Конструктивна критика у мирний час — це право, а у воєнний час — це обов'язок.»
          </p>
          <div class="final-manifesto">
            <h4 class="manifesto-text">мИ обираємо жити по Волі Ra3Om.</h4>
            <p class="copyright">Спільнота Людей Волі © 2026</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.homepage-container {
  width: 100%;
}

.presentation-slide {
  height: 100vh; /* Full screen slides */
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: center; /* Snap magnetic effect */
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.slide-content {
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

.slide-title {
  font-size: 5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  letter-spacing: -0.03em;
  line-height: 1;
}

.slide-text {
  font-size: 1.5rem;
  opacity: 0.8;
  max-width: 800px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* Pillars Grid */
.pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 40px;
}

/* Premium Card */
.premium-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  transition: transform 0.4s ease, border-color 0.4s ease;
}

.premium-card:hover {
  transform: translateY(-10px);
  border-color: #FDF200;
}

.premium-icon-text {
  font-size: 3rem;
  margin-bottom: 20px;
}

/* Footer / Quote slide */
.footer-slide {
  background: transparent;
}

.centered-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.main-quote {
  font-size: 2.5rem;
  font-style: italic;
  max-width: 900px;
  margin: 0 auto 60px;
  line-height: 1.4;
  font-weight: 300;
  opacity: 0.9;
}

.manifesto-text {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.copyright {
  opacity: 0.4;
  margin-top: 20px;
  font-size: 1rem;
}

/* Mobile Responsiveness */
@media (max-width: 960px) {
  .slide-title {
    font-size: 3rem;
  }

  .pillars-grid {
    grid-template-columns: 1fr; /* Stack vertically on mobile */
    gap: 16px;
    max-height: 70vh;
    overflow-y: auto;
    padding: 10px;
  }

  .presentation-slide {
    height: auto;
    min-height: 100vh;
    padding: 100px 20px 40px; /* Space for fixed header */
  }

  .main-quote {
    font-size: 1.5rem;
  }

  .manifesto-text {
    font-size: 2rem;
  }
}
</style>
