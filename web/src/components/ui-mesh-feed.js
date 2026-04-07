import { LitElement, html, css } from 'lit'
import { api } from '../api/UIAppAPI.js'

/**
 * Live Mesh Feed component.
 * Displays real-time messages from the Sovereign Mesh network via UIAppAPI.
 *
 * @element ui-mesh-feed
 */
export class UIMeshFeed extends LitElement {
	static properties = {
		messages: { type: Array, state: true },
		connected: { type: Boolean, state: true },
	}

	constructor() {
		super()
		this.messages = []
		this.connected = false
		this._onMessage = this._onMessage.bind(this)
		this._onStatus = this._onStatus.bind(this)
	}

	connectedCallback() {
		super.connectedCallback()
		api.addEventListener('mesh:message', this._onMessage)
		api.addEventListener('mesh:status', this._onStatus)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		api.removeEventListener('mesh:message', this._onMessage)
		api.removeEventListener('mesh:status', this._onStatus)
	}

	_onMessage(e) {
		this.messages = [e.detail, ...this.messages].slice(0, 50)
	}

	_onStatus(e) {
		this.connected = e.detail.connected
	}

	static styles = css`
		:host {
			display: block;
			background: rgba(255, 255, 255, 0.02);
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 16px;
			padding: 20px;
			max-height: 400px;
			overflow-y: auto;
			font-family: 'JetBrains Mono', 'Courier New', monospace;
			font-size: 13px;
			color: #b0b0b0;
		}
		.title {
			color: #fdf200;
			font-weight: bold;
			margin-bottom: 12px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.status {
			font-size: 10px;
			padding: 2px 8px;
			border-radius: 10px;
		}
		.status.connected {
			background: rgba(0, 255, 0, 0.1);
			color: #00ff00;
		}
		.status.disconnected {
			background: rgba(255, 0, 0, 0.1);
			color: #ff3333;
		}

		.msg {
			padding: 6px 0;
			border-bottom: 1px solid rgba(255, 255, 255, 0.05);
			animation: fadeIn 0.3s ease-out;
		}
		.msg:last-child {
			border: none;
		}
		.time {
			color: #666;
			margin-right: 8px;
		}
		.author {
			color: #f0c800;
			margin-right: 12px;
		}
		.type {
			padding: 1px 4px;
			border-radius: 3px;
			font-size: 10px;
			margin-right: 12px;
			text-transform: uppercase;
			display: inline-block;
			min-width: 45px;
			text-align: center;
		}
		.type-chat {
			background: rgba(0, 100, 255, 0.2);
			color: #00aaff;
		}
		.type-sos {
			background: rgba(255, 0, 0, 0.2);
			color: #ff5555;
			font-weight: bold;
		}
		.type-case {
			background: rgba(255, 255, 255, 0.1);
			color: #eee;
		}

		@keyframes fadeIn {
			from {
				opacity: 0;
				transform: translateY(5px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
	`

	render() {
		return html`
			<div class="title">
				<span>🛰️ MESH LIVE FEED (via UIAppAPI)</span>
				<span class="status ${this.connected ? 'connected' : 'disconnected'}">
					${this.connected ? 'ONLINE' : 'OFFLINE'}
				</span>
			</div>
			${this.messages.length === 0
				? html`<div>Scanning local mesh...</div>`
				: ''}
			${this.messages.map(
				(m) => html`
					<div class="msg">
						<span class="time"
							>${new Date(m.timestamp).toLocaleTimeString()}</span
						>
						<span class="type type-${m.type}">${m.type}</span>
						<span class="author">@${m.nodeId}</span>
						<span class="text"
							>${m.text || m.data?.subject || 'Signal pulse'}</span
						>
					</div>
				`,
			)}
		`
	}
}

customElements.define('ui-mesh-feed', UIMeshFeed)
