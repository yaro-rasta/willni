/**
 * willni CLI — Economy command
 *
 * Shows the 1-33-33-33 revenue distribution model.
 * Auto-fills active member count from session.
 */

import { distributeRevenue } from "../../web/src/models/revenue.js";

/**
 * @param {object} ctx
 */
export async function runEconomy(ctx) {
  const { console, adapter, t, session } = ctx;

  console.clear();
  console.success(t("Economy: Model 1-33-33-33"));
  console.info("");

  const revenueInput = await adapter.requestInput({
    prompt: `${t("Total revenue")} (BTC): `,
  });
  if (revenueInput.cancelled) return;

  const activeCount =
    session.users.filter((u) => u.tier !== "free").length || 1;

  const membersInput = await adapter.requestInput({
    prompt: `${t("Active members")}: `,
    initial: String(activeCount),
  });
  if (membersInput.cancelled) return;

  const total = Number(revenueInput.value);
  if (isNaN(total) || total <= 0) {
    console.error(t("Invalid revenue amount"));
    return;
  }

  const members = Number(membersInput.value);
  if (isNaN(members) || members <= 0) {
    console.error(t("Invalid members count"));
    return;
  }

  const dist = distributeRevenue(total);
  const perMember = dist.community / members;

  console.info("");
  const cols = [t("Category"), t("Share"), "BTC"];
  const data = [
    { [cols[0]]: t("Founder"), [cols[1]]: "1%", BTC: dist.founder.toFixed(4) },
    {
      [cols[0]]: t("Community"),
      [cols[1]]: "33%",
      BTC: dist.community.toFixed(4),
    },
    {
      [cols[0]]: t("Humanitarian"),
      [cols[1]]: "33%",
      BTC: dist.humanitarian.toFixed(4),
    },
    {
      [cols[0]]: t("Development"),
      [cols[1]]: "33%",
      BTC: dist.development.toFixed(4),
    },
    { [cols[0]]: t("Total"), [cols[1]]: "100%", BTC: total.toFixed(4) },
  ];
  console.table(data, cols, { prefix: "  ", headBorder: 1 });

  console.info("");
  console.info(
    `  ${t("Per member")}: ${perMember.toFixed(4)} BTC (${members} ${t("members")})`,
  );
}
