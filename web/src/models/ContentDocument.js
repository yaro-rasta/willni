export class ContentDocument {
  // ── Schema ──
  static title = {
    help: "Title",
    default: "",
    type: "string",
  }

  static description = {
    help: "Description",
    default: "",
    type: "string",
  }

  static layout = {
    help: "Layout",
    default: "doc",
    type: "string",
    options: [
      { label: "Document", value: "doc" },
      { label: "Home", value: "home" },
    ],
  }

  static $content = {
    help: "Content blocks",
    default: [],
    type: "array",
  }

  // ── Data ──
  /** @type {string} */ title
  /** @type {string} */ description
  /** @type {string} */ layout
  /** @type {Array<{ type: string, text?: string, level?: number, items?: string[], ordered?: boolean }>} */
  $content

  /** @param {Partial<ContentDocument>} [data] */
  constructor(data = {}) {
    this.title = data.title ?? ContentDocument.title.default
    this.description = data.description ?? ContentDocument.description.default
    this.layout = data.layout ?? ContentDocument.layout.default
    this.$content = data.$content ?? [...ContentDocument.$content.default]
  }

  get isEmpty() {
    return this.$content.length === 0
  }

  get firstHeading() {
    return this.$content.find((b) => b.type === "heading")?.text
  }

  static from(input) {
    if (input instanceof ContentDocument) return input
    return new ContentDocument(input)
  }
}
