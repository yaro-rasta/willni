/**
 * willni CLI — Login command
 *
 * User must enter email + password.
 * If user has no password set, forces password creation.
 */

import Logger from "@nan0web/log";
import { needsModeration } from "../protocol.mjs";
import { hashPass, verifyPass } from "./admin.mjs";
import { saveUser } from "../db.mjs";
import { styledTier } from "./helpers.mjs";

/**
 * @param {object} ctx
 */
export async function runLogin(ctx) {
  const { console, adapter, t, session, protocol } = ctx;

  console.clear();
  console.success(t("Login"));
  console.info("");

  if (session.currentUser) {
    console.info(
      `  ${t("Logged in as")}: ${session.currentUser.name} (${session.currentUser.email})`,
    );
    console.info(`  ${t("Tier")}: ${styledTier(t, session.currentUser.tier)}`);
    console.info("");
    const res = await adapter.requestToggle({
      message: t("Logout?"),
      initial: false,
      active: t("yes"),
      inactive: t("no"),
    });
    if (res.value) {
      session.currentUser = null;
      console.success(t("Logged out"));
    }
    return;
  }

  if (session.users.length === 0) {
    console.info(t("No members yet. Register first."));
    return;
  }

  // ─── User enters email ───────────────────────────
  const emailResult = await adapter.requestInput({
    prompt: `${t("Your email")}: `,
  });
  if (emailResult.cancelled) return;

  const email = (emailResult.value || "").trim().toLowerCase();
  if (!email) return;

  const user = session.users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    console.info("");
    console.error(t("User not found. Check email or register first."));
    return;
  }

  // ─── Password ────────────────────────────────────
  if (!user.passwordHash) {
    // Force password setup for users without one
    console.info("");
    console.info(
      Logger.style(`  ⚙ ${t("Set password for first login")}`, {
        color: Logger.YELLOW,
      }),
    );
    console.info("");

    const p1 = await adapter.requestInput({
      prompt: `${t("Set password")}: `,
      type: "password",
    });
    if (p1.cancelled) return;

    if (!p1.value || p1.value.length < 4) {
      console.error(t("Password too short (min 4 chars)"));
      return;
    }

    const p2 = await adapter.requestInput({
      prompt: `${t("Confirm password")}: `,
      type: "password",
    });
    if (p2.cancelled) return;

    if (p1.value !== p2.value) {
      console.error(t("Passwords do not match"));
      return;
    }

    user.passwordHash = hashPass(p1.value);
    if (session.db) await saveUser(session.db, user);
    console.info(
      Logger.style(`  ✓ ${t("Password saved")}`, { color: Logger.GREEN }),
    );
    console.info("");
  } else {
    const passResult = await adapter.requestInput({
      prompt: `${t("Password")}: `,
      type: "password",
    });
    if (passResult.cancelled) return;

    if (!verifyPass(passResult.value, user.passwordHash)) {
      console.info("");
      console.error(t("Wrong password"));
      return;
    }
  }

  if (needsModeration(protocol) && !user.verified) {
    console.info("");
    console.info(
      Logger.style(`  ⏳ ${t("Awaiting admin approval")}`, {
        color: Logger.YELLOW,
      }),
    );
    return;
  }

  session.currentUser = user;
  console.info("");
  console.success(`${t("Logged in as")}: ${user.name}`);
  console.info(`  ${t("Tier")}: ${styledTier(t, user.tier)}`);
}
