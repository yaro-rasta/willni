#!/usr/bin/env node

/**
 * CLI entry point for md-to-json build script.
 * Converts all .md files from willni content to JSON for @nan0web/db-browser.
 *
 * Usage:
 *   node scripts/build-content.mjs
 *   npm run build:content
 */

import { build } from "./md-to-json.mjs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const EXCLUDE = [
  "node_modules",
  ".vitepress",
  ".git",
  ".agent",
  "scripts",
  "server",
  "playwright-report",
  "test-results",
  "chat",
  "Наталія.Яілатан",
  "superintellect.backup",
  "i18n",
];

const sourceDir = ROOT;
const outputDir = join(ROOT, "data", "content");

console.log("🔄 Building MD → JSON...");
console.log(`   Source: ${sourceDir}`);
console.log(`   Output: ${outputDir}`);
console.log("");

const result = build({ sourceDir, outputDir, exclude: EXCLUDE });

console.log(`✅ Converted ${result.converted} files:`);
for (const file of result.files) {
  console.log(`   📄 ${file} → ${file.replace(/\.md$/, ".json")}`);
}
