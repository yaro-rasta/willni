import { Subject, Verse } from "../src/domain/sovereign/index.js";
import fs from "node:fs";
import path from "node:path";
// Assuming a YAML parser is needed, or we just mock the loading part
// for the sake of the 'One Logic' demonstration.
const registryDir = path.resolve("data/registry");

/**
 * MOCK DB Loader (Simplified for demo)
 * In real Will-n-i, this is handled by @nan0web/db-fs
 */
const loadYaml = (filePath) => {
  // Simple regex based YAML to JS object mock for this specific demo
  const content = fs.readFileSync(filePath, "utf8");
  const obj = {};
  const lines = content.split("\n");
  let currentKey = "";

  // This is a very crude mock to avoid installing extra dependencies
  // for a 1-minute demo. In production we use js-yaml via @nan0web/db.
  lines.forEach((line) => {
    if (line.startsWith("  - ")) return; // skip for now
    if (line.startsWith("    ")) return; // skip for now
    const [key, ...rest] = line.split(": ");
    if (key && rest.length) obj[key.trim()] = rest.join(": ").trim();
  });
  return obj;
};

async function demo() {
  console.log("--- 🛡️ Sovereign State Hydration Demo ---");

  // 1. Load Tesla
  const teslaSubjectData = {
    id: "tesla-pub-key-ed25519-01",
    name: "Nikola Tesla",
    lineage: "Tesla",
    status: "sovereign",
    reputation: 1000,
  };
  const teslaSubject = new Subject(teslaSubjectData);

  console.log(
    `\n[SUBJECT] Loaded: ${teslaSubject.name} (${teslaSubject.id.slice(0, 10)}...)`,
  );
  console.log(
    `Status: ${teslaSubject.status.toUpperCase()} | REP: ${teslaSubject.reputation}`,
  );

  // 2. Load Verse
  const teslaVerseData = {
    id: "tesla-verse-id",
    subjectId: teslaSubject.id,
    slug: "tesla",
    profile: { bio: "Futurist and inventor." },
    products: [
      { id: "ac-system", title: "AC System", type: "service" },
      { id: "tesla-coil", title: "Tesla Coil", price: 33, type: "physical" },
    ],
  };
  const teslaVerse = new Verse(teslaVerseData);

  console.log(
    `\n[VERSE] iVerse created for ${teslaSubject.name} at will-n-i.com/${teslaVerse.slug}`,
  );
  console.log(`Products in Verse: ${teslaVerse.products.length}`);
  teslaVerse.products.forEach((p) => console.log(` - ${p.title} (${p.type})`));

  // 3. Load Skovoroda
  const skovorodaSubject = new Subject({
    name: "Hryhoriy Skovoroda",
    reputation: 144,
  });
  console.log(`\n[SUBJECT] Loaded: ${skovorodaSubject.name}`);
  console.log(
    `Formula Check (Ecosystem): UBI ${teslaVerse.ecosystem.ubi}% | DEV ${teslaVerse.ecosystem.dev}%`,
  );

  console.log("\n--- ✅ One Logic - Many UI: Model Hydrated! ---");
}

demo().catch(console.error);
