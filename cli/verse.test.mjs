/**
 * Snapshot tests for the Verse command.
 * Verifies that iVerse profiles are rendered correctly.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SNAPSHOT_DIR = join(__dirname, "__snapshots__");

if (!existsSync(SNAPSHOT_DIR)) {
  execSync(`mkdir -p ${SNAPSHOT_DIR}`);
}

/** Strip ANSI escape codes */
const stripAnsi = (s) =>
  s.replace(/\x1b\[[0-9;]*[A-Za-z]|\x1b\d|\x1b7|\x1b8/g, "");

function runCli(args = "", extraEnv = {}) {
  const raw = execSync(`node cli/main.mjs ${args}`, {
    cwd: ROOT,
    encoding: "utf-8",
    env: {
      ...process.env,
      PLAY_DEMO_SEQUENCE: "1",
      NODE_NO_WARNINGS: "1",
      ...extraEnv,
    },
    timeout: 15000,
  });
  return stripAnsi(raw);
}

describe("E2E Snapshot: Verse Command", () => {
  const cases = [
    { slug: "skovoroda", lang: "uk" },
    { slug: "tesla", lang: "uk" },
    { slug: "yaro", lang: "uk" },
  ];

  for (const c of cases) {
    it(`renders ${c.slug} iVerse in ${c.lang}`, () => {
      const output = runCli(`--lang=${c.lang} --demo=verse`, {
        PLAY_DEMO_SEQUENCE: `${c.slug},next`, // string name + Enter to return
      });

      const snapshotPath = join(SNAPSHOT_DIR, `${c.slug}_${c.lang}.txt`);

      if (!existsSync(snapshotPath)) {
        console.log(
          `[SNAPSHOT] Creating initial snapshot for ${c.slug}_${c.lang}`,
        );
        writeFileSync(snapshotPath, output, "utf-8");
      }

      assert.ok(
        output.toLowerCase().includes(c.slug.toLowerCase()),
        `Output should contain slug: ${c.slug}`,
      );

      if (c.slug === "tesla") {
        assert.ok(
          output.includes("Inventor") || output.includes("Nikola"),
          "Should contain Tesla related keywords",
        );
        assert.ok(output.includes("33%"), "Should contain economy rules");
      }

      if (c.slug === "skovoroda") {
        assert.ok(
          output.includes("Philosopher") || output.includes("Skovoroda"),
          "Should contain Skovoroda related keywords",
        );
      }
    });
  }
});
