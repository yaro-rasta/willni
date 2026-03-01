/**
 * willni CLI — Profile command
 *
 * Shows current user's data, payment history, and course progress.
 */

import Logger from "@nan0web/log";
import { PaymentStatus } from "../../web/src/models/Payment.js";
import { SERIES_CATALOG } from "../../web/src/models/Series.js";
import { loadPayments, loadProgress } from "../db.mjs";
import { printUserCard, tierLabel, styledTier } from "./helpers.mjs";

/**
 * @param {object} ctx
 */
export async function runProfile(ctx) {
  const { console, adapter, t, session } = ctx;

  console.clear();

  if (!session.currentUser) {
    console.info(t("Not logged in"));
    console.info(
      Logger.style(`  ${t("Use Login to select a user")}`, {
        color: Logger.DIM,
      }),
    );
    return;
  }

  const user = session.currentUser;
  console.success(`${t("Profile")}: ${user.name}`);
  console.info("");

  // ─── User card ───────────────────────────────────
  printUserCard(console, t, user);
  console.info("");

  // ─── Payment history ─────────────────────────────
  if (session.db) {
    const payments = await loadPayments(
      session.db,
      (p) => p.userId === user.email,
    );

    if (payments.length > 0) {
      console.info(
        Logger.style(`  ─── ${t("Payment history")} ───`, {
          color: Logger.DIM,
        }),
      );
      console.info("");

      const cols = [t("Date"), t("Amount"), t("Status"), t("Tier")];
      const data = payments.map((p) => {
        const date = new Date(p.createdAt).toLocaleDateString();
        const statusColor =
          p.status === PaymentStatus.CONFIRMED
            ? Logger.GREEN
            : p.status === PaymentStatus.FAILED
              ? Logger.RED
              : Logger.YELLOW;
        return {
          [cols[0]]: date,
          [cols[1]]: `${p.amount} ${p.method}`,
          [cols[2]]: Logger.style(
            t(p.status.charAt(0).toUpperCase() + p.status.slice(1)),
            { color: statusColor },
          ),
          [cols[3]]: tierLabel(t, p.tier),
        };
      });
      console.table(data, cols, { prefix: "  ", headBorder: 1 });
    } else {
      console.info(
        Logger.style(`  ${t("No payments yet")}`, { color: Logger.DIM }),
      );
    }
    console.info("");
  }

  // ─── Course progress ─────────────────────────────
  if (session.db) {
    const progress = await loadProgress(session.db, user.email);

    console.info(
      Logger.style(`  ─── ${t("Course progress")} ───`, { color: Logger.DIM }),
    );
    console.info("");

    if (progress && progress.completedSeries.length > 0) {
      for (const series of SERIES_CATALOG) {
        const done = progress.completedSeries.includes(series.number);
        const icon = done
          ? Logger.style("✓", { color: Logger.GREEN })
          : Logger.style("·", { color: Logger.DIM });
        console.info(
          `  ${icon} ${t("Series")} ${series.number}: ${t(series.title)}`,
        );
      }
      console.info("");
      console.info(`  ${t("Progress")}: ${progress.progressPercent}%`);
    } else {
      console.info(
        Logger.style(`  ${t("Course not started")}`, { color: Logger.DIM }),
      );
    }
  }
}
