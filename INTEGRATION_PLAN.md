# Will-n-i → nan0web Integration Plan

> Дата: 2026-02-17
> Статус: **Phase 1 DONE** — Повна міграція на nan0web
> Стратегія: Пряме використання nan0web пакетів (AuthServer, DBFS, http-node)

---

## 📊 Поточний Стан

| Компонент  | Стек                              | Статус                       |
| ---------- | --------------------------------- | ---------------------------- |
| Сайт       | VitePress + Vue 3                 | ✅ Працює                    |
| Auth API   | **@nan0web/auth-node AuthServer** | ✅ Повністю працює           |
| Реєстрація | Google Form + fallback Vue form   | ⚠️ Потрібна інтеграція з API |
| AI Чат     | —                                 | ❌ Відсутній                 |
| Платежі    | —                                 | ❌ Відсутній                 |
| Email      | —                                 | ❌ Відсутній                 |
| Дизайн     | VitePress theme + custom CSS      | ⚠️ Потрібен фікс light theme |

## 🏗️ Архітектура (nan0web Platform)

```
┌─────────────────────────────────────────────┐
│  willni (VitePress)                         │
│  ┌──────────────────────────────────────┐   │
│  │ .vitepress/theme/components/         │   │
│  │  ├── RegistrationForm.vue (REWRITE)  │   │
│  │  ├── AuthGate.vue (REWRITE)          │   │
│  │  ├── ChatWidget.vue (NEW)            │   │
│  │  └── PaymentForm.vue (NEW)           │   │
│  └──────────────────────────────────────┘   │
│                    ↕ HTTP API                │
│  ┌──────────────────────────────────────┐   │
│  │ server/index.js                      │   │
│  │  = AuthServer (@nan0web/auth-node)   │   │
│  │  + CORS middleware                   │   │
│  │  + Health endpoint                   │   │
│  │                                      │   │
│  │ Built-in nan0web features:           │   │
│  │  ├── AuthDB (DBFS file storage)      │   │
│  │  ├── TokenManager (JWT-like tokens)  │   │
│  │  ├── TokenRotationRegistry           │   │
│  │  ├── RateLimiter                     │   │
│  │  ├── AccessControl                   │   │
│  │  └── Router + Server (http-node)     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Стратегія: nan0web-native

Замість обгорток і адаптерів — пряме використання пакетів nan0web:

- **AuthServer** обслуговує всі auth-ендпоінти "з коробки"
- **DBFS** зберігає дані в файловій системі
- **Router** з `@nan0web/http-node` для маршрутизації
- **Server** для HTTP з middleware підтримкою
- Додаткові маршрути додаються напряму через `server.get()`, `server.post()`

---

## Phase 1: Auth Integration (✅ DONE)

### Що зроблено:

- [x] `server/index.js` — AuthServer на nan0web платформі
- [x] Всі auth-ендпоінти працюють нативно:
  - `POST /auth/signup` — реєстрація
  - `PUT /auth/signup/:username` — підтвердження (код верифікації)
  - `POST /auth/signin/:username` — логін
  - `GET /auth/signin/:username` — отримання даних користувача
  - `PUT /auth/refresh/:token` — оновлення токенів
  - `POST /auth/forgot/:username` — запит скидання паролю
  - `PUT /auth/forgot/:username` — скидання паролю
  - `DELETE /auth/signin/:username` — логаут
- [x] CORS middleware для VitePress dev-сервера
- [x] Health check endpoint (`GET /health`)
- [x] Файлове сховище (`server/data/`)
- [x] npm scripts: `dev:server`, `dev:all`

### Видалено (більше не потрібно):

- ~~`server/auth-setup.js`~~ — AuthServer робить все сам
- ~~Custom HTTP server з `node:http`~~ — замінений на `@nan0web/http-node` Server
- ~~Custom routing~~ — Router з http-node
- ~~`getShortHash` bridge~~ — AuthServer має нативну реалізацію
- ~~AuthApp + TokenManager manual init~~ — AuthServer ініціалізує все автоматично

### API Routes Reference:

```
POST /auth/signup                 { username, email, password }
PUT  /auth/signup/:username       { code }
POST /auth/signin/:username       { password }
GET  /auth/signin/:username       Authorization: Bearer <token>
PUT  /auth/refresh/:token         (no body)
POST /auth/forgot/:username       (no body)
PUT  /auth/forgot/:username       { code, newPassword }
DELETE /auth/signup/:username     Authorization: Bearer <token>
DELETE /auth/signin/:username     Authorization: Bearer <token>
GET  /health                      → { status, platform, uptime }
```

---

## Phase 2: Vue Integration + Design Fix

### 2.1 RegistrationForm.vue → Auth API

Замінити Google Form redirect на вбудовану форму:

```javascript
// Signup
fetch("/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, email, password }),
});

// Confirm
fetch(`/auth/signup/${username}`, {
  method: "PUT",
  body: JSON.stringify({ code }),
});

// Login
fetch(`/auth/signin/${username}`, {
  method: "POST",
  body: JSON.stringify({ password }),
});
```

### 2.2 AuthGate.vue → Token Auth

```javascript
fetch(`/auth/signin/${username}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 2.3 Fix Light Theme CSS

### Deliverables Phase 2:

- [ ] Rewrite `RegistrationForm.vue` — signup/confirm/login форми
- [ ] Rewrite `AuthGate.vue` — JWT-based auth gate
- [ ] Fix light-theme CSS
- [ ] Course page table readability

---

## Phase 3: AI Chat (sun.app / @nan0web/ai)

Плаваючий чат-віджет з AI-помічником для курсу.

```javascript
server.post("/chat", async (req, res) => {
  // @nan0web/ai integration
});
```

---

## Phase 4: Payments

Stripe Integration ($99/mo subscription) + BTC VIP.

---

## Phase 5: Email Confirmation

NodeMailer або @nan0web/mail для відправки верифікаційних кодів.

---

## 🚀 Наступні Кроки

1. **Phase 2**: Оновити Vue-компоненти для API інтеграції
2. **CSS Fix**: Light theme readability
3. **Phase 3**: AI чат-віджет
