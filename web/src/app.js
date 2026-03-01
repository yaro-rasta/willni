import { LitElement, html, css } from "lit";
import "./components/ui-nav.js";
import "./components/ui-markdown.js";
import "./components/ui-page.js";
import "./components/ui-sea.js";

/**
 * Root application component.
 * Orchestrates routing, data loading, and component composition.
 *
 * @element ui-app
 */
class UIApp extends LitElement {
  static properties = {
    route: { type: String, state: true },
    document: { type: Object, state: true },
    loading: { type: Boolean, state: true },
    error: { type: String, state: true },
  };

  constructor() {
    super();
    this.route = this._getRoute();
    this.document = null;
    this.loading = true;
    this.error = "";
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      font-family:
        "Inter",
        -apple-system,
        sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #e0e0e0;
      background: #000206;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("popstate", () => {
      this.route = this._getRoute();
      this._loadContent();
    });
    this._loadContent();
  }

  /** @returns {string} */
  _getRoute() {
    const path = location.pathname
      .replace(/^\/willni\/?/, "")
      .replace(/\/$/, "");
    return path || "index";
  }

  async _loadContent() {
    this.loading = true;
    this.error = "";
    try {
      // Fetch static JSON directly for the MVP (GitHub Pages static deploy)
      let cleanRoute = this.route.replace(/^\/+/, "");
      if (!cleanRoute) cleanRoute = "index";
      const res = await fetch(`/willni/data/content/${cleanRoute}.json`);
      if (!res.ok) throw new Error(`${res.status}`);
      this.document = await res.json();
    } catch (err) {
      this.error = `Сторінку "${this.route}" не знайдено`;
      this.document = null;
    }
    this.loading = false;
  }

  /** @param {string} path */
  navigate(path) {
    const clean = path.replace(/^\//, "").replace(/\/$/, "") || "index";
    history.pushState(null, "", `/willni/${clean}`);
    this.route = clean;
    this._loadContent();
  }

  render() {
    return html`
      <ui-sea></ui-sea>
      <ui-nav
        .route=${this.route}
        @navigate=${(e) => this.navigate(e.detail.path)}
      ></ui-nav>
      <ui-page
        .document=${this.document}
        .loading=${this.loading}
        .error=${this.error}
      ></ui-page>
    `;
  }
}

customElements.define("ui-app", UIApp);
