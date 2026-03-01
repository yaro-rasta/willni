/**
 * willni CLI — Admin command
 *
 * Admin actions: verify user, confirm payment, change tier, reset password.
 * Access: user must be logged in with role "admin".
 * No second passphrase — role-based guard is sufficient.
 *
 * Auth helpers (hashPass, verifyPass) are exported for use
 * by login and register commands.
 *
 * Rate limit: 3 login attempts per 60s — persistent via audit.log.
 * Audit: all admin actions logged to cli/data/audit.log
 *
 * Custom salt: set WILLNI_SALT env var to add project-level
 * salt prefix to all password hashes.
 */

import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import Logger from "@nan0web/log";
import { PaymentStatus } from "../../web/src/models/Payment.js";
import { User } from "../../web/src/models/User.js";
import { saveUser, savePayment, loadPayments } from "../db.mjs";
import { tierLabel, styledTier, printUserCard } from "./helpers.mjs";
import { requireAdmin } from "./guard.mjs";

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60_000;

// ─── scrypt password hashing ──────────────────────────

const SCRYPT_KEYLEN = 32;
const SCRYPT_COST = { N: 16384, r: 8, p: 1 };

/**
 * Project-level salt prefix.
 * Set WILLNI_SALT env var for custom salt.
 * @type {string}
 */
const PROJECT_SALT = process.env.WILLNI_SALT || "";

/**
 * Hash a passphrase using scrypt with a random salt.
 * Returns "salt:hash" in hex format.
 * If WILLNI_SALT is set, it is prepended to the salt.
 * @param {string} plain
 * @returns {string}
 */
export function hashPass(plain) {
  const salt = randomBytes(16);
  const effectiveSalt = PROJECT_SALT
    ? Buffer.concat([Buffer.from(PROJECT_SALT), salt])
    : salt;
  const hash = scryptSync(plain, effectiveSalt, SCRYPT_KEYLEN, SCRYPT_COST);
  return salt.toString("hex") + ":" + hash.toString("hex");
}

/**
 * Verify a passphrase against a stored hash or plain value.
 * Timing-safe comparison to prevent timing attacks.
 *
 * @param {string} input
 * @param {string} stored - "salt:hash" hex or plain passphrase.
 * @returns {boolean}
 */
export function verifyPass(input, stored) {
  if (!input || !stored) return false;

  if (stored.includes(":")) {
    const [saltHex, hashHex] = stored.split(":");
    try {
      const salt = Buffer.from(saltHex, "hex");
      const effectiveSalt = PROJECT_SALT
        ? Buffer.concat([Buffer.from(PROJECT_SALT), salt])
        : salt;
      const expected = Buffer.from(hashHex, "hex");
      const derived = scryptSync(
        input,
        effectiveSalt,
        SCRYPT_KEYLEN,
        SCRYPT_COST,
      );
      return timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }

  // Fallback: plain text comparison (env var, legacy)
  const a = scryptSync(input, "compare-salt", SCRYPT_KEYLEN, SCRYPT_COST);
  const b = scryptSync(stored, "compare-salt", SCRYPT_KEYLEN, SCRYPT_COST);
  return timingSafeEqual(a, b);
}

// ─── Audit logging ────────────────────────────────────

/**
 * @param {object} ctx
 * @param {string} action
 * @param {string} target
 * @param {string} detail
 */
export async function audit(ctx, action, target, detail) {
  const { session } = ctx;
  if (!session.db) return;
  try {
    const dir = session.db.FS.resolve(session.db.cwd, session.db.root);
    const { existsSync, appendFileSync, mkdirSync } = session.db.FS;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const line = `${new Date().toISOString()} [${action}] ${target}: ${detail}\n`;
    appendFileSync(session.db.FS.resolve(dir, "audit.log"), line, "utf-8");
  } catch {
    // silently fail
  }
}

/**
 * Count recent AUTH_FAIL entries in audit.log.
 * @param {object} ctx
 * @returns {number}
 */
export function countRecentFailures(ctx) {
  const { session } = ctx;
  if (!session.db) return 0;
  try {
    const dir = session.db.FS.resolve(session.db.cwd, session.db.root);
    const filepath = session.db.FS.resolve(dir, "audit.log");
    const { existsSync, readFileSync } = session.db.FS;
    if (!existsSync(filepath)) return 0;
    const lines = readFileSync(filepath, "utf-8").split("\n");
    const cutoff = Date.now() - WINDOW_MS;
    return lines.filter((line) => {
      if (!line.includes("[AUTH_FAIL]")) return false;
      const ts = Date.parse(line.split(" [")[0]);
      return !isNaN(ts) && ts > cutoff;
    }).length;
  } catch {
    return 0;
  }
}

// ─── Admin hash persistence (legacy, kept for compat) ─

export function loadAdminHash(db) {
  if (!db) return null;
  try {
    const dir = db.FS.resolve(db.cwd, db.root);
    const filepath = db.FS.resolve(dir, "admin.hash");
    if (!db.FS.existsSync(filepath)) return null;
    return db.FS.readFileSync(filepath, "utf-8").trim() || null;
  } catch {
    return null;
  }
}

export function saveAdminHash(db, hash) {
  if (!db) return;
  try {
    const dir = db.FS.resolve(db.cwd, db.root);
    if (!db.FS.existsSync(dir)) db.FS.mkdirSync(dir, { recursive: true });
    db.FS.writeFileSync(db.FS.resolve(dir, "admin.hash"), hash, "utf-8");
  } catch {
    // silently fail
  }
}

// ─── Admin command ────────────────────────────────────

/**
 * @param {object} ctx
 */
export async function runAdmin(ctx) {
  const { console, adapter, t, session } = ctx;

  console.clear();
  console.success(Logger.style(`👑 ${t("Admin Panel")}`, { bold: true }));
  console.info("");

  // ─── Guard: must be logged in with admin role ────
  if (!requireAdmin(ctx)) return;

  await audit(ctx, "ADMIN_ACCESS", session.currentUser.email, "panel opened");

  // ─── Action menu (ESC returns here, not to main menu) ───
  while (true) {
    const actions = [
      { name: t("Verify user"), value: "verify" },
      { name: t("Confirm payment"), value: "confirm-payment" },
      { name: t("Change tier"), value: "change-tier" },
      { name: t("Reset user password"), value: "reset-password" },
      { name: `← ${t("Back")}`, value: "back" },
    ];

    let action;
    try {
      const result = await adapter.requestSelect({
        title: t("Admin action:"),
        options: actions.map((a) => a.name),
        console,
      });
      action = actions.find((a) => a.name === result.value)?.value || "back";
    } catch {
      return; // ESC from action menu → return to main
    }

    if (action === "back") return;

    try {
      // ─── Verify user ─────────────────────────────────
      if (action === "verify") {
        const unverified = session.users.filter((u) => !u.verified);
        if (unverified.length === 0) {
          console.info(t("All users are verified"));
          continue;
        }
        const options = unverified.map((u) => `${u.name} <${u.email}>`);
        const sel = await adapter.requestSelect({
          title: t("Select user to verify:"),
          options,
          console,
        });
        const idx = options.indexOf(sel.value);
        if (idx >= 0) {
          const user = unverified[idx];
          user.verified = true;
          if (session.db) await saveUser(session.db, user);
          await audit(ctx, "VERIFY", user.email, "verified by admin");
          console.info("");
          console.success(`${t("User verified:")} ${user.name}`);
          printUserCard(console, t, user);
        }
      }

      // ─── Confirm payment ─────────────────────────────
      if (action === "confirm-payment") {
        let payments = [];
        if (session.db) {
          payments = await loadPayments(
            session.db,
            (p) => p.status === PaymentStatus.PENDING,
          );
        }

        if (payments.length === 0) {
          console.info(t("No pending payments"));
          continue;
        }

        const options = payments.map(
          (p) =>
            `${p.id.slice(0, 8)}… | ${p.userId || "?"} | ${p.amount} ${p.method} → ${tierLabel(t, p.tier)}`,
        );
        const sel = await adapter.requestSelect({
          title: t("Select payment to confirm:"),
          options,
          console,
        });
        const idx = options.indexOf(sel.value);
        if (idx >= 0) {
          const payment = payments[idx];
          payment.status = PaymentStatus.CONFIRMED;

          if (session.db) await savePayment(session.db, payment);
          await audit(
            ctx,
            "CONFIRM_PAY",
            payment.id,
            `userId=${payment.userId} amount=${payment.amount} tier=${payment.tier}`,
          );

          console.info("");
          console.success(`${t("Payment confirmed:")} ${payment.id}`);

          // Auto-upgrade tier
          if (payment.userId) {
            const user = session.users.find((u) => u.email === payment.userId);
            if (user) {
              const oldTier = user.tier;
              user.tier = payment.tier;
              if (session.db) await saveUser(session.db, user);
              await audit(
                ctx,
                "TIER_UPGRADE",
                user.email,
                `${oldTier} → ${payment.tier}`,
              );
              console.success(
                `  ${user.name}: ${tierLabel(t, oldTier)} → ${styledTier(t, user.tier)}`,
              );
            }
          }
        }
      }

      // ─── Change tier ─────────────────────────────────
      if (action === "change-tier") {
        if (session.users.length === 0) {
          console.info(t("No members yet. Register first."));
          continue;
        }
        const options = session.users.map(
          (u) => `${u.name} <${u.email}> [${tierLabel(t, u.tier)}]`,
        );
        const sel = await adapter.requestSelect({
          title: t("Select user:"),
          options,
          console,
        });
        const idx = options.indexOf(sel.value);
        if (idx >= 0) {
          const user = session.users[idx];
          const tierOptions = User.schema.tier.options.map((o) => t(o.label));
          const tierSel = await adapter.requestSelect({
            title: t("New tier:"),
            options: tierOptions,
            console,
          });
          const tierIdx = tierOptions.indexOf(tierSel.value);
          if (tierIdx >= 0) {
            const oldTier = user.tier;
            user.tier = User.schema.tier.options[tierIdx].value;
            if (session.db) await saveUser(session.db, user);
            await audit(
              ctx,
              "TIER_CHANGE",
              user.email,
              `${oldTier} → ${user.tier}`,
            );
            console.info("");
            console.success(
              `${user.name}: ${tierLabel(t, oldTier)} → ${styledTier(t, user.tier)}`,
            );
          }
        }
      }

      // ─── Reset user password ─────────────────────────
      if (action === "reset-password") {
        if (session.users.length === 0) {
          console.info(t("No members yet. Register first."));
          continue;
        }
        const options = session.users.map((u) => `${u.name} <${u.email}>`);
        const sel = await adapter.requestSelect({
          title: t("Select user:"),
          options,
          console,
        });
        const idx = options.indexOf(sel.value);
        if (idx >= 0) {
          const user = session.users[idx];

          const p1 = await adapter.requestInput({
            prompt: `${t("New password for")} ${user.name}: `,
            type: "password",
          });
          if (p1.cancelled) continue;

          if (!p1.value || p1.value.length < 4) {
            console.error(t("Password too short (min 4 chars)"));
            continue;
          }

          user.passwordHash = hashPass(p1.value);
          if (session.db) await saveUser(session.db, user);
          await audit(
            ctx,
            "PASSWORD_RESET",
            user.email,
            "password reset by admin",
          );
          console.info("");
          console.success(`${t("Password reset for")} ${user.name}`);
        }
      }
    } catch {
      // ESC from sub-action → return to admin action menu
      console.info(Logger.style(`  ← ${t("Back")}`, { color: Logger.DIM }));
      continue;
    }
  }
}
