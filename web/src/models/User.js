import { Tier } from "./Tier.js";

/**
 * User model — schema + instance.
 *
 * Schema is in static `schema` object to avoid
 * shadowing built-in `Function.name`.
 *
 * Roles: ["u"] = regular user, ["u", "admin"] = admin.
 * Password stored as scrypt hash (salt:hash hex).
 */
export class User {
  // ── Schema (static object, not separate statics) ──
  static schema = {
    name: {
      help: "Name",
      default: "",
      type: "string",
    },
    email: {
      help: "E-mail",
      default: "",
      type: "string",
      validate: (v) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ||
        "Invalid email format",
    },
    tier: {
      help: "Tier",
      default: Tier.FREE,
      type: "enum",
      options: [
        { label: "Free", value: Tier.FREE },
        { label: "Subscription", value: Tier.SUBSCRIPTION },
        { label: "VIP", value: Tier.VIP },
        { label: "Mentor", value: Tier.MENTOR },
      ],
    },
    verified: {
      help: "Verified",
      default: false,
      type: "boolean",
    },
    passwordHash: {
      help: "Password hash",
      default: "",
      type: "string",
    },
    roles: {
      help: "Roles",
      default: ["u"],
      type: "array",
    },
    createdAt: {
      help: "Created at",
      default: 0,
      type: "number",
    },
  };

  // ── Instance fields with defaults ──
  /** @type {string} */ name = User.schema.name.default;
  /** @type {string} */ email = User.schema.email.default;
  /** @type {string} */ tier = User.schema.tier.default;
  /** @type {boolean} */ verified = User.schema.verified.default;
  /** @type {string} */ passwordHash = User.schema.passwordHash.default;
  /** @type {string[]} */ roles = [...User.schema.roles.default];
  /** @type {number} */ createdAt = Date.now();

  /** @param {Partial<User>} [data] */
  constructor(data = {}) {
    Object.assign(this, data);
  }

  get isSubscriber() {
    return this.tier !== Tier.FREE;
  }

  get isVIP() {
    return this.tier === Tier.VIP || this.tier === Tier.MENTOR;
  }

  get isMentor() {
    return this.tier === Tier.MENTOR;
  }

  get isAdmin() {
    return this.roles?.includes("admin");
  }

  /** @returns {number} */
  get votes() {
    return { free: 0, subscription: 1, vip: 9, mentor: 12 }[this.tier] ?? 0;
  }

  /** @returns {boolean} */
  get hasDividends() {
    return this.tier !== Tier.FREE;
  }

  static from(input) {
    if (input instanceof User) return input;
    return new User(input);
  }
}
