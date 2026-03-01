/**
 * willni Domain Models — Model as Schema
 *
 * Each class uses static fields for schema metadata (help, default, type,
 * options, validate) and instance fields for data.
 * help/label strings are human-readable English fallbacks.
 * i18n: t('E-mail') looks up translation, falls back to 'E-mail' itself.
 *
 * @module willni/models
 */

export { Tier } from "./Tier.js"
export { User } from "./User.js"
export { PaymentMethod, PaymentStatus, Payment } from "./Payment.js"
export { Series, SERIES_CATALOG } from "./Series.js"
export { CourseProgress } from "./CourseProgress.js"
export { ContentDocument } from "./ContentDocument.js"
export { distributeRevenue } from "./revenue.js"
