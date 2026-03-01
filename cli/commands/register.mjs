/**
 * willni CLI — Register command
 *
 * Collect name, email, tier via Form, then set password.
 * Password is stored as scrypt hash.
 */

import Logger from "@nan0web/log";
import { Form } from "@nan0web/ui-cli";
import { User } from "../../web/src/models/User.js";
import { saveUser } from "../db.mjs";
import { hashPass } from "./admin.mjs";
import { shouldAutoLogin, registrationStatusKey } from "../protocol.mjs";
import { RegisterBody, printUserCard, styledTier } from "./helpers.mjs";

/**
 * @param {object} ctx
 */
export async function runRegister(ctx) {
  const { console, adapter, t, session, protocol } = ctx;

  console.clear();
  console.success(t("Registration"));
  console.info(t("Create a new user account") + "\n");

  const body = new RegisterBody();
  const handler = adapter.createHandler(["quit", "cancel", "exit"]);
  const selectHandler = adapter.createSelectHandler();
  const form = new Form(body, { inputFn: handler, selectFn: selectHandler, t });

  try {
    const result = await form.requireInput();
    if (result.cancelled) {
      console.info(t("Cancelled"));
      return;
    }

    const email = form.body.email;
    if (session.users.some((u) => u.email === email)) {
      console.error(t("User with this email already exists"));
      return;
    }

    // ─── Password ──────────────────────────────────
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

    const user = new User({
      name: form.body.name,
      email: form.body.email,
      tier: form.body.tier,
      passwordHash: hashPass(p1.value),
    });

    if (session.db) {
      await saveUser(session.db, user);
    }

    session.users.push(user);

    console.info("");
    console.success(`${t("User registered:")} (#${session.users.length})`);
    printUserCard(console, t, user);

    if (session.db) {
      console.info(
        Logger.style(`  💾 ${t("Saved to database")}`, { color: Logger.DIM }),
      );
    }

    const statusKey = registrationStatusKey(protocol);
    if (shouldAutoLogin(protocol)) {
      session.currentUser = user;
      console.info("");
      console.success(`${t("Logged in as")}: ${user.name}`);
    } else {
      console.info("");
      console.info(
        Logger.style(`  ⏳ ${t(statusKey)}`, { color: Logger.YELLOW }),
      );
    }
  } catch (err) {
    console.error(`${t("Error:")} ${err.message}`);
  }
}
