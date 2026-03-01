#!/usr/bin/env node

/**
 * willni CLI — Воля і Я
 *
 * Model as Schema + ui-cli + @nan0web/db
 * One Logic, Many UI: same domain models, terminal interface.
 *
 * Data Layer:
 *   @nan0web/db    — основний інтерфейс (UDA)
 *   @nan0web/db-fs — адаптер файлової системи
 *   Golden Dataset: cli/data/{users,payments,progress}/*.yaml
 *
 * Protocol:
 *   register: 'auto' | 'confirm'  — post-registration flow
 *   moderate: true | false         — require admin verify
 *
 * Security:
 *   AccessControl: data-driven, .access + .group files
 *   Session: persisted to cli/data/session.json
 *   Passwords: scrypt with optional WILLNI_SALT
 *
 * Usage:
 *   node cli/main.mjs
 *   node cli/main.mjs --demo=register
 *   node cli/main.mjs --lang=uk
 */

import process from "node:process";
import { readFileSync } from "node:fs";
import Logger from "@nan0web/log";
import CLiInputAdapter from "@nan0web/ui-cli";
import getT, { localesMap } from "./vocabs/index.mjs";
import { initDB, seed, userSlug } from "./db.mjs";
import { DEFAULT_PROTOCOL } from "./protocol.mjs";
import { saveSession, loadSession, clearSession } from "./session.mjs";
import { AccessControl } from "@nan0web/auth-core";
import {
  banner,
  runLogin,
  runRegister,
  runMembers,
  runPayment,
  runAdmin,
  runCourse,
  runEconomy,
  runDashboard,
  runProfile,
  runVerse,
} from "./commands/index.mjs";

const console = new Logger({ level: "info" });
let adapter = new CLiInputAdapter({ console });

// ─── Data dir ──────────────────────────────────────────

const DATA_DIR = new URL("./data", import.meta.url).pathname;

// ─── Protocol Config ───────────────────────────────────

const protocol = { ...DEFAULT_PROTOCOL };

// ─── Command registry ──────────────────────────────────

const commands = {
  dashboard: runDashboard,
  members: runMembers,
  login: runLogin,
  profile: runProfile,
  register: runRegister,
  payment: runPayment,
  course: runCourse,
  economy: runEconomy,
  admin: runAdmin,
  verse: runVerse,
};

// ─── Session State ─────────────────────────────────────

const session = {
  /** @type {import('../web/src/models/User.js').User[]} */
  users: [],
  /** @type {import('../web/src/models/User.js').User|null} */
  currentUser: null,
  /** @type {import('@nan0web/db-fs').default} */
  db: null,
};

// ─── Load nav.yaml ─────────────────────────────────────

/**
 * Minimal YAML list parser for nav.yaml
 * Handles only simple key: value pairs in list items
 * @param {string} content
 * @returns {Array<{path: string, icon?: string, guest?: boolean, dynamic?: boolean, bold?: boolean}>}
 */
function parseNavYaml(content) {
  const items = [];
  let current = null;
  for (const line of content.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (line.startsWith("- ")) {
      if (current) items.push(current);
      current = {};
      const kv = line.slice(2).trim();
      const [key, ...rest] = kv.split(": ");
      current[key] = parseYamlValue(rest.join(": "));
    } else if (line.startsWith("  ") && current) {
      const kv = line.trim();
      const [key, ...rest] = kv.split(": ");
      current[key] = parseYamlValue(rest.join(": "));
    }
  }
  if (current) items.push(current);
  return items;
}

/** @param {string} val */
function parseYamlValue(val) {
  if (val === "true") return true;
  if (val === "false") return false;
  // strip quotes
  if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
  return val;
}

// ─── Main Loop ─────────────────────────────────────────

async function main() {
  process.on("SIGINT", () => {
    console.info("\n" + Logger.style("Bye!", { color: Logger.YELLOW }));
    process.exit(0);
  });

  const args = process.argv.slice(2).reduce((acc, arg) => {
    if (arg.startsWith("--demo=")) acc.demo = arg.split("=")[1];
    if (arg.startsWith("--lang=")) acc.lang = arg.split("=")[1];
    return acc;
  }, {});

  console.clear();
  banner(console);

  // ── AccessControl init ──
  const ac = new AccessControl();
  try {
    const accessContent = readFileSync(
      new URL("./data/.access", import.meta.url).pathname,
      "utf-8",
    );
    const groupContent = readFileSync(
      new URL("./data/.group", import.meta.url).pathname,
      "utf-8",
    );
    ac.load(accessContent, groupContent);
  } catch (err) {
    // defaults apply
  }

  // ── Nav data ──
  let navItems;
  try {
    const navContent = readFileSync(
      new URL("./data/nav.yaml", import.meta.url).pathname,
      "utf-8",
    );
    navItems = parseNavYaml(navContent);
  } catch {
    // Fallback: minimal nav
    navItems = [
      { path: "/login", guest: true },
      { path: "/course" },
      { path: "/exit" },
    ];
  }

  // ── DB init ──
  try {
    session.db = await initDB();
    session.users = await seed(session.db);
    console.info(
      Logger.style(`  💾 DB: ${session.db.toString()}`, { color: Logger.DIM }),
    );
    console.info(
      Logger.style(`  👥 ${session.users.length} members`, {
        color: Logger.DIM,
      }),
    );

    // ── Restore session ──
    const saved = loadSession(session.db, session.users);
    if (saved.email) {
      session.currentUser = session.users.find((u) => u.email === saved.email);
      if (session.currentUser) {
        console.info(
          Logger.style(`  🔑 ${session.currentUser.name} (${saved.email})`, {
            color: Logger.GREEN,
          }),
        );
      }
    }

    console.info("");
  } catch (err) {
    console.info(
      Logger.style(`  ⚠ DB unavailable: ${err.message}`, {
        color: Logger.YELLOW,
      }),
    );
    console.info(
      Logger.style("  Running in memory-only mode\n", { color: Logger.DIM }),
    );
  }

  // ── Language selection ──
  let locale = args.lang;
  if (!locale && !process.env.PLAY_DEMO_SEQUENCE) {
    const result = await adapter.requestSelect({
      title: "Choose language / Обери мову:",
      options: Array.from(localesMap.values()),
      limit: Math.max(5, (process.stdout.rows || 24) - 6),
      console,
    });
    const langChoice = result.value;
    if (langChoice) {
      for (const [code, name] of localesMap.entries()) {
        if (name === langChoice) {
          locale = code;
          break;
        }
      }
    }
  }
  if (!locale) locale = process.env.LANG?.split("_")[0] || "en";
  if (!localesMap.has(locale)) locale = "en";

  let t = getT(locale);
  adapter.t = t;

  /** @type {{ console: Logger, adapter: CLiInputAdapter, t: Function, session: object, protocol: object, config: object, ac: AccessControl }} */
  const ctx = {
    console,
    adapter,
    t,
    session,
    protocol,
    ac,
    config: {
      adminPass: process.env.WILLNI_ADMIN_PASS || "",
    },
  };

  let firstRun = true;

  while (true) {
    try {
      const loggedIn = !!session.currentUser;
      const slug = loggedIn ? userSlug(session.currentUser.email) : null;
      const isAdmin = loggedIn && session.currentUser.roles?.includes("admin");
      const rolePrefix = isAdmin
        ? Logger.style(`[${t("Admin")}] `, { color: Logger.YELLOW, bold: true })
        : loggedIn
          ? Logger.style(`[${session.currentUser.name}] `, {
              color: Logger.CYAN,
            })
          : "";

      // ─── Data-driven menu via AccessControl ──────
      const visibleNav = ac.filterNav(navItems, slug);
      const demos = visibleNav.map((item) => {
        const key = item.path.slice(1); // "/dashboard" → "dashboard"
        let label = t(key.charAt(0).toUpperCase() + key.slice(1));

        // Dynamic items
        if (item.dynamic && session.currentUser) {
          label = `${label}: ${session.currentUser.name}`;
        }

        // Icon + styling
        if (item.icon) label = `${item.icon} ${label}`;
        if (item.bold) label = Logger.style(label, { bold: true });

        return { name: label, value: key };
      });

      let demo;
      if (firstRun && args.demo) {
        demo = args.demo;
      } else {
        const result = await adapter.requestSelect({
          title: `${rolePrefix}${t("Choose action:")}`,
          options: demos.map((d) => d.name),
          limit: Math.max(5, (process.stdout.rows || 24) - 6),
          console,
        });
        const sel = demos.find((d) => d.name === result.value);
        demo = sel ? sel.value : "exit";
      }

      if (demo === "exit") {
        console.success(t("We live by Will"));
        break;
      }

      if (demo === "logout") {
        session.currentUser = null;
        clearSession(session.db);
        console.success(t("Logged out"));
        continue;
      }

      const command = commands[demo];
      if (command) {
        await command(ctx);

        // ── Auto-save session after login ──
        if (session.currentUser) {
          saveSession(session.db, session);
        }
      }

      if (firstRun && args.demo) break;

      firstRun = false;

      console.info(
        "\n" + Logger.style("─".repeat(50), { color: Logger.DIM }) + "\n",
      );
    } catch (error) {
      if (
        error.message?.includes("cancel") ||
        error.message?.includes("Cancelled")
      ) {
        console.info(Logger.style(t("Back to menu..."), { color: Logger.DIM }));
        continue;
      }
      console.error(error);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
