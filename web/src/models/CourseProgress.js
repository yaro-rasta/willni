export class CourseProgress {
  // ── Schema ──
  static userId = {
    help: "User ID",
    default: "",
    type: "string",
  }

  static currentSeries = {
    help: "Current series",
    default: 1,
    type: "number",
  }

  static completedSeries = {
    help: "Completed series",
    default: [],
    type: "array",
  }

  static startedAt = {
    help: "Started at",
    default: 0,
    type: "number",
  }

  // ── Data ──
  /** @type {string} */ userId
  /** @type {number} */ currentSeries
  /** @type {number[]} */ completedSeries
  /** @type {number} */ startedAt

  /** @param {Partial<CourseProgress>} [data] */
  constructor(data = {}) {
    this.userId = data.userId ?? CourseProgress.userId.default
    this.currentSeries =
      data.currentSeries ?? CourseProgress.currentSeries.default
    this.completedSeries = data.completedSeries ?? [
      ...CourseProgress.completedSeries.default,
    ]
    this.startedAt = data.startedAt ?? Date.now()
  }

  /** @param {number} n */
  isUnlocked(n) {
    if (n === 1) return true
    return this.completedSeries.includes(n - 1)
  }

  /** @param {number} n */
  completeSeries(n) {
    if (!this.completedSeries.includes(n)) {
      this.completedSeries.push(n)
      this.completedSeries.sort((a, b) => a - b)
    }
    if (n >= this.currentSeries && n < 6) {
      this.currentSeries = n + 1
    }
  }

  /** @returns {number} 0..100 */
  get progressPercent() {
    return Math.round((this.completedSeries.length / 6) * 100)
  }

  static from(input) {
    if (input instanceof CourseProgress) return input
    return new CourseProgress(input)
  }
}
