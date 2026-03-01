<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

// Placeholder addresses — USER should replace these with Trustee wallet addresses
const addresses = {
  btc: '3M...Trustee_BTC_Address',
  usdt: 'TR...Trustee_USDT_TRC20_Address',
}

const copied = ref('')
function copy(text, label) {
  navigator.clipboard.writeText(text)
  copied.value = label
  setTimeout(() => { copied.value = '' }, 2000)
}

const step = ref('select') // select | report | success
const loading = ref(false)
const error = ref('')
const txHash = ref('')
const selectedMethod = ref('usdt')

const amounts = {
  sub: '$99',
  vip: '1 BTC'
}

async function submitReport() {
  if (!txHash.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    // Send report to server (will log to console for now)
    const res = await fetch(`${API_URL}/api/report-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: selectedMethod.value,
        hash: txHash.value.trim(),
        username: localStorage.getItem('willni_user') || 'anonymous'
      })
    })

    if (!res.ok) throw new Error('Failed to submit report')
    step.value = 'success'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="payment-container">
    <div class="glass-card">
      <!-- Step 1: Select & Copy -->
      <div v-if="step === 'select'">
        <h2 class="title">Активація доступу ☀️</h2>
        <p class="desc">Виберіть метод оплати для рівня <strong>Sub ($99)</strong> або <strong>VIP (1 BTC)</strong>.</p>

        <div class="method-selector">
          <button
            v-for="(addr, key) in addresses"
            :key="key"
            :class="['method-btn', { active: selectedMethod === key }]"
            @click="selectedMethod = key"
          >
            {{ key.toUpperCase() }}
          </button>
        </div>

        <div class="address-box">
          <div class="label">{{ selectedMethod.toUpperCase() }} Адреса (Trustee)</div>
          <div class="value-row">
            <code class="address">{{ addresses[selectedMethod] }}</code>
            <button class="copy-btn" @click="copy(addresses[selectedMethod], selectedMethod)">
              {{ copied === selectedMethod ? '✅' : 'Copy' }}
            </button>
          </div>
          <p class="hint" v-if="selectedMethod === 'usdt'">* Тільки мережа <strong>TRC-20 (Tron)</strong></p>
        </div>

        <div class="info-box">
          <p>Після відправки натисніть кнопку нижче, щоб повідомити про транзакцію.</p>
        </div>

        <button class="next-btn" @click="step = 'report'">Я оплатив, надіслати хеш →</button>
      </div>

      <!-- Step 2: Report Transaction -->
      <div v-else-if="step === 'report'">
        <h2 class="title">Підтвердження ⚡️</h2>
        <p class="desc">Введіть TX Hash (ID транзакції) для верифікації платежу.</p>

        <div class="input-group">
          <label>TX Hash</label>
          <input
            v-model="txHash"
            type="text"
            placeholder="Вставте хеш транзакції тут..."
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <div class="actions">
          <button class="back-btn" @click="step = 'select'" :disabled="loading">← Назад</button>
          <button class="submit-btn" @click="submitReport" :disabled="loading || !txHash.trim()">
            {{ loading ? 'Надсилаємо...' : 'Підтвердити оплату' }}
          </button>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div v-else-if="step === 'success'" class="success-screen">
        <div class="icon">✨</div>
        <h2 class="title">Звіт надіслано</h2>
        <p class="desc">Архітектори отримали ваш звіт. Верифікація зазвичай займає від 10 хвилин до 2 годин.</p>
        <p class="desc">Ви отримаєте сповіщення, коли ваш статус оновиться до <strong>Sub/VIP</strong>.</p>
        <button class="next-btn" @click="window.location.href = withBase('/superintellect/series_1')">
          До курсу ☀️
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.glass-card {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 40px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.3);
}

.title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 12px;
  text-align: center;
  color: var(--vp-c-text-1);
}

.desc {
  font-size: 15px;
  color: var(--vp-c-text-2);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32px;
}

.method-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.method-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--vp-c-text-2);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.method-btn.active {
  background: rgba(253, 242, 0, 0.1);
  border-color: rgba(253, 242, 0, 0.4);
  color: #FDF200;
}

.address-box {
  background: rgba(0,0,0,0.2);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid rgba(255,255,255,0.05);
}

.address-box .label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 12px;
}

.value-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.address {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  background: rgba(0,0,0,0.3);
  padding: 12px;
  border-radius: 8px;
  word-break: break-all;
  color: #fff;
}

.copy-btn {
  padding: 12px 16px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.hint {
  font-size: 12px;
  color: #ffae00;
  margin-top: 12px;
  margin-bottom: 0;
}

.info-box {
  background: rgba(253, 242, 0, 0.05);
  border-left: 3px solid #FDF200;
  padding: 16px;
  border-radius: 0 12px 12px 0;
  margin-bottom: 32px;
}

.info-box p {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.next-btn, .submit-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #FDF200, #f0c800);
  border: none;
  border-radius: 16px;
  color: #000;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(253, 242, 0, 0.3);
  transition: all 0.2s;
}

.next-btn:hover, .submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(253, 242, 0, 0.5);
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
}

.input-group input {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
}

.actions {
  display: flex;
  gap: 12px;
}

.back-btn {
  flex: 0.4;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--vp-c-text-2);
  border-radius: 16px;
  cursor: pointer;
}

.success-screen {
  text-align: center;
}

.icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.error-msg {
  color: #ff5555;
  background: rgba(255, 85, 85, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
}
</style>
