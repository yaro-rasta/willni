<script setup>
import { reactive, ref, computed } from "vue";
import { useData, withBase } from "vitepress";

const { lang } = useData();

const GOOGLE_FORM_URL = "https://forms.gle/rxzdqFxZswGNzWJ58" // ← ВСТАВ СЮДИ ПОСИЛАННЯ НА GOOGLE FORM

const t = computed(() => {
  const isEn = lang.value === "en-US";
  return {
    title: isEn ? "Superintellect.Activation Registration" : "Реєстрація: Суперінтелект.Активація",
    deadline: isEn ? "Deadline: February 14, 2026" : "Дедлайн: 14 лютого 2026",
    description: isEn
      ? "Join the pilot group of Superintellect.Activation — the first asynchronous transformation course."
      : "Приєднуйся до пілотної групи «Суперінтелект.Активація» — першого асинхронного курсу трансформації.",
    freeTitle: "Free",
    freeDesc: isEn ? "Course + sun.app (free)" : "Курс + sun.app (безкоштовно)",
    subTitle: "Sub ($99)",
    subDesc: isEn ? "Community + Achievement Chat" : "Спільнота + Чат Досягнень",
    vipTitle: "VIP (1 BTC)",
    vipDesc: isEn ? "Personal transformation with architect(s)" : "Персональна трансформація з архітектором(и)",
    registerBtn: isEn ? "Register via Google Form" : "Зареєструватися через Google Form",
    registerBtnDirect: isEn ? "Fill Registration Form" : "Заповнити Форму Реєстрації",
    orText: isEn ? "or" : "або",
    seriesBtn: isEn ? "Start with Series 1 (free)" : "Почати з Серії 1 (безкоштовно)",
    manifestoText: isEn
      ? "By registering, you agree to the"
      : "Реєструючись, ти погоджуєшся з",
    manifestoLink: isEn
      ? "Natural Law Manifesto"
      : "Маніфестом Природного Права",
    lawPath: withBase(isEn ? "/en/law" : "/law"),
    // For inline form mode (when no Google Form URL)
    nameLabel: isEn ? "Name / Alias" : "Ім'я / Псевдонім",
    namePlaceholder: isEn ? "What should we call you?" : "Як тебе називати?",
    emailLabel: "Email",
    emailPlaceholder: "contact@email.com",
    messengerLabel: "Telegram / Signal",
    messengerPlaceholder: "@username",
    levelLabel: isEn ? "Participation Level" : "Рівень Участі",
    witnessLabel: isEn ? "Witnesses (if any)" : "Свідки (якщо є)",
    witnessPlaceholder: isEn
      ? "Names of two community members"
      : "Імена двох учасників спільноти",
    witnessHint: isEn
      ? "Not required to start the course."
      : "Не обов'язково для старту курсу.",
    manifestoCheckText: isEn
      ? "I have read the"
      : "Я ознайомився з",
    manifestoCheckAccept: isEn
      ? "and accept its principles."
      : "і приймаю його принципи.",
    submitBtn: isEn ? "Activate ☀️" : "Активувати ☀️",
    submitLoading: isEn ? "Submitting..." : "Відправка...",
    successTitle: isEn ? "🎉 Application accepted!" : "🎉 Заявку прийнято!",
    successGreeting: isEn ? "Welcome," : "Вітаємо,",
    successMsg: isEn
      ? "You made the first step. Check your email/messenger — we'll send you instructions and Signal community invite."
      : "Ти зробив перший крок. Перевір пошту/месенджер — ми надішлемо інструкції та запрошення до Signal-спільноти.",
    alertManifesto: isEn
      ? "Please read the Manifesto first!"
      : "Будь ласка, ознайомтесь з Маніфестом!",
  };
});

// Inline form (fallback if no Google Form URL)
const form = reactive({
  name: "",
  email: "",
  messenger: "",
  level: "free",
  witnesses: "",
  manifestoAgreed: false,
});

const loading = ref(false);
const submitted = ref(false);

const hasGoogleForm = computed(() => GOOGLE_FORM_URL.length > 0);

const openGoogleForm = () => {
  window.open(GOOGLE_FORM_URL, "_blank");
};

const submitForm = async () => {
  if (!form.manifestoAgreed) {
    alert(t.value.alertManifesto);
    return;
  }

  loading.value = true;
  // TODO: Connect to backend/Signal API
  console.log("Form Data:", JSON.stringify(form, null, 2));
  await new Promise((resolve) => setTimeout(resolve, 1500));
  loading.value = false;
  submitted.value = true;
};
</script>

<template>
  <div class="reg-wrapper">
    <div class="reg-container">
      <!-- Google Form Mode -->
      <div v-if="hasGoogleForm" class="landing-card">
        <h2>{{ t.title }}</h2>
        <p class="subtitle">{{ t.deadline }}</p>
        <p class="description">{{ t.description }}</p>

        <div class="tiers">
          <div class="tier">
            <span class="tier-title">{{ t.freeTitle }}</span>
            <span class="tier-desc">{{ t.freeDesc }}</span>
          </div>
          <div class="tier">
            <span class="tier-title">{{ t.subTitle }}</span>
            <span class="tier-desc">{{ t.subDesc }}</span>
          </div>
          <div class="tier vip">
            <span class="tier-title">{{ t.vipTitle }}</span>
            <span class="tier-desc">{{ t.vipDesc }}</span>
          </div>
        </div>

        <button class="submit-btn" @click="openGoogleForm">
          {{ t.registerBtn }}
        </button>

        <p class="manifesto-note">
          {{ t.manifestoText }}
          <a :href="t.lawPath" target="_blank">{{ t.manifestoLink }}</a>.
        </p>

        <div class="divider">
          <span>{{ t.orText }}</span>
        </div>

        <a href="/willni/superintellect/series_1" class="series-link" target="_blank">
          {{ t.seriesBtn }}
        </a>
      </div>

      <!-- Inline Form Mode (fallback) -->
      <div v-else>
        <div v-if="submitted" class="success-message">
          <h3>{{ t.successTitle }}</h3>
          <p>{{ t.successGreeting }} {{ form.name }}.</p>
          <p>{{ t.successMsg }}</p>
          <div class="next-steps">
            <a href="/willni/superintellect/series_1" class="btn" target="_blank">{{ t.seriesBtn }}</a>
          </div>
        </div>

        <form v-else @submit.prevent="submitForm" class="glass-form">
          <h2>{{ t.title }}</h2>
          <p class="subtitle">{{ t.deadline }}</p>

          <div class="form-group">
            <label>{{ t.nameLabel }}</label>
            <input v-model="form.name" type="text" :placeholder="t.namePlaceholder" required />
          </div>

          <div class="form-group">
            <label>{{ t.emailLabel }}</label>
            <input v-model="form.email" type="email" :placeholder="t.emailPlaceholder" required />
          </div>

          <div class="form-group">
            <label>{{ t.messengerLabel }}</label>
            <input v-model="form.messenger" type="text" :placeholder="t.messengerPlaceholder" required />
          </div>

          <div class="form-group">
            <label>{{ t.levelLabel }}</label>
            <div class="radio-group">
              <label class="radio-card" :class="{ active: form.level === 'free' }">
                <input type="radio" v-model="form.level" value="free" />
                <span class="title">{{ t.freeTitle }}</span>
                <span class="desc">{{ t.freeDesc }}</span>
              </label>
              <label class="radio-card" :class="{ active: form.level === 'subscription' }">
                <input type="radio" v-model="form.level" value="subscription" />
                <span class="title">{{ t.subTitle }}</span>
                <span class="desc">{{ t.subDesc }}</span>
              </label>
              <label class="radio-card vip" :class="{ active: form.level === 'vip' }">
                <input type="radio" v-model="form.level" value="vip" />
                <span class="title">{{ t.vipTitle }}</span>
                <span class="desc">{{ t.vipDesc }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>{{ t.witnessLabel }}</label>
            <input v-model="form.witnesses" type="text" :placeholder="t.witnessPlaceholder" />
            <small>{{ t.witnessHint }}</small>
          </div>

          <div class="form-group checkbox">
            <label>
              <input v-model="form.manifestoAgreed" type="checkbox" required />
              <span>
                {{ t.manifestoCheckText }}
                <a :href="t.lawPath" target="_blank">{{ t.manifestoLink }}</a>
                {{ t.manifestoCheckAccept }}
              </span>
            </label>
          </div>

          <button type="submit" :disabled="loading" class="submit-btn">
            <span v-if="loading">{{ t.submitLoading }}</span>
            <span v-else>{{ t.submitBtn }}</span>
          </button>
        </form>
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
  max-width: 480px;
  font-family: "Inter", sans-serif;
}

/* Landing card (Google Form mode) */
.landing-card {
  text-align: center;
  padding: 32px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.description {
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 0.95em;
}

.tiers {
  display: grid;
  gap: 8px;
  margin-bottom: 24px;
}

.tier {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.tier.vip {
  border-color: rgba(255, 215, 0, 0.4);
  background: rgba(255, 215, 0, 0.05);
}

.tier-title {
  font-weight: 700;
  font-size: 0.95em;
}

.tier-desc {
  font-size: 0.8em;
  opacity: 0.7;
}

.manifesto-note {
  margin-top: 12px;
  font-size: 0.8em;
  opacity: 0.6;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: var(--vp-c-text-3);
  font-size: 0.85em;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--vp-c-divider);
}

.series-link {
  display: inline-block;
  padding: 10px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.series-link:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

/* Glass form (inline mode) */
.glass-form {
  background: rgba(var(--vp-c-bg-rgb), 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--vp-c-divider);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 5px;
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  font-size: 1.8em;
  line-height: 1.2;
}

.subtitle {
  text-align: center;
  opacity: 0.6;
  margin-bottom: 25px;
  font-size: 0.9em;
  margin-top: 0;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.9em;
  color: var(--vp-c-text-1);
}

input[type="text"],
input[type="email"] {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
  font-size: 16px;
}

input:focus {
  border-color: #647eff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(100, 126, 255, 0.1);
}

.radio-group {
  display: grid;
  gap: 8px;
}

.radio-card {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: var(--vp-c-bg-alt);
}

.radio-card:hover {
  background: var(--vp-c-bg-soft);
}

.radio-card input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-card.active {
  border-color: #647eff;
  background: rgba(100, 126, 255, 0.08);
}

.radio-card.vip.active {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.08);
}

.radio-card .title {
  font-weight: bold;
  font-size: 0.95em;
}

.radio-card .desc {
  font-size: 0.8em;
  opacity: 0.7;
}

.checkbox label {
  font-weight: 400;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 0.9em;
  line-height: 1.4;
}

.checkbox input {
  margin-top: 3px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, #42d392, #647eff);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  font-size: 1.1em;
  cursor: pointer;
  transition: transform 0.1s;
  margin-top: 10px;
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.success-message {
  text-align: center;
  padding: 40px;
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
}

.btn {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: var(--vp-c-brand);
  color: white;
  border-radius: 8px;
  text-decoration: none;
}
</style>
