# willni CLI — System

> One Logic, Many UI: ті самі моделі, термінальний інтерфейс.

## 📚 Системні інструкції платформи nan•web

> **⚠️ ОБОВ'ЯЗКОВО**: Перед будь-якою роботою ознайомтесь з документацією платформи.

### Головні документи

| Документ                 | Шлях                         | Що описує                                            |
| ------------------------ | ---------------------------- | ---------------------------------------------------- |
| **Система та Протоколи** | `nan.web/system.md`          | Компас Волі, код-стиль (no `;`, tabs), TDD, Lux UX   |
| **Архітектура**          | `nan.web/ARCHITECTURE.md`    | Recursive Micro-App, Flow.js (yield), Multi-Modal UI |
| **Пакети (огляд)**       | `nan.web/packages/system.md` | АрхіТехноМаг — принципи та голос платформи           |

### Пакети, що використовуються в CLI

| Пакет             | system.md                   | me.md                  | Призначення                       |
| ----------------- | --------------------------- | ---------------------- | --------------------------------- |
| `@nan0web/db`     | `packages/db/system.md`     | `packages/db/me.md`    | **Основна база даних** (UDA)      |
| `@nan0web/db-fs`  | `packages/db-fs/system.md`  | `packages/db-fs/me.md` | Адаптер файлової системи          |
| `@nan0web/ui-cli` | `packages/ui-cli/system.md` | —                      | InputAdapter, Form, Select        |
| `@nan0web/log`    | `packages/log/system.md`    | `packages/log/me.md`   | Logger, Table, stringWidth        |
| `@nan0web/i18n`   | `packages/i18n/system.md`   | `packages/i18n/me.md`  | getT(), I18nDb, vocabs            |
| `@nan0web/ui`     | `packages/ui/system.md`     | —                      | FormInput, TYPES, Model as Schema |
| `@nan0web/types`  | `packages/types/system.md`  | —                      | Type utilities                    |

### Як читати

Кожен пакет має:

- **`system.md`** — технічні правила та API контракти
- **`me.md`** — контекст пакету: хто він, що робить, внутрішні рішення
- **`README.md`** — публічна документація (генерується з `README.md.js`)

Всі шляхи відносно `/Users/i/src/nan.web/`.

---

## Архітектура

```
┌─────────────────────────────────────────────────┐
│                   CLI (main.mjs)                │
│  Menu, Forms, Tables, i18n                      │
├─────────────┬───────────────────────────────────┤
│  @nan0web/  │  ui-cli     InputAdapter, Form    │
│             │  log        Logger, Table          │
│             │  i18n       getT(), vocabs/        │
├─────────────┼───────────────────────────────────┤
│  @nan0web/  │  db         ← ОСНОВНА БАЗА ДАНИХ  │
│  Data Layer │             DB.get/set/fetch/model │
│             ├───────────────────────────────────┤
│             │  db-fs      ← адаптер для Node.js │
│             │             DBFS extends DB        │
│             │  db-browser ← адаптер для браузера │
│             │             (IndexedDB/fetch)      │
├─────────────┼───────────────────────────────────┤
│  Domain     │  models/    User, Payment, Series  │
│  Models     │             CourseProgress, Tier   │
│             │             revenue.js (1-33-33-33)│
└─────────────┴───────────────────────────────────┘
```

## Data Layer

**`@nan0web/db`** — це Universal Data Architecture (UDA).
Це основний інтерфейс для роботи з даними.

**`@nan0web/db-fs`** — це ЛИШЕ адаптер для файлової системи.
Так само як `db-browser` — адаптер для браузера.

CLI **працює з `DB`**, а не з `db-fs` напряму:

```js
import DB from '@nan0web/db'
import DBFS from '@nan0web/db-fs'

// Створюємо DB через адаптер fs
const db = new DBFS({ root: './data' })
await db.connect()

// Реєструємо моделі — DB знає як hydrate дані
db.model('users', User)
db.model('payments', Payment)

// CRUD — через УНІФІКОВАНИЙ DB API
await db.set('users/sovr', { name: 'Sovereign', ... })
const user = await db.get('users/sovr') // → User instance (hydrated)

// Той самий код працює з db-browser (IndexedDB):
// const db = new BrowserDB({ root: '/api/data' })
// await db.connect()
// db.model('users', User)
// await db.get('users/sovr') // → той самий User
```

Ключовий принцип: **код CLI не залежить від адаптера**.
Якщо завтра підключити `db-mongo` — зміниться лише один рядок: `new DBFS()` → `new MongoDB()`.

## Golden Dataset

Дані зберігаються за конвенцією:

```
data/
  users/
    sovr.yaml         ← User record
    artem.yaml
  payments/
    <uuid>.yaml       ← Payment record
  progress/
    <email>.yaml      ← CourseProgress
```

## Session State

CLI тримає в пам'яті:

- `session.users[]` — масив зареєстрованих користувачів
- `session.currentUser` — поточний залогінений користувач (null = адмін)

При запуску CLI читає дані з DB.
При реєстрації/оплаті — записує в DB.
Session — це in-memory кеш для швидкого доступу.

## i18n

Словник `vocabs/uk.mjs` — ключі англійські, значення українські.
Функція `t()` з `@nan0web/i18n` — lookup по ключу.

Всі рядки UI проходять через `t()`:

- Мітки меню, форм, таблиць
- Повідомлення валідації моделей
- Назви тієрів, статусів, серій курсу

## Тести

```bash
node --test cli/main.test.mjs    # e2e: alignment, i18n, vocab
node --test web/src/models/      # unit: models, validation
```

## Запуск

```bash
pnpm cli                         # інтерактивний режим
node cli/main.mjs --lang=uk      # українська мова
node cli/main.mjs --demo=dashboard  # одна команда
```
