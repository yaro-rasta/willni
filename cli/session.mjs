/**
 * willni CLI — Session persistence
 *
 * Saves current session (logged-in user email) to disk.
 * Restores on startup so the user stays logged in between runs.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Save session to disk.
 * @param {import('@nan0web/db-fs').default} db
 * @param {{ currentUser: { email: string } | null }} session
 */
export function saveSession(db, session) {
  if (!db) return;
  try {
    const dir = db.FS.resolve(db.cwd, db.root);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const filepath = db.FS.resolve(dir, "session.json");
    const data = {
      email: session.currentUser?.email || null,
      savedAt: Date.now(),
    };
    writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // silently fail — session is non-critical
  }
}

/**
 * Load session from disk.
 * @param {import('@nan0web/db-fs').default} db
 * @param {import('../../web/src/models/User.js').User[]} users
 * @returns {{ email: string | null }}
 */
export function loadSession(db, users) {
  if (!db) return { email: null };
  try {
    const dir = db.FS.resolve(db.cwd, db.root);
    const filepath = db.FS.resolve(dir, "session.json");
    if (!existsSync(filepath)) return { email: null };
    const data = JSON.parse(readFileSync(filepath, "utf-8"));
    // Verify user still exists
    const user = users.find((u) => u.email === data.email);
    return { email: user ? data.email : null };
  } catch {
    return { email: null };
  }
}

/**
 * Clear session file.
 * @param {import('@nan0web/db-fs').default} db
 */
export function clearSession(db) {
  if (!db) return;
  try {
    const dir = db.FS.resolve(db.cwd, db.root);
    const filepath = db.FS.resolve(dir, "session.json");
    if (existsSync(filepath)) writeFileSync(filepath, "{}", "utf-8");
  } catch {
    // silently fail
  }
}
