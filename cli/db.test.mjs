/**
 * Unit tests for cli/db.mjs — CRUD helpers & seed
 *
 * Uses a temporary directory for each test to avoid pollution.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import DBFS from "@nan0web/db-fs";
import { User } from "../web/src/models/User.js";
import { Payment, PaymentStatus } from "../web/src/models/Payment.js";
import { CourseProgress } from "../web/src/models/CourseProgress.js";
import { Tier } from "../web/src/models/Tier.js";
import {
  userSlug,
  saveUser,
  loadUsers,
  savePayment,
  saveProgress,
  loadProgress,
} from "./db.mjs";

/** @type {string} */
let tmpDir;

/** @type {DBFS} */
let db;

describe("cli/db.mjs", () => {
  beforeEach(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "willni-db-test-"));
    db = new DBFS({ root: tmpDir });
    await db.connect();
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("userSlug", () => {
    it("extracts local part from email", () => {
      assert.equal(userSlug("sovr@yaro.page"), "sovr");
    });

    it("lowercases and sanitizes special chars", () => {
      assert.equal(userSlug("John.Doe+test@example.com"), "john_doe_test");
    });

    it("handles simple email", () => {
      assert.equal(userSlug("artem@x.com"), "artem");
    });
  });

  describe("saveUser + loadUsers", () => {
    it("saves user as YAML and loads it back", async () => {
      const user = new User({
        name: "Test",
        email: "test@example.com",
        tier: Tier.FREE,
      });

      await saveUser(db, user);

      // Verify file exists
      const filePath = join(tmpDir, "users", "test.yaml");
      assert.ok(existsSync(filePath), "YAML file should exist");

      // Verify content
      const content = readFileSync(filePath, "utf-8");
      assert.ok(content.includes("name: Test"), "should contain name");
      assert.ok(
        content.includes("email: test@example.com"),
        "should contain email",
      );
      assert.ok(content.includes("tier: free"), "should contain tier");

      // Load back
      const users = await loadUsers(db);
      assert.equal(users.length, 1);
      assert.equal(users[0].name, "Test");
      assert.equal(users[0].email, "test@example.com");
      assert.equal(users[0].tier, Tier.FREE);
      assert.ok(users[0] instanceof User, "should be User instance");
    });

    it("loads empty array when no users dir", async () => {
      const users = await loadUsers(db);
      assert.deepEqual(users, []);
    });

    it("saves multiple users with unique slugs", async () => {
      const u1 = new User({
        name: "Alice",
        email: "alice@x.com",
        tier: Tier.VIP,
      });
      const u2 = new User({
        name: "Bob",
        email: "bob@y.com",
        tier: Tier.SUBSCRIPTION,
      });

      await saveUser(db, u1);
      await saveUser(db, u2);

      const users = await loadUsers(db);
      assert.equal(users.length, 2);

      const names = users.map((u) => u.name).sort();
      assert.deepEqual(names, ["Alice", "Bob"]);
    });

    it("overwrites existing user on re-save", async () => {
      const user = new User({
        name: "Old",
        email: "same@x.com",
        tier: Tier.FREE,
      });
      await saveUser(db, user);

      user.name = "New";
      user.tier = Tier.VIP;
      await saveUser(db, user);

      const users = await loadUsers(db);
      assert.equal(users.length, 1);
      assert.equal(users[0].name, "New");
      assert.equal(users[0].tier, Tier.VIP);
    });
  });

  describe("savePayment", () => {
    it("saves payment as YAML with all fields", async () => {
      const payment = new Payment({
        tier: Tier.SUBSCRIPTION,
        method: "btc",
        amount: "0.5",
        txHash: "abc123",
        userId: "test@x.com",
      });

      await savePayment(db, payment);

      const filePath = join(tmpDir, "payments", `${payment.id}.yaml`);
      assert.ok(existsSync(filePath), "payment YAML should exist");

      const content = readFileSync(filePath, "utf-8");
      assert.ok(
        content.includes("amount: '0.5'") ||
          content.includes('amount: \"0.5\"') ||
          content.includes("amount: 0.5"),
        "should contain amount",
      );
      assert.ok(
        content.includes("userId: test@x.com"),
        "should contain userId",
      );
      assert.ok(
        content.includes("status: pending"),
        "should have pending status",
      );
    });
  });

  describe("saveProgress + loadProgress", () => {
    it("saves and loads course progress", async () => {
      const progress = new CourseProgress({ userId: "test@x.com" });
      progress.completeSeries(1);
      progress.completeSeries(2);

      await saveProgress(db, progress);

      const loaded = await loadProgress(db, "test@x.com");
      assert.ok(loaded, "should load progress");
      assert.equal(loaded.userId, "test@x.com");
      assert.ok(loaded.completedSeries.includes(1), "should have series 1");
      assert.ok(loaded.completedSeries.includes(2), "should have series 2");
    });

    it("returns null when no progress exists", async () => {
      const loaded = await loadProgress(db, "nobody@x.com");
      assert.equal(loaded, null);
    });

    it("uses email slug for filename", async () => {
      const progress = new CourseProgress({ userId: "john@x.com" });
      await saveProgress(db, progress);

      const filePath = join(tmpDir, "progress", "john.yaml");
      assert.ok(existsSync(filePath), "should use slug-based filename");
    });
  });
});
