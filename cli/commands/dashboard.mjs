/**
 * willni CLI — Dashboard command
 */

import Logger from "@nan0web/log";
import { distributeRevenue } from "../../web/src/models/revenue.js";
import { tierLabel, styledTier } from "./helpers.mjs";

/**
 * @param {object} ctx
 */
export async function runDashboard(ctx) {
  const { console, adapter, t, session } = ctx;

  console.clear();
  console.success(t("Dashboard"));
  console.info("");

  const users = session.users;
  const subscribers = users.filter((u) => u.isSubscriber);
  const totalVotes = users.reduce((s, u) => s + u.votes, 0);
  const verified = users.filter((u) => u.verified).length;

  if (session.currentUser) {
    console.info(
      `  ${t("Logged in as")}: ${Logger.style(session.currentUser.name, { bold: true })} [${styledTier(t, session.currentUser.tier)}]`,
    );
    console.info("");
  }

  const stats = [
    [t("Total members"), users.length],
    [t("Subscribers"), subscribers.length],
    [t("Verified"), verified],
    [t("Total votes"), totalVotes],
  ];
  const pad = Math.max(...stats.map(([k]) => k.length)) + 1;
  for (const [label, value] of stats) {
    console.info(`  ${label.padEnd(pad)}: ${value}`);
  }
  console.info("");

  const cols = [t("Name"), t("Tier"), t("Votes"), t("Dividends")];
  const data = users.map((u) => {
    const div = u.hasDividends
      ? Logger.style("+", { color: Logger.GREEN })
      : Logger.style("-", { color: Logger.RED });
    return {
      [cols[0]]: u.name,
      [cols[1]]: tierLabel(t, u.tier),
      [cols[2]]: String(u.votes),
      [cols[3]]: div,
    };
  });
  console.table(data, cols, { prefix: "  ", headBorder: 1 });

  if (subscribers.length > 0) {
    console.info("");
    const mockRevenue = subscribers.length * 0.5;
    const dist = distributeRevenue(mockRevenue);
    const perMember = dist.community / subscribers.length;

    console.info(
      `  ${t("Monthly revenue estimate")}: ${mockRevenue.toFixed(2)} BTC`,
    );
    console.info(
      `  ${t("Per subscriber dividend")}: ${perMember.toFixed(4)} BTC`,
    );
  }

  if (session.db) {
    console.info("");
    console.info(
      Logger.style(`  💾 ${t("Data source")}: ${session.db.toString()}`, {
        color: Logger.DIM,
      }),
    );
  }
}
