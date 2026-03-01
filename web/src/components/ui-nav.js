import { LitElement, html, css } from "lit";

/**
 * Top navigation bar component.
 * Matches the willni VitePress nav but as a Lit Web Component.
 *
 * @element ui-nav
 * @fires navigate - { detail: { path: string } }
 */
class UINav extends LitElement {
  static properties = {
    route: { type: String },
  };

  constructor() {
    super();
    this.route = "index";
  }

  static styles = css`
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      font-family:
        "Inter",
        -apple-system,
        sans-serif;
    }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
    }

    .logo img {
      height: 40px;
    }

    .menu {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(15px);
      border-radius: 30px;
      padding: 4px 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .menu a {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 8px 16px;
      border-radius: 20px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .menu a:hover {
      color: #fdf200;
      text-shadow: 0 0 15px rgba(253, 242, 0, 0.5);
    }

    .menu a[active] {
      color: #fdf200;
      background: rgba(253, 242, 0, 0.1);
    }

    @media (max-width: 768px) {
      .menu {
        display: none;
      }
    }
  `;

  /** @type {Array<{ label: string, path: string }>} */
  get _links() {
    return [
      { label: "Матриця", path: "superintellect/index" },
      { label: "Курс", path: "superintellect/course" },
      { label: "Реєстрація", path: "superintellect/registration" },
      { label: "Платформи", path: "PLATFORMS" },
    ];
  }

  /** @param {Event} e */
  _onNavigate(e, path) {
    e.preventDefault();
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { path },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <nav>
        <a class="logo" @click=${(e) => this._onNavigate(e, "index")}>
          <img src="/willni/logo.svg" alt="ВОЛЯ" />
        </a>
        <div class="menu">
          ${this._links.map(
            (link) => html`
              <a
                ?active=${this.route === link.path}
                @click=${(e) => this._onNavigate(e, link.path)}
                >${link.label}</a
              >
            `,
          )}
        </div>
      </nav>
    `;
  }
}

customElements.define("ui-nav", UINav);
export default UINav;
