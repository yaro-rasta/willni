import { LitElement, html, css } from "lit";
import "./ui-markdown.js";

/**
 * Page layout component.
 * Renders document content with proper spacing and loading states.
 *
 * @element ui-page
 * @property {Object} document - JSON document with $content
 * @property {boolean} loading - Loading state
 * @property {string} error - Error message
 */
class UIPage extends LitElement {
  static properties = {
    document: { type: Object },
    loading: { type: Boolean },
    error: { type: String },
  };

  constructor() {
    super();
    this.document = null;
    this.loading = true;
    this.error = "";
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 120px 32px 96px;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .title {
      font-size: clamp(2.5rem, 7vw, 4rem);
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 0.95;
      margin: 0 0 2rem;
      background: linear-gradient(135deg, #fff 30%, #666);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .meta {
      color: rgba(255, 255, 255, 0.4);
      font-size: 14px;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      color: rgba(255, 255, 255, 0.3);
      font-size: 1.2rem;
    }

    .loading::after {
      content: "";
      width: 24px;
      height: 24px;
      margin-left: 12px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: #fdf200;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }

    .error-code {
      font-size: 6rem;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.06);
      line-height: 1;
    }

    .error-text {
      color: rgba(255, 255, 255, 0.4);
      font-size: 1.1rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .content {
        padding: 100px 20px 64px;
      }
    }
  `;

  render() {
    if (this.loading) {
      return html`<div class="loading">Завантаження</div>`;
    }

    if (this.error) {
      return html`
        <div class="error">
          <div class="error-code">404</div>
          <div class="error-text">${this.error}</div>
        </div>
      `;
    }

    if (!this.document) return html``;

    const { title, description, layout, $content = [] } = this.document;

    return html`
      <div class="content">
        ${title ? html`<h1 class="title">${title}</h1>` : ""}
        ${description ? html`<p class="meta">${description}</p>` : ""}
        <ui-markdown .content=${$content}></ui-markdown>
      </div>
    `;
  }
}

customElements.define("ui-page", UIPage);
export default UIPage;
