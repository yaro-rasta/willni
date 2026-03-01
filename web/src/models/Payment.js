import { Tier } from "./Tier.js";

/** @readonly @enum {string} */
export const PaymentMethod = {
  BTC: "btc",
  USDT_TRC20: "usdt-trc20",
};

/** @readonly @enum {string} */
export const PaymentStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  FAILED: "failed",
};

export class Payment {
  // ── Schema ──
  static id = {
    help: "Payment ID",
    default: "",
    type: "string",
  };

  static userId = {
    help: "User ID",
    default: "",
    type: "string",
  };

  static tier = {
    help: "Tier",
    default: Tier.SUBSCRIPTION,
    type: "string",
    options: [
      { label: "Subscription", value: Tier.SUBSCRIPTION },
      { label: "VIP", value: Tier.VIP },
    ],
  };

  static method = {
    help: "Payment method",
    default: PaymentMethod.BTC,
    type: "string",
    options: [
      { label: "BTC", value: PaymentMethod.BTC },
      { label: "USDT (TRC-20)", value: PaymentMethod.USDT_TRC20 },
    ],
  };

  static amount = {
    help: "Amount",
    default: "",
    type: "string",
    validate: (v) =>
      (!isNaN(parseFloat(v)) && isFinite(v) && Number(v) > 0) ||
      "Amount must be a positive number",
  };

  static txHash = {
    help: "Transaction hash",
    default: "",
    type: "string",
    validate: (v) =>
      (v && v.trim().length >= 5) || "Transaction hash too short (min 5 chars)",
  };

  static status = {
    help: "Status",
    default: PaymentStatus.PENDING,
    type: "string",
    options: [
      { label: "Pending", value: PaymentStatus.PENDING },
      { label: "Confirmed", value: PaymentStatus.CONFIRMED },
      { label: "Failed", value: PaymentStatus.FAILED },
    ],
  };

  static createdAt = {
    help: "Created at",
    default: 0,
    type: "number",
  };

  // ── Data ──
  /** @type {string} */ id;
  /** @type {string} */ userId;
  /** @type {string} */ tier;
  /** @type {string} */ method;
  /** @type {string} */ amount;
  /** @type {string} */ txHash;
  /** @type {string} */ status;
  /** @type {number} */ createdAt;

  /** @param {Partial<Payment>} [data] */
  constructor(data = {}) {
    this.id = data.id ?? (crypto.randomUUID?.() || Date.now().toString(36));
    this.userId = data.userId ?? Payment.userId.default;
    this.tier = data.tier ?? Payment.tier.default;
    this.method = data.method ?? Payment.method.default;
    this.amount = data.amount ?? Payment.amount.default;
    this.txHash = data.txHash ?? Payment.txHash.default;
    this.status = data.status ?? Payment.status.default;
    this.createdAt = data.createdAt ?? Date.now();
  }

  get isConfirmed() {
    return this.status === PaymentStatus.CONFIRMED;
  }

  static from(input) {
    if (input instanceof Payment) return input;
    return new Payment(input);
  }
}
