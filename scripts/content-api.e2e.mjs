/**
 * E2E test for Content API endpoint.
 * Verifies that /api/content serves converted MD→JSON documents.
 *
 * Prerequisites:
 *   1. Run `node scripts/build-content.mjs` to generate JSON content
 *   2. Run `node server/index.js` on PORT=3333
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

const API = process.env.API_URL || "http://localhost:3333";

describe("Content API E2E", () => {
  before(async () => {
    // Verify server is running
    try {
      const res = await fetch(`${API}/health`);
      assert.strictEqual(res.status, 200);
    } catch (err) {
      throw new Error(
        `Server not running at ${API}. Start it with: node server/index.js`,
      );
    }
  });

  it("GET /api/content?path=law — should return law.json", async () => {
    const res = await fetch(`${API}/api/content?path=law`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("content-type"), "application/json");

    const doc = await res.json();
    assert.ok(Array.isArray(doc.$content), "$content should be an array");
    assert.ok(doc.$content.length > 0, "$content should not be empty");

    // Verify first heading
    const firstHeading = doc.$content.find((b) => b.type === "heading");
    assert.ok(firstHeading, "Should have at least one heading");
  });

  it("GET /api/content?path=superintellect/index — should return superintellect index", async () => {
    const res = await fetch(`${API}/api/content?path=superintellect/index`);
    assert.strictEqual(res.status, 200);

    const doc = await res.json();
    assert.ok(Array.isArray(doc.$content));
  });

  it("GET /api/content?path=nonexistent — should return 404", async () => {
    const res = await fetch(`${API}/api/content?path=nonexistent`);
    assert.strictEqual(res.status, 404);

    const doc = await res.json();
    assert.strictEqual(doc.error, "Not found");
  });

  it("GET /api/content — missing path should return 400", async () => {
    const res = await fetch(`${API}/api/content`);
    assert.strictEqual(res.status, 400);

    const doc = await res.json();
    assert.strictEqual(doc.error, "Missing ?path= parameter");
  });

  it("GET /api/content?path=../../etc/passwd — path traversal should fail", async () => {
    const res = await fetch(`${API}/api/content?path=../../etc/passwd`);
    assert.strictEqual(res.status, 404);
  });

  it("should have Cache-Control header on valid responses", async () => {
    const res = await fetch(`${API}/api/content?path=law`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get("cache-control").includes("max-age"));
  });
});
