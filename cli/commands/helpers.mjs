/**
 * willni CLI — Shared UI helpers & constants
 *
 * Used by all commands. Contains tier colors, card printer,
 * form bodies, and banner renderer using @nan0web/ui-cli components.
 */

import Logger from "@nan0web/log";
import { alert, badge, toast } from "@nan0web/ui-cli";
import { Tier } from "../../web/src/models/Tier.js";
import { User } from "../../web/src/models/User.js";
import { Payment, PaymentMethod } from "../../web/src/models/Payment.js";

// ─── Tier Colors ───────────────────────────────────────

export const TIER_COLORS = {
  [Tier.FREE]: Logger.DIM,
  [Tier.SUBSCRIPTION]: Logger.CYAN,
  [Tier.VIP]: Logger.YELLOW,
  [Tier.MENTOR]: Logger.MAGENTA,
};

// ─── Helpers ───────────────────────────────────────────

export function tierLabel(t, tier) {
  return t(
    User.schema.tier.options.find((o) => o.value === tier)?.label || tier,
  );
}

export function styledTier(t, tier) {
  const label = tierLabel(t, tier);
  const color = TIER_COLORS[tier] || Logger.WHITE;
  return Logger.style(label, { color });
}

export function tierBadge(t, tier) {
  const variantMap = {
    [Tier.FREE]: "neutral",
    [Tier.SUBSCRIPTION]: "info",
    [Tier.VIP]: "warning",
    [Tier.MENTOR]: "success",
  };
  return badge(tierLabel(t, tier), variantMap[tier] || "neutral");
}

export function printUserCard(console, t, user) {
  const pad = 14;
  console.info(`  ${t("Name").padEnd(pad)}: ${user.name}`);
  console.info(`  ${t("E-mail").padEnd(pad)}: ${user.email}`);
  console.info(`  ${t("Tier").padEnd(pad)}: ${styledTier(t, user.tier)}`);
  console.info(`  ${t("Votes").padEnd(pad)}: ${user.votes}`);
  console.info(
    `  ${t("Verified").padEnd(pad)}: ${user.verified ? Logger.style("+", { color: Logger.GREEN }) : Logger.style("-", { color: Logger.RED })}`,
  );
}

// ─── Banner (using @nan0web/ui-cli alert) ──────────────

export function banner(console) {
  const box = alert("☀  ВОЛЯ · willni.yaro.page  ☀\n       Воля і Я", "info", {
    title: "willni",
  });
  console.info(box);
}

// ─── Toast helpers ─────────────────────────────────────

export function successToast(msg) {
  return toast(msg, "success");
}

export function errorToast(msg) {
  return toast(msg, "error");
}

export function infoToast(msg) {
  return toast(msg, "info");
}

// ─── Form Bodies ───────────────────────────────────────
// Form iterates Object.entries(Class) — static key must
// match the instance field name.

export class RegisterBody {
  name;
  email;
  tier;

  // Form reads these via Object.entries(RegisterBody)
  // eslint-disable-next-line -- shadows Function.name intentionally for Form compat
  static name = User.schema.name;
  static email = User.schema.email;
  static tier = User.schema.tier;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}

export class PaymentBody {
  tier;
  method;
  amount;
  txHash;

  static tier = Payment.tier;
  static method = Payment.method;
  static amount = Payment.amount;
  static txHash = Payment.txHash;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}
