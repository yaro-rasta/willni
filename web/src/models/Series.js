export class Series {
  // ── Schema ──
  static number = {
    help: "Series number",
    default: 0,
    type: "number",
  }

  static title = {
    help: "Title",
    default: "",
    type: "string",
  }

  static theme = {
    help: "Theme",
    default: "",
    type: "string",
  }

  static contentPath = {
    help: "Content path",
    default: "",
    type: "string",
  }

  // ── Data ──
  /** @type {number} */ number
  /** @type {string} */ title
  /** @type {string} */ theme
  /** @type {string} */ contentPath

  /** @param {Partial<Series>} [data] */
  constructor(data = {}) {
    this.number = data.number ?? Series.number.default
    this.title = data.title ?? Series.title.default
    this.theme = data.theme ?? Series.theme.default
    this.contentPath =
      data.contentPath ?? `superintellect/series_${this.number}`
  }

  static from(input) {
    if (input instanceof Series) return input
    return new Series(input)
  }
}

/** @type {Series[]} */
export const SERIES_CATALOG = [
  new Series({
    number: 1,
    title: "Anatomy of Anxiety",
    theme: "Truth Filter via 4 laws of logic",
  }),
  new Series({
    number: 2,
    title: "Where Am I",
    theme: "Self-knowledge, point zero",
  }),
  new Series({
    number: 3,
    title: "Three Pillars",
    theme: "Stoicism, Rastafari, Solipsism",
  }),
  new Series({
    number: 4,
    title: "Architect vs Worker",
    theme: "From execution to design",
  }),
  new Series({
    number: 5,
    title: "Mission & Discipline",
    theme: "Daily practice",
  }),
  new Series({
    number: 6,
    title: "Manifesto of the Free",
    theme: "Transformation finale",
  }),
]
