import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  Tier,
  User,
  PaymentMethod,
  PaymentStatus,
  Payment,
  Series,
  SERIES_CATALOG,
  CourseProgress,
  distributeRevenue,
  ContentDocument,
} from "./index.js";

// ─── Tier ──────────────────────────────────────────────

describe("Tier", () => {
  it("has 4 levels", () => {
    assert.deepStrictEqual(Object.values(Tier), [
      "free",
      "subscription",
      "vip",
      "mentor",
    ]);
  });
});

// ─── User (Model as Schema) ───────────────────────────

describe("User", () => {
  it("static schema has metadata for each field", () => {
    assert.strictEqual(User.schema.name.type, "string");
    assert.strictEqual(User.schema.email.type, "string");
    assert.strictEqual(User.schema.tier.type, "enum");
    assert.strictEqual(User.schema.verified.type, "boolean");
    assert.strictEqual(User.schema.createdAt.type, "number");
    assert.strictEqual(User.schema.passwordHash.type, "string");
  });

  it("schema help values are human-readable fallbacks", () => {
    assert.strictEqual(User.schema.name.help, "Name");
    assert.strictEqual(User.schema.email.help, "E-mail");
    assert.strictEqual(User.schema.tier.help, "Tier");
  });

  it("tier options have readable labels", () => {
    const labels = User.schema.tier.options.map((o) => o.label);
    assert.deepStrictEqual(labels, ["Free", "Subscription", "VIP", "Mentor"]);
  });
  it("email validate rejects invalid with readable message", () => {
    assert.strictEqual(
      User.schema.email.validate("bad"),
      "Invalid email format",
    );
    assert.strictEqual(User.schema.email.validate("ok@x.com"), true);
  });

  it("instance uses defaults from schema", () => {
    const u = new User();
    assert.strictEqual(u.name, "");
    assert.strictEqual(u.tier, Tier.FREE);
    assert.strictEqual(u.verified, false);
    assert.strictEqual(u.passwordHash, "");
    assert.strictEqual(typeof u.createdAt, "number");
    assert.ok(u.createdAt > 0);
  });

  it("createdAt is number (ms)", () => {
    const before = Date.now();
    const u = new User({ name: "Test" });
    assert.ok(u.createdAt >= before);
    assert.ok(u.createdAt <= Date.now());
  });

  it("isSubscriber — false for free, true otherwise", () => {
    assert.strictEqual(new User({ tier: Tier.FREE }).isSubscriber, false);
    assert.strictEqual(
      new User({ tier: Tier.SUBSCRIPTION }).isSubscriber,
      true,
    );
    assert.strictEqual(new User({ tier: Tier.VIP }).isSubscriber, true);
    assert.strictEqual(new User({ tier: Tier.MENTOR }).isSubscriber, true);
  });

  it("votes map from tier", () => {
    assert.strictEqual(new User({ tier: Tier.FREE }).votes, 0);
    assert.strictEqual(new User({ tier: Tier.SUBSCRIPTION }).votes, 1);
    assert.strictEqual(new User({ tier: Tier.VIP }).votes, 9);
    assert.strictEqual(new User({ tier: Tier.MENTOR }).votes, 12);
  });

  it("isAdmin — based on roles", () => {
    assert.strictEqual(new User().isAdmin, false);
    assert.strictEqual(new User({ roles: ["u"] }).isAdmin, false);
    assert.strictEqual(new User({ roles: ["u", "admin"] }).isAdmin, true);
  });

  it("User.from() rehydrates JSON", () => {
    const u = User.from({ name: "Y", tier: "vip" });
    assert.ok(u instanceof User);
    assert.strictEqual(u.isVIP, true);
  });

  it("User.from() passes through existing User", () => {
    const u = new User({ name: "A" });
    assert.strictEqual(User.from(u), u);
  });
});

// ─── Payment ───────────────────────────────────────────

describe("Payment", () => {
  it("schema has method options with readable labels", () => {
    const labels = Payment.method.options.map((o) => o.label);
    assert.ok(labels.includes("BTC"));
    assert.ok(labels.includes("USDT (TRC-20)"));
  });

  it("creates with auto-id and number createdAt", () => {
    const p = new Payment({ userId: "u1", amount: "0.001" });
    assert.ok(p.id);
    assert.strictEqual(p.status, PaymentStatus.PENDING);
    assert.strictEqual(typeof p.createdAt, "number");
  });

  it("isConfirmed computed", () => {
    assert.strictEqual(
      new Payment({ status: PaymentStatus.CONFIRMED }).isConfirmed,
      true,
    );
    assert.strictEqual(new Payment().isConfirmed, false);
  });
});

// ─── Series ────────────────────────────────────────────

describe("Series", () => {
  it("schema has metadata", () => {
    assert.strictEqual(Series.number.type, "number");
    assert.strictEqual(Series.title.type, "string");
    assert.strictEqual(Series.contentPath.help, "Content path");
  });

  it("SERIES_CATALOG has 6 entries with readable titles", () => {
    assert.strictEqual(SERIES_CATALOG.length, 6);
    assert.strictEqual(SERIES_CATALOG[0].title, "Anatomy of Anxiety");
    assert.strictEqual(SERIES_CATALOG[5].title, "Manifesto of the Free");
  });

  it("auto-generates contentPath", () => {
    const s = new Series({ number: 3 });
    assert.strictEqual(s.contentPath, "superintellect/series_3");
  });
});

// ─── CourseProgress ────────────────────────────────────

describe("CourseProgress", () => {
  it("schema has metadata", () => {
    assert.strictEqual(CourseProgress.currentSeries.default, 1);
    assert.strictEqual(CourseProgress.startedAt.type, "number");
  });

  it("series 1 always unlocked", () => {
    const cp = new CourseProgress({ userId: "u1" });
    assert.strictEqual(cp.isUnlocked(1), true);
    assert.strictEqual(cp.isUnlocked(2), false);
  });

  it("sequential unlock", () => {
    const cp = new CourseProgress({ userId: "u1" });
    cp.completeSeries(1);
    assert.strictEqual(cp.isUnlocked(2), true);
    assert.strictEqual(cp.currentSeries, 2);
  });

  it("progressPercent", () => {
    const cp = new CourseProgress({ userId: "u1" });
    assert.strictEqual(cp.progressPercent, 0);
    cp.completeSeries(1);
    cp.completeSeries(2);
    cp.completeSeries(3);
    assert.strictEqual(cp.progressPercent, 50);
  });

  it("idempotent completeSeries", () => {
    const cp = new CourseProgress({ userId: "u1" });
    cp.completeSeries(1);
    cp.completeSeries(1);
    assert.deepStrictEqual(cp.completedSeries, [1]);
  });

  it("from() rehydrates", () => {
    const cp = CourseProgress.from({ userId: "x", completedSeries: [1, 2] });
    assert.strictEqual(cp.isUnlocked(3), true);
  });
});

// ─── distributeRevenue ─────────────────────────────────

describe("distributeRevenue (1-33-33-33)", () => {
  it("100 BTC → 1 + 33 + 33 + 33", () => {
    const r = distributeRevenue(100);
    assert.strictEqual(r.founder, 1);
    assert.strictEqual(r.community, 33);
    assert.strictEqual(r.humanitarian, 33);
    assert.strictEqual(r.development, 33);
  });

  it("sum equals total", () => {
    const r = distributeRevenue(1000);
    const sum = r.founder + r.community + r.humanitarian + r.development;
    assert.ok(Math.abs(sum - 1000) < 0.01);
  });
});

// ─── ContentDocument ───────────────────────────────────

describe("ContentDocument", () => {
  it("schema has layout options", () => {
    const labels = ContentDocument.layout.options.map((o) => o.label);
    assert.deepStrictEqual(labels, ["Document", "Home"]);
  });

  it("empty by default", () => {
    const doc = new ContentDocument();
    assert.strictEqual(doc.isEmpty, true);
    assert.strictEqual(doc.firstHeading, undefined);
  });

  it("firstHeading finds first heading", () => {
    const doc = new ContentDocument({
      $content: [
        { type: "paragraph", text: "intro" },
        { type: "heading", level: 1, text: "Title" },
      ],
    });
    assert.strictEqual(doc.firstHeading, "Title");
  });

  it("from() rehydrates", () => {
    const doc = ContentDocument.from({
      title: "X",
      $content: [{ type: "hr" }],
    });
    assert.ok(doc instanceof ContentDocument);
    assert.strictEqual(doc.isEmpty, false);
  });
});
