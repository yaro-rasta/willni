/**
 * Unit tests for cli/access.mjs — Data-driven AccessControl
 *
 * Follows the tabular test pattern from @nan0web/auth-node.
 * Rules and groups are written to temp dir, then tested.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AccessControl } from "@nan0web/auth-core";

/** @type {string} */
let tmpDir;

/** @type {AccessControl} */
let ac;

const ACCESS_RULES = [
  "# Global access rules",
  "*          r    /login",
  "*          r    /register",
  "*          r    /course",
  "*          r    /economy",
  "*          r    /exit",
  "members    r    /dashboard",
  "members    r    /members",
  "members    r    /profile",
  "members    rw   /payment",
  "members    r    /logout",
  "admin      rwd  /admin",
].join("\n");

const GROUP_RULES = [
  "# Groups",
  "admin    sovr",
  "members  sovr artem dmytro maria",
].join("\n");

describe("AccessControl", () => {
  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "willni-ac-test-"));
    writeFileSync(join(tmpDir, ".access"), ACCESS_RULES, "utf-8");
    writeFileSync(join(tmpDir, ".group"), GROUP_RULES, "utf-8");
    ac = new AccessControl();
    ac.load(ACCESS_RULES, GROUP_RULES);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // ─── Tabular access tests ─────────────────────────

  const expected = [
    // Public access (*)
    ["guest", "r", "/course", true],
    ["guest", "r", "/economy", true],
    ["guest", "r", "/login", true],
    ["guest", "r", "/register", true],
    ["guest", "r", "/exit", true],
    ["guest", "r", "/dashboard", false],
    ["guest", "r", "/admin", false],
    ["guest", "r", "/profile", false],
    ["guest", "w", "/course", false],

    // Member access
    ["artem", "r", "/dashboard", true],
    ["artem", "r", "/members", true],
    ["artem", "r", "/profile", true],
    ["artem", "r", "/payment", true],
    ["artem", "w", "/payment", true],
    ["artem", "r", "/course", true],
    ["artem", "r", "/admin", false],
    ["artem", "w", "/admin", false],

    // Admin access
    ["sovr", "r", "/admin", true],
    ["sovr", "w", "/admin", true],
    ["sovr", "d", "/admin", true],
    ["sovr", "r", "/dashboard", true],
    ["sovr", "r", "/course", true],

    // Unknown user — only global rules
    ["nobody", "r", "/course", true],
    ["nobody", "r", "/dashboard", false],
    ["nobody", "r", "/admin", false],
  ];

  describe("check()", () => {
    for (const [user, level, path, shouldPass] of expected) {
      it(`${shouldPass ? "✅" : "🚫"} ${user} ${level} ${path}`, () => {
        assert.equal(ac.check(user, path, level), shouldPass);
      });
    }
  });

  // ─── info() ───────────────────────────────────────

  describe("info()", () => {
    it("returns rules and groups for admin user", () => {
      const { rules, groups } = ac.info("sovr");
      assert.deepEqual(groups, ["admin", "members"]);
      assert.ok(rules.length > 0);
      assert.ok(rules.some((r) => r.target === "/admin"));
    });

    it("returns rules and groups for member", () => {
      const { rules, groups } = ac.info("artem");
      assert.deepEqual(groups, ["members"]);
      assert.ok(rules.some((r) => r.target === "/dashboard"));
      assert.ok(!rules.some((r) => r.subject === "admin"));
    });

    it("returns only global rules for unknown user", () => {
      const { rules, groups } = ac.info("nobody");
      assert.deepEqual(groups, []);
      assert.ok(rules.every((r) => r.subject === "*"));
    });
  });

  // ─── filterNav() ─────────────────────────────────

  describe("filterNav()", () => {
    const nav = [
      { path: "/dashboard" },
      { path: "/members" },
      { path: "/profile" },
      { path: "/login", guest: true },
      { path: "/register", guest: true },
      { path: "/payment" },
      { path: "/course" },
      { path: "/economy" },
      { path: "/admin" },
      { path: "/logout" },
      { path: "/exit" },
    ];

    it("guest sees public + guest items, not auth items", () => {
      const visible = ac.filterNav(nav, null);
      const paths = visible.map((n) => n.path);
      assert.ok(paths.includes("/course"), "course visible");
      assert.ok(paths.includes("/economy"), "economy visible");
      assert.ok(paths.includes("/login"), "login visible");
      assert.ok(paths.includes("/register"), "register visible");
      assert.ok(paths.includes("/exit"), "exit visible");
      assert.ok(!paths.includes("/dashboard"), "dashboard hidden");
      assert.ok(!paths.includes("/admin"), "admin hidden");
      assert.ok(!paths.includes("/logout"), "logout hidden");
    });

    it("member sees member items, not guest/admin items", () => {
      const visible = ac.filterNav(nav, "artem");
      const paths = visible.map((n) => n.path);
      assert.ok(paths.includes("/dashboard"), "dashboard visible");
      assert.ok(paths.includes("/course"), "course visible");
      assert.ok(paths.includes("/logout"), "logout visible");
      assert.ok(!paths.includes("/login"), "login hidden");
      assert.ok(!paths.includes("/register"), "register hidden");
      assert.ok(!paths.includes("/admin"), "admin hidden");
    });

    it("admin sees everything except guest items", () => {
      const visible = ac.filterNav(nav, "sovr");
      const paths = visible.map((n) => n.path);
      assert.ok(paths.includes("/admin"), "admin visible");
      assert.ok(paths.includes("/dashboard"), "dashboard visible");
      assert.ok(paths.includes("/course"), "course visible");
      assert.ok(!paths.includes("/login"), "login hidden");
      assert.ok(!paths.includes("/register"), "register hidden");
    });
  });

  // ─── Edge cases ───────────────────────────────────

  describe("edge cases", () => {
    it("handles missing .access file gracefully", () => {
      const emptyAc = new AccessControl();
      emptyAc.load("", "");
      assert.equal(emptyAc.check("anyone", "/anything", "r"), false);
    });

    it("normalizes paths without leading /", () => {
      assert.equal(ac.check("artem", "dashboard", "r"), true);
      assert.equal(ac.check("guest", "course", "r"), true);
    });

    it("path matching is prefix-based for sub-paths", () => {
      // /admin should match /admin/users etc.
      assert.equal(ac.check("sovr", "/admin/users", "r"), true);
      assert.equal(ac.check("artem", "/admin/users", "r"), false);
    });
  });
});
