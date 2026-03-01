# willni — REQUESTS

> Компас Волі: ПОВОЛІ, бо мИ живемо ПО ВОЛІ.  
> Цей файл — канал зв'язку між сесіями.

---

## R-001: DX/UX тестування сайту

- **Пріоритет**: 🔴 Критичний (зараз)
- **Статус**: ⏳ В процесі
- **Що**:
  Пройти повний user flow локально:
  Landing → Реєстрація → Email підтвердження → Логін → Курс → AI Chat → Оплата
- **Як запустити**:

  ```bash
  # Вбити старий процес на 3333 якщо є:
  lsof -ti :3333 | xargs kill -9

  # Запустити:
  pnpm dev:all
  # VitePress: http://localhost:5173/willni/
  # API Server: http://localhost:3333
  ```

- **Перевірити**:
  - [x] Лендінг відкривається
  - [x] Реєстрація працює (signup → confirm → auto-login)
  - [ ] Логін працює
  - [ ] Курс доступний після логіну
  - [ ] AI Chat відповідає
  - [ ] Сторінка оплати показує адреси
  - [ ] Мова uk/en перемикається
  - [ ] Mobile view адекватний
- **Баги знайдені 2026-02-18**:
  - [x] CORS — dynamic origin для dev (localhost:\*)
  - [x] Server crash — unhandled rejection guard
  - [x] Username кирилиця — client-side validation + i18n errors
  - [x] Field-level error highlighting (shake + red border)
  - [x] Навігація "Почати Серію 1" — window.location fix
  - [x] Переклад серверних помилок (ERROR_MAP)
  - [ ] **Sidebar обрізає текст** — VitePress CSS override war
  - [ ] **Контрастність тексту vs фон** — BackgroundScene перекриває
- **Висновок**: VitePress CSS hacking = нескінченні `!important`. Потрібна nan0web міграція (R-003 ↑)

---

## R-002: Надійні крипто-гаманці

- **Пріоритет**: 🔴 Критичний
- **Статус**: ❌ Не почато
- **Що**:
  Замінити Trustee на суверенні self-custody гаманці.
- **План**:
  - [ ] BTC: **Sparrow Wallet** (desktop) або **BlueWallet** (mobile) — open source, self-custody
  - [ ] USDT: Non-custodial гаманець (Rabby або Trust Wallet)
  - [ ] Записати seed phrase на папері (offline backup)
  - [ ] Отримати публічні адреси для CryptoPayment.vue
  - [ ] Оновити `.vitepress/theme/components/CryptoPayment.vue` з реальними адресами
- **Принцип**: Ти тримаєш ключі = ти тримаєш гроші

---

## R-003: Міграція на nan0web платформу (Data-Driven UI)

- **Пріоритет**: 🔴 Критичний (↑ підвищено після DX тестування)
- **Статус**: ⏳ Частково (8a ✅, 8e ✅, 8b ⏳)
- **Що**:
  Перейти з VitePress на nan0web UI stack (Lit Web Components).
- **Чому зараз**: VitePress CSS override war доведено нежиттєздатним 2026-02-18.
  Sidebar, контрастність, layout — все потребує !important хаків.
  nan0web мета-дані + власні компоненти = повний контроль.
- **Чеклист Phase 8**:
  - [x] 8a: MD → JSON build pipeline (21 tests) — **Виконано: shorthand AST**
  - [ ] 8b: ui-lit Core Components (nav, sidebar, markdown, page) — **В процесі (ЯR)**
  - [ ] 8c: ui-lit Auth Components (auth-form, auth-gate)
  - [ ] 8d: ui-lit Chat & Payment
  - [x] 8e: CLI integration (137 tests)
  - [ ] 8f: Server-Side Rendering
- **Залежності**:
  - [x] `@nan0web/auth-core@1.1.0` — AccessControl, Password, Session
  - [ ] `@nan0web/auth-node@1.1.0` — делегує AC до core
  - [ ] willni CLI → `import { AccessControl } from '@nan0web/auth-core'`

---

## R-004: VPS Deploy

- **Пріоритет**: 🔴 Критичний
- **Статус**: ❌ Не почато
- **Що**: Deploy willni на існуючий VPS
- **План**:

  ```bash
  # На VPS:
  git clone <repo> /var/www/willni
  cd /var/www/willni && npm install
  npm run build  # VitePress → .vitepress/dist/

  # Server:
  CEREBRAS_API_KEY=... PORT=3333 node server/index.js

  # nginx:
  # static files → .vitepress/dist/
  # /auth/* /api/* → proxy_pass localhost:3333
  ```

- **Чеклист**:
  - [ ] git clone + npm install
  - [ ] nginx config (static + reverse proxy)
  - [ ] Let's Encrypt (R-010)
  - [ ] systemd service для `server/index.js`
  - [ ] ENV vars: CEREBRAS*API_KEY, PORT, CORS_ORIGIN, SMTP*\*

---

## R-005: Cerebras API — оновити назву моделі

- **Пріоритет**: 🟢 Легко
- **Статус**: ✅ Виконано
- **Що**:
  Оновити `FALLBACK_MODELS` у `server/index.js`:
  ```javascript
  const FALLBACK_MODELS = ["chat-gpt-120b", "llama3.1-8b"];
  ```
  (було: `['gpt-oss-120b', 'llama3.1-8b']`)
- **Файл**: `server/index.js`, рядок ~23

---

## R-006: Домен willni.yaro.page

- **Пріоритет**: 🟡 Medium
- **Статус**: ❌ Не почато
- **Що**:
  Налаштувати піддомен `willni.yaro.page` на VPS.
- **План**:
  - [ ] DNS A-запис: `willni.yaro.page → VPS IP`
  - [ ] nginx server_name: `willni.yaro.page`
  - [ ] Let's Encrypt сертифікат
  - [ ] Оновити `base` у `.vitepress/config.mjs`: `'/'` (замість `'/willni/'`)
  - [ ] Оновити `CORS_ORIGIN` у server env
- **Альтернатива**: $12/рік за `willni.org`
- **Монетизація**: перший учасник курсу = перший дохід

> ЯR: ✅ Опрацьовано — Zoho Mail support@yaro.page → R-007

---

## R-007: Email — Zoho Mail (support@yaro.page)

- **Пріоритет**: 🟡 Medium
- **Статус**: ⏳ Інфраструктура є, треба підключити
- **Що**:
  Використати існуючий Zoho Mail `support@yaro.page` для відправки email.
  Brevo не потрібний.
- **План**:
  - [ ] ENV vars на VPS:
    ```bash
    SMTP_HOST=smtp.zoho.com
    SMTP_PORT=465
    SMTP_USER=support@yaro.page
    SMTP_PASS=<zoho-app-password>
    SMTP_FROM=support@yaro.page
    ```
  - [ ] Перевірити SMTP доступ у Zoho (Settings → Mail Accounts → SMTP)
  - [ ] Створити App Password якщо 2FA увімкнено
- **Fallback**: Brevo (300 free/day) якщо Zoho має ліміти
- **Майбутнє**: `@nan0web/mail.app` — власний mail сервіс на платформі

---

## R-008: Публікація @nan0web/auth-core@1.1.0

- **Пріоритет**: 🔴 Критичний
- **Статус**: ⏳ Код готовий, треба npm publish
- **Що**:
  Опублікувати auth-core з новими модулями.
- **Команда**:
  ```bash
  cd ~/i/src/nan.web/packages/auth-core
  npm version 1.1.0
  npm publish
  ```
- **Зміст v1.1.0**:
  - AccessControl — data-driven авторизація
  - Password — scrypt hashing
  - Session — lightweight persistence
  - README.md — повний, згенерований, верифікований
  - 104/104 тестів (89 unit + 15 docs)
- **Bugfix**: `@nan0web/db-fs` saveMD string guard (задокументовано в db-fs/REQUESTS.md)

---

## R-009: Публікація @nan0web/auth-node@1.1.0

- **Пріоритет**: 🟡 Medium (після R-008)
- **Статус**: ❌ REQUESTS.md написано
- **Що**:
  Рефакторити AccessControl → делегація до auth-core.
- **Баги знайдені при DX тестуванні**:
  - `AuthDB.saveUser` кидає `throw new Error('Invalid username format')` замість 400 response
  - Кирилічні імена ("Іван") крашать сервер — не ловиться в Router
  - Потрібно: try-catch в handleSignup → return 400 з повідомленням
- **Деталі**: див. `packages/auth-node/REQUESTS.md`

---

## R-010: Let's Encrypt

- **Пріоритет**: 🟢 Легко (після R-004, R-006)
- **Статус**: ❌ Не почато
- **Команда**:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d willni.yaro.page
  ```
- Автооновлення — безкоштовно, назавжди.

---

## R-011: PWA (Progressive Web App)

- **Пріоритет**: 🟡 Medium
- **Статус**: ❌ Не почато
- **Що**:
  Зробити willni.yaro.page встановлюваним як додаток.
- **План**:
  - [ ] `public/manifest.json` — назва, іконки, theme_color
  - [ ] Service Worker для offline кешу
  - [ ] `<link rel="manifest">` у config.mjs head
  - [ ] Іконки: 192x192, 512x512

---

## R-012: Сповіщення — Signal + Telegram

- **Пріоритет**: 🟢 Потім
- **Статус**: ❌ Не почато
- **Що**:
  - Telegram Bot: сповіщення про реєстрації та оплати
  - Signal: приватний канал Ради
  - Інтеграція з `server/index.js` через webhooks
- **План**:
  - [ ] Telegram Bot Token (@BotFather)
  - [ ] `POST /api/report-payment` → notify Telegram
  - [ ] `POST /auth/signup` → notify Telegram
  - [ ] Signal group для Ради (ручне)

---

## R-013: SSO — Google, GitHub, Microsoft, Facebook

- **Пріоритет**: 🟡 Medium (Platform Feature)
- **Статус**: ❌ Архітектура
- **Що**:
  OAuth2 SSO через зовнішні провайдери. Частина `@nan0web/auth-node`.
- **Провайдери**:
  - [ ] Google (OAuth2 + OpenID Connect)
  - [ ] GitHub (OAuth2)
  - [ ] Microsoft (MSAL / OAuth2)
  - [ ] Facebook (OAuth2)
- **Архітектура (nan0web)**:
  ```
  Browser → GET /auth/sso/google → redirect to Google OAuth
  Google callback → GET /auth/sso/google/callback → exchange code → JWT tokens
  ```
- **Реалізація**:
  - [ ] `@nan0web/auth-node` — SSO middleware (`src/sso/`)
  - [ ] `AuthServer.enableSSO({ google: { clientId, secret }, ... })`
  - [ ] Автоматичне створення User при першому SSO вході
  - [ ] Зв'язка SSO ↔ існуючий акаунт по email
- **Frontend**:
  - [ ] SSO кнопки у RegistrationForm.vue та LoginForm.vue
  - [ ] Іконки провайдерів (SVG, не emoji)

---

## Порядок виконання

```
ЗАРАЗ:
  R-001  DX/UX тестування ←──── ти зараз тут
  R-005  Cerebras model name fix
  R-008  npm publish auth-core@1.1.0

ЗАВТРА:
  R-002  Крипто гаманці (Sparrow + BlueWallet)
  R-006  DNS willni.yaro.page
  R-004  VPS deploy
  R-010  Let's Encrypt
  R-007  Zoho SMTP (support@yaro.page)

ДАЛІ:
  R-009  auth-node@1.1.0
  R-011  PWA
  R-012  Telegram Bot
  R-013  SSO (Google, GitHub, Microsoft, Facebook)
  R-003  nan0web migration (ongoing)
```
