# 🚀 Наступні дії — willni (28 лют 2026)

## ✅ Завершено

### Phase 1: Auth — nan0web Platform Migration

- [x] Встановлено nan0web пакети як npm залежності
  - `@nan0web/auth-node`, `@nan0web/auth-core`, `@nan0web/http-node`
  - `@nan0web/db`, `@nan0web/db-fs`, `@nan0web/http`, `@nan0web/log`
  - `@nan0web/types`, `@nan0web/event`
- [x] `server/index.js` — AuthServer з `@nan0web/auth-node` (74 рядки)
- [x] Видалено `server/auth-setup.js` (більше не потрібний)
- [x] Всі auth endpoints працюють:
  - `POST /auth/signup` — реєстрація
  - `PUT /auth/signup/:username` — підтвердження кодом
  - `POST /auth/signin/:username` — логін → access + refresh tokens
  - `GET /auth/signin/:username` — дані користувача (Bearer token)
  - `PUT /auth/refresh/:token` — оновлення токенів
  - `POST /auth/forgot/:username` — запит скидання паролю
  - `PUT /auth/forgot/:username` — скидання паролю
  - `DELETE /auth/signin/:username` — логаут
- [x] CORS middleware для VitePress dev-сервера
- [x] Health check (`GET /health`)

---

## ✅ Phase 2: Vue → Auth API Integration (28 лют 2026)

- [x] **auth.js** — централізована утиліта для управління токенами
  - Reactive state: `isAuthenticated`, `currentUser`
  - API helpers: signup, confirmSignup, signin, fetchUser, refresh, signout
  - Token persistence в `localStorage` (`willni_auth` key)
  - Auto-init: перевірка → verify → fallback refresh
- [x] **RegistrationForm.vue** — переписано на `/auth/signup`
  - Форма: username + email + password + tier selection
  - 3-step flow: register → confirm code → auto-login → success
  - Manifesto agreement checkbox
  - Glassmorphism design, dark/light theme
- [x] **AuthGate.vue** — Bearer token auth
  - `auth.init()` на mount → localStorage → verify → refresh
  - Login form inline (username + password)
  - Logout button з `auth.signout()`
  - Loading spinner під час init
- [x] **LoginForm.vue** (новий) — окрема сторінка логіну
  - `POST /auth/signin/:username` → redirect до курсу
  - `superintellect/login.md` page
- [x] **server/index.js** — nan0web code style (no `;`, tabs, single quotes)
- [x] **Build verified** ✓

---

## ✅ Phase 2b: Design Fix (28 лют 2026)

- [x] Light theme text visibility — h1-h6, p, ul, ol, strong overrides
- [x] Premium table styling — glassmorphism headers, rounded corners, hover effects
- [x] Typography — Inter font stack, anti-aliasing
- [x] Custom blocks (tip, warning) — light theme contrast fix
- [x] **Build verified** ✓

---

## ✅ Phase 3: AI Chat Widget (28 лют 2026)

- [x] `ChatWidget.vue` — плаваючий чат-віджет (☀️ toggle → glassmorphism window)
  - Premium design: popIn animation, typing indicator, message bubbles
  - Dark/light theme support
  - Real API fetch до `/api/chat`
- [x] `POST /api/chat` — серверний endpoint (stub, готовий для AI модуля)
- [x] Інтеграція в `Layout.vue` (#layout-bottom slot)
- [x] Глобальна реєстрація в `theme/index.js`
- [x] **Build verified** ✓

---

## ✅ Phase 3b: AI — Real Intelligence (28 лют 2026)

- [x] Cerebras API інтеграція (gpt-oss-120b → llama3.1-8b fallback)
- [x] System prompt: SunIntelligence ☀️ з контекстом курсу Суперінтелект
- [x] `/api/chat` — реальні AI відповіді, body parsing, model fallback
- [x] `/health` — AI status indicator
- [x] **Server tested** ✓ — AI відповідає українською
- [x] **Build verified** ✓

---

## ✅ Phase 3c: AI — Streaming & History (28 лют 2026)

- [x] SSE streaming — токени приходять real-time, ChatWidget показує cursor blink
- [x] Conversation history — in-memory per session (30 min TTL, max 20 messages)
- [x] Session ID — random per widget instance
- [x] **Server tested** ✓ — `data: {"text":"token"}\n\n` format
- [x] **Build verified** ✓

---

## ✅ Phase 5: Email Verification (28 лют 2026)

- [x] `nodemailer` — встановлено як npm dependency
- [x] HTML email templates:
  - Verification code (glassmorphism dark theme, branded)
  - Welcome email (CTA → Series 1)
- [x] `POST /api/send-verification` — відправка коду на пошту
- [x] `POST /api/send-welcome` — welcome email після підтвердження
- [x] Dev mode fallback — `📧 [DEV]` логування в консоль якщо SMTP не налаштовано
- [x] Integration: RegistrationForm.vue → fire-and-forget email calls
- [x] **Server tested** ✓
- [x] **Build verified** ✓

Env vars для production:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
SMTP_FROM=noreply@willni.com
```

---

## ✅ Phase 6: Landing Page (28 лют 2026)

- [x] `LandingPage.vue` — premium single-page landing
  - Hero: gradient text, pulsing glow animation, dual CTA
  - Features: 3 cards (Async, AI, 6 Series)
  - Pricing: 3 tiers (Free/Sub $99/VIP 1 BTC) with featured highlight
  - Quote: "ПОВОЛІ, бо мИ живемо ПО ВОЛІ"
  - Final CTA: single button → registration
  - Mobile-first responsive
  - Dark/light theme
- [x] `superintellect/start.md` — SEO-ready page
- [x] UTM tracking (sessionStorage)
- [x] **Build verified** ✓

---

## ✅ Phase 9: Sovereign CLI & Mesh Simulation (28 лют 2026)

- [x] **Core: ESM & Clean Code Standard**
  - [x] Повна міграція на native ESM (`package.json → type: module`, `.js` розширення)
  - [x] Впроваджено політику **No Semicolons** (код чистий від `;`)
  - [x] Видалено залежність від `@nan0web/co` (використання plain objects та нативних `Message` класів)
- [x] **Domain Models (`Sovereign.js`)**
  - [x] Реалізовано `ModelSchema` для `Peer`, `Message`, `Case`, `Node`
  - [x] Висока точність координат (6 знаків після коми) для Mesh-пакетів (точність ~10см)
  - [x] Протокол **Bit-Sovereign**: компактна серіалізація для LoRa (300 bps) через `toMesh/fromMesh`
- [x] **Message-Handler Architecture**
  - [x] Команди: `status`, `peers`, `chat`, `sos`, `raid`, `help`, `logs`
  - [x] Спеціалізовані хендлери (`AlertHandler`, `PeersHandler`, `LogsHandler` тощо)
  - [x] Брендована довідка (`--help`) та ANSI Bold pre-processor (`**bold**` → `\x1b[1m`)
- [x] **Mesh Simulation Persistence**
  - [x] Перехід на **JSONL (JSON Lines)** для ефективного логування (`append-only`)
  - [x] `data/mesh_registry.jsonl` — динамічне виявлення вузлів у мережі
  - [x] `data/intentions.jsonl` — спільний ефір інтенсій у симуляції
  - [x] Підтримка `SOVEREIGN_ID` для запуску кількох вузлів на одній машині
- [x] **Documentation & Mockups**
  - [x] `CLI_GUIDE.md` — інструкція для суверенних вузлів
  - [x] `web/mockups/SovereignChat.html` — оновлений дизайн веб-інтерфейсу (Court, Node panels)
- [x] **Verified** ✓ — повний паритет між CLI симуляцією та доменною моделлю

---

## ⏳ Наступне

### ✅ Phase 10: Architecture & Sovereign Identity (1 бер 2026)

- [x] **Sovereign Models Refined:** classes renamed (no `Model` suffix), English keys/help text
- [x] **iVerse Domain:** added `Verse`, `Product`, `Chronicle` models for personal portfolios/chronology
- [x] **Universal Architecture:** Створено `universal_architecture.md` з чіткою ієрархією системи (Конституція, Рада, Економіка, МЗС).
- [x] **Економіка 1-33-33-33:** Уточнено, що 33% інфраструктури (сервери, ноутбуки) виділяється через децентралізоване Mesh-голосування. 1% — Creator Fee.
- [x] **Фізичні Прояви (Identifiers):** Додано механізм унікальних номерних знаків (напр., `[LICENSE PLATE]: ЯRаСлав` = "Ім'Я / I am Ia").
- [x] **Snapshots Gallery (`nan0gallery`):**
  - Створено універсальний інструмент `@nan0web/ui-cli/scripts/gallery.mjs`
  - Автоматична генерація Markdown з `.txt`, `.webp`, `.png` снепшотів
  - Підтримка парсингу назв кроків для e2e візуального рев'ю.

---

### ⏳ Наступне: Real Mesh, Web & Crypto (Phase 11)

- [x] **Sovereign Identity (Crypto):** реальна Ed25519 сигнатура через `@nan0web/auth-core` (Crypto API).
  - [x] `IdentityManager`: генерація та збереження ключів у `cli/data/identity.json`.
  - [x] Інтеграція в `bin/sovereign.js`: кожне повідомлення в Mesh підписується автоматично.
  - [x] Перевірка підпису в тестах (`crypto_identity.test.js`).
- [x] **Code Style Standardized:** весь код у `src/domain` та `ui-cli` рефакторовано на використання табуляції та відсутність крапок з комою. Створено `.prettierrc` та `.editorconfig`.
- [x] **P2P Transport Layer:** реалізовано UDP Broadcast транспорт (`MeshTransport.js`). Тепер вузли реально спілкуються в локальній мережі без сервера. Додано режим `sovereign logs -f` для Live-моніторингу ефіру.
- [ ] **WebSync:** підключення `Sovereign.js` моделей до веб-інтерфейсу (Sovereign App Showcase).
- [ ] **Mesh Map:** візуалізація пірів та інтенсій на мапі (на основі точних GPS координат з bit-sovereign).
- [ ] **Governance Logic:** реєстрація доказів (evidence) та повноцінне голосування (розподіл 33% казначейства) через CLI.

### Phase 4: Crypto Payments (Fast Start)

### Phase 7: BTCPay Server & Automation

- [ ] Налаштування BTCPay Server на VPS (~$15/mo)
- [ ] Інтеграція zPub/xPub від суверенного гаманця (Sparrow/BlueWallet)
- [ ] Автоматизація апгрейду ролей через Webhooks BTCPay
- [ ] Lightning Network для миттєвих мікроплатежів ($99)

### Phase 8: nan0web Native Frontend 🌐

Повна міграція з VitePress на nan0web UI stack.
willni стає **першим showcase** nan0web web-додатку.

#### 8a: Build Pipeline — MD → JSON ✅

Конвертація всіх `.md` файлів у `.json` для `@nan0web/db-browser`:

- [x] Скрипт `scripts/md-to-json.mjs` — парсить `.md` (frontmatter + content) — 21 unit tests
- [x] Генерує `data/content/*.json` з `$content` масивом (76 файлів)
- [x] CLI: `scripts/build-content.mjs` + `npm run build:content`
- [x] Серверний endpoint: `GET /api/content?path=` — віддає JSON документи — 6 E2E tests
- [x] `db-browser.fetch('superintellect/series_1')` → отримує контент

#### 8b: ui-lit Core Components

Розширення `@nan0web/ui-lit` для willni (Lit Web Components):

- [ ] `ui-nav` — верхня навігація (Матриця, Курс, Реєстрація, Оплата)
- [ ] `ui-sidebar` — бічна панель з деревом навігації
- [ ] `ui-markdown` — рендер MD контенту (заголовки, списки, код, таблиці)
- [ ] `ui-page` — layout компонент (nav + sidebar + content + footer)
- [ ] `ui-dark-mode` — перемикач теми (вже є CSS vars у theme/)
- [ ] `ui-lang` — перемикач мови (uk/en, інтеграція з `@nan0web/i18n`)

#### 8c: ui-lit Auth Components

Міграція Vue Auth → Lit Web Components:

- [ ] `ui-auth-form` — реєстрація/логін (замість RegistrationForm.vue)
- [ ] `ui-auth-gate` — захист контенту (замість AuthGate.vue)
- [ ] Інтеграція з `@nan0web/auth-core` (browser-side)

#### 8d: ui-lit Chat & Payment

- [ ] `ui-chat` — AI чат з SSE streaming (замість ChatWidget.vue)
- [ ] `ui-payment` — крипто платіжна сторінка (замість CryptoPayment.vue)

#### 8e-2: Data-Driven Authorization (18 лют 2026)

- [x] **AccessControl** (`cli/access.mjs`) — data-driven авторизація
  - Adapted from `@nan0web/auth-node/AccessControl`
  - 3-рівнева резолюція: user → group → global
  - URL-based: кожна дія = шлях (`/admin`, `/dashboard`, `/course`)
  - `ac.check(slug, path, level)` — один виклик замість 30 if/else
  - `ac.filterNav(navItems, slug)` — автоматична фільтрація меню
  - Unit tests: `cli/access.test.mjs` (34 tests)
- [x] **Data files** — декларативні правила доступу
  - `cli/data/.access` — Конституція (global rules)
  - `cli/data/.group` — Реєстр груп (group → users)
  - `cli/data/nav.yaml` — Навігація як дані (path + icon + flags)
- [x] **main.mjs refactored** — data-driven menu generation
  - Замінено ~30 рядків if/else на 1: `ac.filterNav(navItems, slug)`
  - Nav items з nav.yaml, доступ з .access/.group
  - Убрано хардкоджений `requireAuth` guard для навігації
- [x] **137/137 tests pass** ✓

**Наступний крок — Platform Migration**:

- [x] `@nan0web/auth-core@1.1.0` — AccessControl, Password, Session ✅ (18.02.2026)
  - README.md генерується коректно (знайдено і виправлено баг в `db-fs/saveMD`)
  - 89 unit tests + 15 docs tests = **104/104 pass**
- [ ] `@nan0web/auth-node@1.1.0` — делегує до auth-core (REQUESTS.md написано)
- [x] willni CLI → `import { AccessControl } from '@nan0web/auth-core'`

#### 8e: ui-cli Integration

Архітектура: `cli/system.md`

- [x] Terminal-інтерфейс до willni через `@nan0web/ui-cli`
- [x] Меню: Панель, Учасники, Вхід, Реєстрація, Оплата, Курс, Економіка
- [x] Session state (in-memory users[], currentUser)
- [x] i18n: uk/en з повним покриттям vocab
- [x] E2E тести: alignment, переклади, vocab completeness
- [x] `Logger.table()` з `prefix` та Unicode-aware `stringWidth()`
- [x] **Persistence (Фаза 1)**: `@nan0web/db-fs` адаптер
  - `saveUser/loadUsers` — YAML Golden Dataset `cli/data/users/*.yaml`
  - `savePayment` — `cli/data/payments/*.yaml`
  - `saveProgress/loadProgress` — `cli/data/progress/*.yaml`
  - Graceful fallback: `⚠ DB unavailable → memory-only mode`
  - Unit tests: `cli/db.test.mjs` (12 tests)
- [x] **Registration Protocol** (`cli/protocol.mjs`):
  - Configurable: `auto` | `confirm` × `moderate: true|false`
  - Transport-agnostic: email, phone, 2LW
  - Auto-login after register (when protocol = auto + no moderation)
  - Unit tests: `cli/protocol.test.mjs` (10 tests)
- [x] **Admin Panel** (`runAdmin`):
  - Verify user → save to DB
  - Confirm payment → auto-upgrade tier
  - Change tier → save to DB
- [x] **Payment → User linkage**:
  - Auto `userId = currentUser.email` when logged in
  - Warning when not logged in
- [x] **Visual polish**:
  - ASCII banner with box-drawing chars
  - Colored tiers: VIP(yellow), Mentor(magenta), Sub(cyan), Free(dim)
  - Colored verified status, styled course progress
- [ ] Profile: view own data, payment history
- [ ] `willni chat` — AI чат з терміналу

#### 8f: Server-Side Rendering

- [ ] `AuthServer` віддає `index.html` з `<ui-app>` shell
- [ ] `<script type="module">` завантажує ui-lit components
- [ ] SEO: серверний pre-render meta tags (title, description, og:\*)
- [ ] Vite для dev-mode HMR

#### Стек Phase 8:

```
Browser:
  @nan0web/ui-lit       Lit Web Components (ui-nav, ui-page, ui-markdown...)
  @nan0web/db-browser   Fetch JSON data від сервера
  @nan0web/auth-core    Browser-side auth (tokens, user state)
  @nan0web/i18n         Мультимовність (uk/en)

Server:
  @nan0web/auth-node    AuthServer (JWT, users)
  @nan0web/db-fs        Файлове сховище + MD as Data
  @nan0web/http-node    HTTP server + SSR shell

Build:
  Vite                  Dev server + HMR + production bundle
  scripts/md-to-json    MD → JSON конвертер
```

---

## 📁 Архітектура

### Поточна (VitePress, Phase 1-6)

```
willni/
  server/
    index.js          ← AuthServer + AI Chat (SSE) + Email + Payments
    package.json      ← { type: "module" }
    data/             ← DBFS файлове сховище (users, tokens)
  .vitepress/
    theme/
      auth.js         ← Централізована утиліта (tokens, API, reactive state)
      components/
        RegistrationForm.vue  ← signup → email → confirm → auto-login
        LoginForm.vue         ← signin → redirect
        AuthGate.vue          ← Bearer token guard + inline login
        ChatWidget.vue        ← AI chat (SSE streaming, floating widget) ☀️
        LandingPage.vue       ← Premium landing page
        CryptoPayment.vue     ← BTC/USDT payment page
        HomePage.vue          ← Home
        BackgroundScene.vue   ← Canvas animation
      custom.css      ← Premium стилі (dark + light, tables, typography)
  superintellect/
    start.md          ← Landing page (outreach)
    registration.md   ← Registration page
    login.md          ← Login page
    payment.md        ← Crypto payment page
  package.json        ← nan0web + nodemailer dependencies
```

### Цільова (nan0web Native, Phase 8)

```
willni/
  server/
    index.js          ← AuthServer + AI + Email + Payments + SSR shell
    data/             ← DBFS (users, tokens, content JSON)
  app/
    index.html        ← SPA shell (<ui-app>)
    src/
      index.js        ← Entry: UILit + db-browser + router
      components/
        ui-nav.js     ← Lit: навігація
        ui-sidebar.js ← Lit: бічна панель
        ui-page.js    ← Lit: layout
        ui-markdown.js← Lit: MD renderer
        ui-chat.js    ← Lit: AI chat (SSE)
        ui-auth.js    ← Lit: auth forms
        ui-payment.js ← Lit: crypto payments
      theme/
        tokens.css    ← CSS custom properties
        dark.css      ← Dark mode overrides
  content/
    *.md              ← Джерельні файли (MD)
  data/
    *.json            ← Згенеровані JSON документи ($content)
  scripts/
    md-to-json.js     ← Build: MD → JSON конвертер
```

## 📦 Залежності

```
# Server
@nan0web/auth-node  ^1.0.2   AuthServer (головний пакет)
@nan0web/auth-core  ^1.1.0   User, Role, AccessControl, Password, Session
@nan0web/http-node  ^1.0.1   Server, Router
@nan0web/http       ^1.0.1   HTTP protocol
@nan0web/db         ^1.2.2   DB base
@nan0web/db-fs      ^1.1.1   DBFS файловий драйвер
@nan0web/log        ^1.1.1   Logger
@nan0web/types      ^1.2.0   Type utilities
@nan0web/event      ^1.0.1   Event system
nodemailer          latest   Email verification & welcome

# Browser (Phase 8)
@nan0web/ui-lit     workspace  Lit Web Components
@nan0web/db-browser ^1.0.1     Browser DB client
@nan0web/i18n       ^1.0.0     Internationalization
lit                 ^3.3.1     Web Components framework
```

## 🔑 ENV Variables

```bash
# Required
CEREBRAS_API_KEY=...       # AI chat

# Optional (defaults shown)
PORT=3333                  # API server port
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3333

# Email (optional, dev mode = console log)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@willni.com
```
