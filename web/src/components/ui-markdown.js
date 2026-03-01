import { LitElement, html, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

/**
 * Markdown content renderer.
 * Renders $content blocks (heading, paragraph, list, code, blockquote, hr).
 *
 * @element ui-markdown
 * @property {Array} content - $content array from JSON document
 */
class UIMarkdown extends LitElement {
  static properties = {
    content: { type: Array },
  };

  constructor() {
    super();
    this.content = [];
  }

  static styles = css`
    :host {
      display: block;
      line-height: 1.7;
      color: #e0e0e0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #fff;
      margin: 2rem 0 1rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      background: linear-gradient(135deg, #fff 30%, #888);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h2 {
      font-size: 1.8rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.5rem;
    }

    h3 {
      font-size: 1.4rem;
    }
    h4 {
      font-size: 1.15rem;
    }

    p {
      margin: 1rem 0;
      color: rgba(255, 255, 255, 0.8);
    }

    ul,
    ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
    }

    li {
      margin: 0.4rem 0;
      color: rgba(255, 255, 255, 0.8);
    }

    li::marker {
      color: #fdf200;
    }

    pre {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 20px 24px;
      overflow-x: auto;
      margin: 1.5rem 0;
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);
    }

    blockquote {
      border-left: 4px solid #fdf200;
      padding: 1rem 1.5rem;
      margin: 1.5rem 0;
      background: rgba(253, 242, 0, 0.03);
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: rgba(255, 255, 255, 0.75);
    }

    hr {
      border: none;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      margin: 3rem 0;
    }

    /* Inline formatting */
    strong,
    b {
      color: #fff;
    }
    em,
    i {
      color: rgba(255, 255, 255, 0.9);
    }

    a {
      color: #fdf200;
      text-decoration: none;
      border-bottom: 1px solid rgba(253, 242, 0, 0.3);
      transition: border-color 0.3s;
    }

    a:hover {
      border-bottom-color: #fdf200;
    }

    code {
      background: rgba(255, 255, 255, 0.06);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: "SF Mono", monospace;
      font-size: 0.9em;
    }
  `;

  /**
   * Parse inline markdown (bold, italic, links, inline code)
   * @param {string} text
   * @returns {string} HTML
   */
  _parseInline(text) {
    if (!text) return "";
    return text
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank">$1</a>',
      );
  }

  /** @param {object} block */
  _renderBlock(block) {
    switch (block.type) {
      case "heading": {
        const tag = `h${block.level || 1}`;
        return html`${unsafeHTML(
          `<${tag}>${this._parseInline(block.text)}</${tag}>`,
        )}`;
      }

      case "paragraph":
        return html`<p>${unsafeHTML(this._parseInline(block.text))}</p>`;

      case "list":
        if (block.ordered) {
          return html`<ol>
            ${block.items.map(
              (item) => html`<li>${unsafeHTML(this._parseInline(item))}</li>`,
            )}
          </ol>`;
        }
        return html`<ul>
          ${block.items.map(
            (item) => html`<li>${unsafeHTML(this._parseInline(item))}</li>`,
          )}
        </ul>`;

      case "code":
        return html`<pre><code>${block.text}</code></pre>`;

      case "blockquote":
        return html`<blockquote>
          ${unsafeHTML(this._parseInline(block.text))}
        </blockquote>`;

      case "hr":
        return html`<hr />`;

      default:
        return html`<p>${block.text || ""}</p>`;
    }
  }

  render() {
    if (!this.content || this.content.length === 0) {
      return html``;
    }
    return html`${this.content.map((block) => this._renderBlock(block))}`;
  }
}

customElements.define("ui-markdown", UIMarkdown);
export default UIMarkdown;
