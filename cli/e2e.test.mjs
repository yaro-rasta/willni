/**
 * E2E tests — full demo flow for each CLI command.
 *
 * Captures stdout from `node cli/main.mjs --demo=X --lang=uk`
 * and verifies output structure, translations, and data integrity.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Strip ANSI escape codes for reliable assertion */
const stripAnsi = (s) =>
  s.replace(/\x1b\[[0-9;]*[A-Za-z]|\x1b\d|\x1b7|\x1b8/g, "");

function runCli(args = "") {
  const raw = execSync(`node cli/main.mjs ${args}`, {
    cwd: ROOT,
    encoding: "utf-8",
    env: { ...process.env, PLAY_DEMO_SEQUENCE: "1", NODE_NO_WARNINGS: "1" },
    timeout: 15000,
  });
  return stripAnsi(raw);
}

describe("E2E: Full Demo Flow", () => {
  describe("Dashboard (uk)", () => {
    const output = runCli("--lang=uk --demo=dashboard");

    it("shows banner with ВОЛЯ", () => {
      assert.ok(output.includes("ВОЛЯ"), "banner should contain ВОЛЯ");
      assert.ok(
        output.includes("willni.yaro.page"),
        "banner should contain willni.yaro.page",
      );
    });

    it("shows DB connection info", () => {
      assert.ok(output.includes("DB:"), "should show DB info");
      assert.ok(output.includes("members"), "should show member count");
    });

    it("shows stats lines", () => {
      const statsKeys = ["учасників", "Підписників", "Верифіковано", "голосів"];
      for (const key of statsKeys) {
        assert.ok(output.includes(key), `should contain stat: ${key}`);
      }
    });

    it("shows members table with columns", () => {
      assert.ok(output.includes("Ім'я"), "should have Name column");
      assert.ok(output.includes("Рівень"), "should have Tier column");
      assert.ok(output.includes("Голоси"), "should have Votes column");
    });

    it("shows revenue estimate in BTC", () => {
      assert.ok(output.includes("BTC"), "should show BTC revenue");
    });

    it("shows data source", () => {
      assert.ok(
        output.includes("Джерело даних"),
        "should show data source label",
      );
    });
  });

  describe("Economy (uk)", () => {
    const output = runCli("--lang=uk --demo=economy");

    it("shows economy title", () => {
      assert.ok(output.includes("Економіка"), "should have economy title");
      assert.ok(output.includes("1-33-33-33"), "should show model name");
    });

    it("prompts for revenue input", () => {
      assert.ok(output.includes("BTC"), "should mention BTC in prompt");
    });
  });

  describe("Course (uk)", () => {
    const output = runCli("--lang=uk --demo=course");

    it("shows course title", () => {
      assert.ok(output.includes("Суперінтелект"), "should have course title");
    });

    it("shows all 6 series", () => {
      for (let i = 1; i <= 6; i++) {
        assert.ok(output.includes(`Серія ${i}`), `should list Series ${i}`);
      }
    });

    it("shows series themes", () => {
      assert.ok(
        output.includes("логіки") || output.includes("Фільтр"),
        "should show Series 1 theme",
      );
    });

    it("shows progress percentage", () => {
      assert.ok(output.includes("Прогрес"), "should show progress label");
      assert.ok(output.includes("%"), "should show percentage");
    });

    it("shows completion status for series", () => {
      assert.ok(
        output.includes("Завершено") || output.includes("завершено"),
        "should show completed status",
      );
    });

    it("shows series status icons", () => {
      assert.ok(
        output.includes("✓") || output.includes("○") || output.includes("✗"),
        "should have status icons",
      );
    });

    it("allows completing a series", () => {
      assert.ok(
        output.includes("завершено") || output.includes("completed"),
        "should show completion message",
      );
    });
  });

  describe("Dashboard (en)", () => {
    const output = runCli("--lang=en --demo=dashboard");

    it("shows English labels", () => {
      assert.ok(
        output.includes("Total members"),
        "should have English stat label",
      );
      assert.ok(output.includes("Name"), "should have English table header");
    });

    it("shows same seed data", () => {
      assert.ok(output.includes("BTC"), "should show BTC");
      assert.ok(output.includes("Sovereign"), "should show user name");
    });
  });

  describe("Course (en)", () => {
    const output = runCli("--lang=en --demo=course");

    it("shows English series titles", () => {
      assert.ok(output.includes("Anatomy of Anxiety"), "Series 1 title in EN");
      assert.ok(output.includes("Where Am I"), "Series 2 title in EN");
    });

    it("shows completion or progress", () => {
      assert.ok(
        output.includes("Progress") ||
          output.includes("completed") ||
          output.includes("%"),
        "should show progress info",
      );
    });
  });

  describe("Cross-command data consistency", () => {
    it("same member count in dashboard and members", () => {
      const dashboard = runCli("--lang=en --demo=dashboard");
      const members = runCli("--lang=en --demo=members");

      // Extract member count from dashboard "Total members : N"
      const dashMatch = dashboard.match(/Total members\s*:\s*(\d+)/);
      assert.ok(dashMatch, "dashboard should show total members");

      // Members command shows "Members (N)"
      const memMatch = members.match(/Members\s*\((\d+)\)/);
      assert.ok(memMatch, "members should show count");

      assert.equal(dashMatch[1], memMatch[1], "member counts should match");
    });

    it("golden dataset has expected seed users", () => {
      const output = runCli("--lang=en --demo=members");
      const expectedUsers = ["Artem", "Dmytro", "Maria", "Sovereign"];
      for (const name of expectedUsers) {
        assert.ok(output.includes(name), `should contain seed user: ${name}`);
      }
    });
  });
});
