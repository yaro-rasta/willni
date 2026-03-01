/**
 * willni CLI — Access Guards
 *
 * Middleware-style functions to check access before commands.
 * Each guard returns true if access is allowed, false otherwise.
 */

import Logger from "@nan0web/log";

/**
 * Requires the user to be logged in.
 * @param {object} ctx
 * @returns {boolean}
 */
export function requireAuth(ctx) {
  if (!ctx.session.currentUser) {
    ctx.console.error(ctx.t("Login required"));
    return false;
  }
  return true;
}

/**
 * Requires the user to have a specific role.
 * @param {object} ctx
 * @param {string} role
 * @returns {boolean}
 */
export function requireRole(ctx, role) {
  if (!requireAuth(ctx)) return false;
  if (!ctx.session.currentUser.roles?.includes(role)) {
    ctx.console.error(ctx.t("Access denied"));
    return false;
  }
  return true;
}

/**
 * Requires the user to be an admin.
 * @param {object} ctx
 * @returns {boolean}
 */
export function requireAdmin(ctx) {
  return requireRole(ctx, "admin");
}

/**
 * Requires the user to be verified.
 * @param {object} ctx
 * @returns {boolean}
 */
export function requireVerified(ctx) {
  if (!requireAuth(ctx)) return false;
  if (!ctx.session.currentUser.verified) {
    ctx.console.info(
      Logger.style(`  ⏳ ${ctx.t("Awaiting admin approval")}`, {
        color: Logger.YELLOW,
      }),
    );
    return false;
  }
  return true;
}
