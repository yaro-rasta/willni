/**
 * willni CLI — Members command
 *
 * Shows members table. Allows viewing member profiles.
 * ESC returns to members list, not main menu.
 */

import Logger from "@nan0web/log";
import { loadPayments, loadProgress } from "../db.mjs";
import { tierLabel, styledTier, printUserCard } from "./helpers.mjs";
import { SERIES_CATALOG } from "../../web/src/models/Series.js";
import { PaymentStatus } from "../../web/src/models/Payment.js";

/**
 * @param {object} ctx
 */
export async function runMembers(ctx) {
  const { console, adapter, t, session } = ctx;

  console.clear();
  console.success(`${t("Members")} (${session.users.length})`);
  console.info("");

  if (session.users.length === 0) {
    console.info(t("No members yet. Register first."));
    return;
  }

  const cols = [t("Name"), t("Tier"), t("Votes"), t("Verified")];
  const data = session.users.map((u) => ({
    [cols[0]]: u.name,
    [cols[1]]: tierLabel(t, u.tier),
    [cols[2]]: String(u.votes),
    [cols[3]]: u.verified
      ? Logger.style("+", { color: Logger.GREEN })
      : Logger.style("-", { color: Logger.RED }),
  }));
  console.table(data, cols, { prefix: "  ", headBorder: 1 });

  // ─── Profile viewer loop (ESC returns here) ──────
  while (true) {
    console.info("");
    const options = [
      ...session.users.map((u) => `${t("View")}: ${u.name}`),
      `← ${t("Back")}`,
    ];

    let result;
    try {
      result = await adapter.requestSelect({
        title: t("View member profile:"),
        options,
        console,
      });
    } catch {
      return; // ESC → back to main
    }

    const idx = options.indexOf(result.value);
    if (idx < 0 || idx >= session.users.length) return;

    const user = session.users[idx];
    console.info("");
    console.info(Logger.style(`  ─── ${user.name} ───`, { bold: true }));
    console.info("");
    printUserCard(console, t, user);

    // Payment history for this member
    if (session.db) {
      const payments = await loadPayments(
        session.db,
        (p) => p.userId === user.email,
      );
      if (payments.length > 0) {
        console.info("");
        console.info(
          Logger.style(`  ─── ${t("Payment history")} ───`, {
            color: Logger.DIM,
          }),
        );
        const pcols = [t("Date"), t("Amount"), t("Status")];
        const pdata = payments.map((p) => {
          const statusColor =
            p.status === PaymentStatus.CONFIRMED
              ? Logger.GREEN
              : p.status === PaymentStatus.FAILED
                ? Logger.RED
                : Logger.YELLOW;
          return {
            [pcols[0]]: new Date(p.createdAt).toLocaleDateString(),
            [pcols[1]]: `${p.amount} ${p.method}`,
            [pcols[2]]: Logger.style(
              t(p.status.charAt(0).toUpperCase() + p.status.slice(1)),
              { color: statusColor },
            ),
          };
        });
        console.table(pdata, pcols, { prefix: "  ", headBorder: 1 });
      }

      // Course progress for this member
      const progress = await loadProgress(session.db, user.email);
      if (progress && progress.completedSeries.length > 0) {
        console.info("");
        console.info(
          Logger.style(`  ─── ${t("Course progress")} ───`, {
            color: Logger.DIM,
          }),
        );
        for (const series of SERIES_CATALOG) {
          const done = progress.completedSeries.includes(series.number);
          const icon = done
            ? Logger.style("✓", { color: Logger.GREEN })
            : Logger.style("·", { color: Logger.DIM });
          console.info(
            `  ${icon} ${t("Series")} ${series.number}: ${t(series.title)}`,
          );
        }
        console.info(`  ${t("Progress")}: ${progress.progressPercent}%`);
      }
    }
  }
}
