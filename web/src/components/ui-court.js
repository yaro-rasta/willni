import { LitElement, html, css } from 'lit'
import { api } from '../api/UIAppAPI.js'

/**
 * UI Court Registry component.
 * Visual registry of judicial cases and interactive voting interface.
 *
 * @element ui-court
 */
export class UICourt extends LitElement {
	static properties = {
		cases: { type: Array, state: true },
		activeCase: { type: Object, state: true },
	}

	constructor() {
		super()
		this.cases = []
		this.activeCase = null
		this._onMessage = this._onMessage.bind(this)
	}

	connectedCallback() {
		super.connectedCallback()
		api.addEventListener('mesh:message', this._onMessage)
		// Load history if any (mocker for now)
		this._loadMockHistory()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		api.removeEventListener('mesh:message', this._onMessage)
	}

	_onMessage(e) {
		const msg = e.detail
		if (msg.type === 'soscase') {
			this.cases = [msg, ...this.cases]
		}
	}

	_loadMockHistory() {
		this.cases = [
			{
				timestamp: Date.now() - 3600000,
				nodeId: 'node-alpha',
				data: {
					subject: 'Violation of Privacy',
					defendant: 'Google Inc.',
					description: 'Unauthorized data gathering via cookies.',
					evidence: 'ipfs://QmXoyp... (Video Evidence)',
				},
			},
		]
	}

	static styles = css`
		:host {
			display: block;
			font-family: inherit;
			color: #eee;
		}
		.court-header {
			display: flex;
			align-items: center;
			gap: 15px;
			margin-bottom: 30px;
			padding-bottom: 10px;
			border-bottom: 2px solid #fdf200;
		}
		.court-header h2 {
			margin: 0;
			font-size: 1.5rem;
			letter-spacing: 1px;
		}

		.cases-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			gap: 20px;
		}

		.case-card {
			background: rgba(255, 255, 255, 0.03);
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 12px;
			padding: 20px;
			transition: all 0.3s ease;
			cursor: pointer;
		}
		.case-card:hover {
			background: rgba(255, 255, 255, 0.07);
			border-color: #fdf200;
			transform: translateY(-4px);
		}
		.case-id {
			color: #666;
			font-size: 10px;
			font-family: monospace;
		}
		.case-title {
			font-weight: bold;
			font-size: 1.2rem;
			margin: 10px 0;
			color: #fff;
		}
		.case-defendant {
			color: #f0c800;
			font-size: 0.9rem;
			margin-bottom: 12px;
		}
		.status-tag {
			font-size: 10px;
			padding: 2px 8px;
			background: rgba(0, 255, 255, 0.1);
			color: #00ffff;
			border-radius: 4px;
			text-transform: uppercase;
		}

		.case-details {
			margin-top: 20px;
			padding: 20px;
			background: rgba(0, 0, 0, 0.4);
			border-radius: 12px;
			border: 1px solid #fdf200;
		}
		.evidence-link {
			color: #00aaff;
			text-decoration: none;
			font-size: 12px;
		}

		.jury-panel {
			margin-top: 20px;
			padding: 15px;
			background: rgba(253, 242, 0, 0.05);
			border-radius: 8px;
			border-left: 4px solid #fdf200;
		}
		.jury-title {
			font-size: 11px;
			color: #fdf200;
			text-transform: uppercase;
			margin-bottom: 10px;
		}
		.btn-vote {
			background: #fdf200;
			color: #000;
			border: none;
			padding: 8px 16px;
			border-radius: 6px;
			font-weight: bold;
			cursor: pointer;
			margin-right: 10px;
		}
		.btn-vote:hover {
			background: #fff;
		}
	`

	render() {
		return html`
			<div class="court-header">
				<h2>🏛️ SOVEREIGN COURT REGISTRY</h2>
				<span class="status-tag">Live via Mesh</span>
			</div>

			<div class="cases-grid">
				${this.cases.map(
					(c) => html`
						<div class="case-card" @click=${() => (this.activeCase = c)}>
							<div class="case-id">
								#${c.timestamp.toString(36).toUpperCase()}
							</div>
							<div class="case-title">${c.data.subject}</div>
							<div class="case-defendant">Defandant: ${c.data.defendant}</div>
							<div class="case-id">
								Discovered: ${new Date(c.timestamp).toLocaleString()}
							</div>
						</div>
					`,
				)}
			</div>

			${this.activeCase
				? html`
						<div class="case-details">
							<h3>Case Analysis: ${this.activeCase.data.subject}</h3>
							<p>${this.activeCase.data.description}</p>
							<div>
								<strong>Evidence:</strong>
								<a href="#" class="evidence-link"
									>${this.activeCase.data.evidence}</a
								>
							</div>

							<div class="jury-panel">
								<div class="jury-title">
									🤖 AI PROMPTED JURY (Council of Sages)
								</div>
								<p style="font-size: 13px; color: #b0b0b0;">
									Current Matrix suggests:
									<b>94% Violation of Integrity Pattern</b>. Models:
									<i>Socrates (Legacy), Tesla (Flow), Jobs (Innovation).</i>
								</p>
								<button class="btn-vote">GUILTY</button>
								<button
									class="btn-vote"
									style="background:transparent; border:1px solid #666; color: #666;"
								>
									ACQUIT
								</button>
							</div>
						</div>
					`
				: ''}
		`
	}
}

customElements.define('ui-court', UICourt)
