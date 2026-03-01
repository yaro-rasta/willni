/**
 * willni CLI — Data Layer
 *
 * @nan0web/db    ← основний інтерфейс (UDA)
 * @nan0web/db-fs ← адаптер для файлової системи
 *
 * NOTE: db.model() is not yet published (>1.2.2).
 * Hydration is done manually with Model.from() until
 * the next @nan0web/db release.
 *
 * Golden Dataset convention: data/{collection}/{slug}.yaml
 */

import DBFS from "@nan0web/db-fs";
import { User } from "../web/src/models/User.js";
import { Payment } from "../web/src/models/Payment.js";
import { CourseProgress } from "../web/src/models/CourseProgress.js";
import { Tier } from "../web/src/models/Tier.js";
import { hashPass } from "./commands/admin.mjs";

const DATA_ROOT = new URL("./data", import.meta.url).pathname;

/** @type {DBFS} */
let db;

/**
 * Initialize DB: connect.
 * @returns {Promise<DBFS>}
 */
export async function initDB() {
  db = new DBFS({ root: DATA_ROOT });
  await db.connect();
  return db;
}

/**
 * Seed demo data if users collection is empty.
 * Default demo password: 1234
 * @param {DBFS} db
 * @returns {Promise<User[]>}
 */
export async function seed(db) {
  const existing = await loadUsers(db);
  if (existing.length > 0) return existing;

  const demoPass = hashPass("1234");

  const demoUsers = [
    new User({
      name: "Sovereign",
      email: "sovr@yaro.page",
      tier: Tier.VIP,
      verified: true,
      roles: ["u", "admin"],
      passwordHash: demoPass,
    }),
    new User({
      name: "Artem",
      email: "artem@x.com",
      tier: Tier.SUBSCRIPTION,
      passwordHash: demoPass,
    }),
    new User({
      name: "Maria",
      email: "maria@y.com",
      tier: Tier.FREE,
      passwordHash: demoPass,
    }),
    new User({
      name: "Dmytro",
      email: "dmytro@z.com",
      tier: Tier.MENTOR,
      verified: true,
      passwordHash: demoPass,
    }),
  ];

  for (const user of demoUsers) {
    await saveUser(db, user);
  }

  return demoUsers;
}

// ─── Generic collection loader ────────────────────────

/**
 * Load all YAML documents from a collection directory.
 * Generic version — used by loadUsers, loadPayments, etc.
 *
 * @param {DBFS} db
 * @param {string} collection - e.g. 'users', 'payments', 'progress'
 * @param {Function} Model - Class with static from(data) for hydration
 * @param {(data: any) => boolean} [filter] - optional filter predicate
 * @returns {Promise<any[]>}
 */
export async function loadCollection(db, collection, Model, filter) {
  const items = [];
  try {
    const dir = db.FS.resolve(db.cwd, db.root, collection);
    const { existsSync, readdirSync } = db.FS;
    if (!existsSync(dir)) return items;

    const files = readdirSync(dir).filter((f) => f.endsWith(".yaml"));
    for (const file of files) {
      const data = await db.loadDocument(`${collection}/${file}`);
      if (data) {
        const instance = Model.from ? Model.from(data) : new Model(data);
        if (!filter || filter(instance)) {
          items.push(instance);
        }
      }
    }
  } catch {
    // directory doesn't exist yet → empty
  }
  return items;
}

// ─── Slug helper ───────────────────────────────────────

/**
 * User slug from email: sovr@yaro.page → sovr
 * @param {string} email
 * @returns {string}
 */
export function userSlug(email) {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "_");
}

// ─── User CRUD ─────────────────────────────────────────

/**
 * Serialize User to plain object for YAML storage.
 * @param {User} user
 * @returns {object}
 */
function userToPlain(user) {
  return {
    name: user.name,
    email: user.email,
    tier: user.tier,
    verified: user.verified,
    roles: user.roles,
    createdAt: user.createdAt,
  };
}

/**
 * Save user to DB.
 * @param {DBFS} db
 * @param {User} user
 * @returns {Promise<void>}
 */
export async function saveUser(db, user) {
  const slug = userSlug(user.email);
  await db.saveDocument(`users/${slug}.yaml`, userToPlain(user));
}

/**
 * Load all users from DB.
 * @param {DBFS} db
 * @returns {Promise<User[]>}
 */
export async function loadUsers(db) {
  return loadCollection(db, "users", User, (u) => !!u.email);
}

// ─── Payment CRUD ──────────────────────────────────────

/**
 * Serialize Payment to plain object for YAML storage.
 * @param {Payment} payment
 * @returns {object}
 */
function paymentToPlain(payment) {
  return {
    id: payment.id,
    userId: payment.userId,
    tier: payment.tier,
    method: payment.method,
    amount: payment.amount,
    txHash: payment.txHash,
    status: payment.status,
    createdAt: payment.createdAt,
  };
}

/**
 * Save payment to DB.
 * @param {DBFS} db
 * @param {Payment} payment
 * @returns {Promise<void>}
 */
export async function savePayment(db, payment) {
  await db.saveDocument(`payments/${payment.id}.yaml`, paymentToPlain(payment));
}

/**
 * Load all payments from DB.
 * @param {DBFS} db
 * @param {(p: Payment) => boolean} [filter]
 * @returns {Promise<Payment[]>}
 */
export async function loadPayments(db, filter) {
  return loadCollection(db, "payments", Payment, filter);
}

// ─── Progress CRUD ─────────────────────────────────────

/**
 * Save course progress to DB.
 * @param {DBFS} db
 * @param {CourseProgress} progress
 * @returns {Promise<void>}
 */
export async function saveProgress(db, progress) {
  const slug = userSlug(progress.userId);
  const data = {
    userId: progress.userId,
    currentSeries: progress.currentSeries,
    completedSeries: progress.completedSeries,
    startedAt: progress.startedAt,
  };
  await db.saveDocument(`progress/${slug}.yaml`, data);
}

/**
 * Load course progress for user.
 * @param {DBFS} db
 * @param {string} userId (email)
 * @returns {Promise<CourseProgress|null>}
 */
export async function loadProgress(db, userId) {
  const slug = userSlug(userId);
  try {
    const data = await db.loadDocument(`progress/${slug}.yaml`);
    return data ? CourseProgress.from(data) : null;
  } catch {
    return null;
  }
}

export { db };
