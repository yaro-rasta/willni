/**
 * CLI e2e tests — captures stdout from `node cli/main.mjs`
 * and verifies Ukrainian translations, alignment, and validation.
 *
 * Each test covers a specific user feedback issue.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function runCli(args = "") {
  return execSync(`node cli/main.mjs ${args}`, {
    cwd: ROOT,
    encoding: "utf-8",
    env: { ...process.env, PLAY_DEMO_SEQUENCE: "1", NODE_NO_WARNINGS: "1" },
    timeout: 10000,
  });
}

describe("CLI: Dashboard (uk)", () => {
  const output = runCli("--lang=uk --demo=dashboard");

  it("stats lines have consistent padding (no extra spaces)", () => {
    // Extract lines containing ":"
    const statLines = output
      .split("\n")
      .filter((l) => /^\s{2}\S.*:\s+\d+$/.test(l.trim() ? l : ""));

    // Each stat line should have format "  Label<pad>: value"
    // Check no double-spaces between label and colon
    const lines = output
      .split("\n")
      .filter(
        (l) =>
          l.includes(": ") &&
          (l.includes("учасників") ||
            l.includes("Підписників") ||
            l.includes("Верифіковано") ||
            l.includes("голосів")),
      );

    for (const line of lines) {
      // Between label and ":" there should be at most one space (from padEnd)
      // The pattern "label   :" with multiple trailing spaces is OK (padEnd)
      // But "label:    value" with irregular spacing between lines is not
      const match = line.match(/:\s+(\d+)/);
      assert.ok(match, `stat line has value after colon: "${line.trim()}"`);
    }

    // All colons should be at the same position (aligned)
    const colonPositions = lines.map((l) => l.indexOf(":"));
    const unique = [...new Set(colonPositions)];
    assert.equal(
      unique.length,
      1,
      `all stat colons should align at same position, got positions: ${colonPositions}`,
    );
  });

  it("table headers are translated to Ukrainian", () => {
    assert.ok(output.includes("Ім'я"), "should have Name in Ukrainian");
    assert.ok(output.includes("Рівень"), "should have Tier in Ukrainian");
    assert.ok(output.includes("Голоси"), "should have Votes in Ukrainian");
    assert.ok(
      output.includes("Дивіденди"),
      "should have Dividends in Ukrainian",
    );
  });
});

describe("CLI: Economy (uk)", () => {
  it("all economy labels translate to Ukrainian (not English fallback)", async () => {
    const getT = (await import("./vocabs/index.mjs")).default;
    const t = getT("uk");

    const keys = [
      "Category",
      "Share",
      "Founder",
      "Community",
      "Humanitarian",
      "Development",
      "Total",
      "Per member",
    ];

    for (const key of keys) {
      const translated = t(key);
      assert.notEqual(
        translated,
        key,
        `"${key}" should translate, got fallback`,
      );
    }
  });
});

describe("CLI: Validation messages (uk)", () => {
  it("all validation error messages have Ukrainian translations", async () => {
    // Import vocab directly to verify coverage
    const vocab = (await import("./vocabs/uk.mjs")).default;

    const validationMessages = [
      "Invalid email format",
      "Amount must be a positive number",
      "Transaction hash too short (min 5 chars)",
    ];

    for (const msg of validationMessages) {
      assert.ok(
        vocab[msg],
        `validation message "${msg}" must have Ukrainian translation`,
      );
    }
  });
});

describe("CLI: Vocab completeness (uk)", () => {
  it("all keys used in Economy have translations", async () => {
    const vocab = (await import("./vocabs/uk.mjs")).default;

    const economyKeys = [
      "Category",
      "Share",
      "Founder",
      "Community",
      "Humanitarian",
      "Development",
      "Total",
      "Per member",
      "members",
      "Active members",
    ];

    for (const key of economyKeys) {
      assert.ok(
        vocab[key],
        `economy key "${key}" must have Ukrainian translation`,
      );
    }
  });

  it("all keys used in Dashboard have translations", async () => {
    const vocab = (await import("./vocabs/uk.mjs")).default;

    const dashboardKeys = [
      "Dashboard",
      "Total members",
      "Subscribers",
      "Verified",
      "Total votes",
      "Dividends",
      "Monthly revenue estimate",
      "Per subscriber dividend",
      "Name",
      "Tier",
      "Votes",
    ];

    for (const key of dashboardKeys) {
      assert.ok(
        vocab[key],
        `dashboard key "${key}" must have Ukrainian translation`,
      );
    }
  });
});
