/**
 * willni CLI — Registration & Moderation Protocol
 *
 * Configurable protocols for post-registration flow:
 * - auto: auto-login immediately after register (dev/demo)
 * - confirm: require confirmation code (email/phone — depends on transport)
 * - moderate: require admin approval before login
 *
 * These protocols are composable:
 * - { register: 'auto', moderate: false }     → instant access
 * - { register: 'confirm', moderate: false }  → confirm → access
 * - { register: 'auto', moderate: true }      → register → admin verify → access
 * - { register: 'confirm', moderate: true }   → confirm → admin verify → access
 */

/** @readonly @enum {string} */
export const RegisterProtocol = {
  /** Auto-login after registration. No confirmation needed. */
  AUTO: "auto",
  /** Require confirmation code (email, phone, 2LW — transport-agnostic). */
  CONFIRM: "confirm",
};

/**
 * @typedef {object} ProtocolConfig
 * @property {string} register - Registration protocol: 'auto' | 'confirm'
 * @property {boolean} moderate - Require admin verification after registration
 * @property {string} [transport] - Confirmation transport: 'email' | 'phone' | '2lw'
 */

/** @type {ProtocolConfig} */
export const DEFAULT_PROTOCOL = {
  register: RegisterProtocol.AUTO,
  moderate: false,
  transport: undefined,
};

/**
 * Determine if user should auto-login after registration.
 * @param {ProtocolConfig} protocol
 * @returns {boolean}
 */
export function shouldAutoLogin(protocol) {
  return protocol.register === RegisterProtocol.AUTO && !protocol.moderate;
}

/**
 * Determine if user needs confirmation before access.
 * @param {ProtocolConfig} protocol
 * @returns {boolean}
 */
export function needsConfirmation(protocol) {
  return protocol.register === RegisterProtocol.CONFIRM;
}

/**
 * Determine if user needs admin moderation.
 * @param {ProtocolConfig} protocol
 * @returns {boolean}
 */
export function needsModeration(protocol) {
  return protocol.moderate === true;
}

/**
 * Get human-readable status for newly registered user.
 * @param {ProtocolConfig} protocol
 * @returns {string} i18n key
 */
export function registrationStatusKey(protocol) {
  if (needsConfirmation(protocol) && needsModeration(protocol)) {
    return "Awaiting confirmation and admin approval";
  }
  if (needsConfirmation(protocol)) {
    return "Awaiting confirmation";
  }
  if (needsModeration(protocol)) {
    return "Awaiting admin approval";
  }
  return "Active";
}
