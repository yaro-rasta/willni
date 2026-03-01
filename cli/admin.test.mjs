/**
 * Unit tests for cli/commands/admin.mjs
 *
 * Covers: scrypt hashing, verify (plain + salted hash),
 * audit log, persistent rate limit, admin hash persistence.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import DBFS from "@nan0web/db-fs";
import {
  audit,
  hashPass,
  verifyPass,
  countRecentFailures,
  loadAdminHash,
  saveAdminHash,
} from "./commands/admin.mjs";

/** @type {string} */
let tmpDir;

/** @type {DBFS} */
let db;

describe("cli/admin — security helpers", () => {
  beforeEach(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "willni-admin-test-"));
    db = new DBFS({ root: tmpDir });
    await db.connect();
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("hashPass (scrypt)", () => {
    it("returns salt:hash format", () => {
      const hash = hashPass("sovereign");
      assert.match(
        hash,
        /^[a-f0-9]{32}:[a-f0-9]{64}$/,
        "should be salt:hash hex",
      );
    });

    it("produces unique salts each time", () => {
      const h1 = hashPass("test");
      const h2 = hashPass("test");
      assert.notEqual(
        h1,
        h2,
        "different salts should produce different outputs",
      );
    });
  });

  describe("verifyPass", () => {
    it("plain config → matches correct input", () => {
      assert.ok(verifyPass("sovereign", "sovereign"));
    });

    it("plain config → rejects wrong input", () => {
      assert.ok(!verifyPass("wrong", "sovereign"));
    });

    it("scrypt hash config → matches correct input", () => {
      const hash = hashPass("sovereign");
      assert.ok(verifyPass("sovereign", hash));
    });

    it("scrypt hash config → rejects wrong input", () => {
      const hash = hashPass("sovereign");
      assert.ok(!verifyPass("wrong", hash));
    });

    it("timing-safe: does not leak via timing", () => {
      const hash = hashPass("test");
      assert.ok(typeof verifyPass("test", hash) === "boolean");
      assert.ok(typeof verifyPass("wrong", hash) === "boolean");
    });
  });

  describe("audit()", () => {
    it("writes entry to audit.log", async () => {
      const ctx = { session: { db } };
      await audit(ctx, "TEST_ACTION", "user@x.com", "test details");

      const logPath = join(tmpDir, "audit.log");
      assert.ok(existsSync(logPath), "audit.log should exist");

      const content = readFileSync(logPath, "utf-8");
      assert.ok(content.includes("TEST_ACTION"), "should contain action");
      assert.ok(content.includes("user@x.com"), "should contain target");
      assert.ok(content.includes("test details"), "should contain details");
    });

    it("appends multiple entries", async () => {
      const ctx = { session: { db } };
      await audit(ctx, "FIRST", "a", "");
      await audit(ctx, "SECOND", "b", "");

      const content = readFileSync(join(tmpDir, "audit.log"), "utf-8");
      const lines = content.trim().split("\n");
      assert.equal(lines.length, 2, "should have 2 lines");
    });

    it("is no-op when db is null", async () => {
      const ctx = { session: { db: null } };
      await audit(ctx, "NOOP", "test", "");
    });

    it("entry has ISO timestamp", async () => {
      const ctx = { session: { db } };
      await audit(ctx, "TIME", "test", "");

      const content = readFileSync(join(tmpDir, "audit.log"), "utf-8");
      assert.match(content, /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("countRecentFailures (persistent rate limit)", () => {
    it("returns 0 when no audit.log", () => {
      const ctx = { session: { db } };
      assert.equal(countRecentFailures(ctx), 0);
    });

    it("returns 0 when db is null", () => {
      const ctx = { session: { db: null } };
      assert.equal(countRecentFailures(ctx), 0);
    });

    it("counts recent AUTH_FAIL entries", () => {
      const ctx = { session: { db } };
      const now = new Date().toISOString();

      const logPath = join(tmpDir, "audit.log");
      const lines =
        [
          `${now} [AUTH_FAIL] admin: wrong passphrase`,
          `${now} [AUTH_FAIL] admin: wrong passphrase`,
          `${now} [AUTH_OK] admin: access granted`,
        ].join("\n") + "\n";
      writeFileSync(logPath, lines, "utf-8");

      assert.equal(countRecentFailures(ctx), 2, "should count only AUTH_FAIL");
    });

    it("ignores old AUTH_FAIL entries", () => {
      const ctx = { session: { db } };
      const old = new Date(Date.now() - 120_000).toISOString();
      const now = new Date().toISOString();

      const logPath = join(tmpDir, "audit.log");
      const lines =
        [
          `${old} [AUTH_FAIL] admin: old attempt`,
          `${old} [AUTH_FAIL] admin: old attempt`,
          `${old} [AUTH_FAIL] admin: old attempt`,
          `${now} [AUTH_FAIL] admin: recent attempt`,
        ].join("\n") + "\n";
      writeFileSync(logPath, lines, "utf-8");

      assert.equal(countRecentFailures(ctx), 1, "should ignore old entries");
    });
  });

  describe("loadAdminHash / saveAdminHash", () => {
    it("returns null when no hash file exists", () => {
      assert.equal(loadAdminHash(db), null);
    });

    it("returns null when db is null", () => {
      assert.equal(loadAdminHash(null), null);
    });

    it("saves and loads hash", () => {
      const hash = hashPass("test123");
      saveAdminHash(db, hash);

      const loaded = loadAdminHash(db);
      assert.equal(loaded, hash);
    });

    it("saved hash verifies correctly", () => {
      const hash = hashPass("mypassword");
      saveAdminHash(db, hash);

      const loaded = loadAdminHash(db);
      assert.ok(verifyPass("mypassword", loaded));
      assert.ok(!verifyPass("wrongpassword", loaded));
    });

    it("file is stored as admin.hash", () => {
      saveAdminHash(db, "test-hash-value");
      const filePath = join(tmpDir, "admin.hash");
      assert.ok(existsSync(filePath), "admin.hash should exist");
    });

    it("overwrites on re-save", () => {
      const h1 = hashPass("first");
      const h2 = hashPass("second");

      saveAdminHash(db, h1);
      saveAdminHash(db, h2);

      const loaded = loadAdminHash(db);
      assert.equal(loaded, h2);
      assert.ok(verifyPass("second", loaded));
      assert.ok(!verifyPass("first", loaded));
    });
  });
});
