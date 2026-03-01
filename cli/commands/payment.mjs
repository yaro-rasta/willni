/**
 * willni CLI — Payment command
 */

import Logger from "@nan0web/log";
import { Form } from "@nan0web/ui-cli";
import { Payment } from "../../web/src/models/Payment.js";
import { savePayment } from "../db.mjs";
import { PaymentBody, styledTier } from "./helpers.mjs";

/**
 * @param {object} ctx
 */
export async function runPayment(ctx) {
  const { console, adapter, t, session } = ctx;

  console.clear();
  console.success(t("New Payment"));
  console.info("");

  if (session.currentUser) {
    console.info(
      `  ${t("Paying as")}: ${Logger.style(session.currentUser.name, { bold: true })} (${session.currentUser.email})`,
    );
    console.info("");
  } else {
    console.info(
      Logger.style(
        `  ⚠ ${t("Not logged in — payment will not be linked to user")}`,
        { color: Logger.YELLOW },
      ),
    );
    console.info("");
  }

  const body = new PaymentBody();
  const handler = adapter.createHandler(["quit", "cancel", "exit"]);
  const selectHandler = adapter.createSelectHandler();
  const form = new Form(body, { inputFn: handler, selectFn: selectHandler, t });

  try {
    const result = await form.requireInput();
    if (result.cancelled) {
      console.info(t("Cancelled"));
      return;
    }

    const payment = new Payment({
      tier: form.body.tier,
      method: form.body.method,
      amount: form.body.amount,
      txHash: form.body.txHash,
      userId: session.currentUser?.email || "",
    });

    if (session.db) {
      await savePayment(session.db, payment);
    }

    const methodLabel = t(
      Payment.method.options.find((o) => o.value === payment.method)?.label ||
        payment.method,
    );
    const statusLabel = t(
      Payment.status.options.find((o) => o.value === payment.status)?.label ||
        payment.status,
    );

    console.info("");
    console.success(t("Payment created:"));
    const pad = 18;
    console.info(`  ${t("Payment ID").padEnd(pad)}: ${payment.id}`);
    if (payment.userId) {
      console.info(`  ${t("User").padEnd(pad)}: ${payment.userId}`);
    }
    console.info(`  ${t("Payment method").padEnd(pad)}: ${methodLabel}`);
    console.info(`  ${t("Amount").padEnd(pad)}: ${payment.amount}`);
    console.info(`  ${t("Transaction hash").padEnd(pad)}: ${payment.txHash}`);
    console.info(
      `  ${t("Status").padEnd(pad)}: ${Logger.style(statusLabel, { color: Logger.YELLOW })}`,
    );
    if (session.db) {
      console.info(
        Logger.style(`  💾 ${t("Saved to database")}`, { color: Logger.DIM }),
      );
    }
  } catch (err) {
    console.error(`${t("Error:")} ${err.message}`);
  }
}
