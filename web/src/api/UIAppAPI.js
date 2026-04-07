/**
 * UIAppAPI — Central API interface for willni Web application.
 * Handles:
 * - WebSocket Mesh connection (UDP bridge)
 * - Content fetching (MD as JSON)
 * - Offline sync (future)
 */
export class UIAppAPI extends EventTarget {
	constructor(options = {}) {
		super()
		this.options = {
			apiPort: 3333,
			wsPort: 3333,
			...options,
		}
		this._ws = null
		this._reconnectTimer = null
	}

	/**
	 * Connect to the Mesh WebSocket Bridge.
	 *
	 * @param {string} host
	 */
	connect(host = location.hostname) {
		if (this._ws) return

		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
		const url = `${protocol}//${host}:${this.options.wsPort}`
		console.log(`📡 Connecting to Mesh Bridge: ${url}`)

		this._ws = new WebSocket(url)

		this._ws.onopen = () => {
			console.log('✅ Connected to Mesh Bridge')
			this.dispatchEvent(
				new CustomEvent('mesh:status', { detail: { connected: true } }),
			)
		}

		this._ws.onclose = () => {
			console.warn('❌ Disconnected from Mesh Bridge')
			this._ws = null
			this.dispatchEvent(
				new CustomEvent('mesh:status', { detail: { connected: false } }),
			)
			this._reconnectTimer = setTimeout(() => this.connect(host), 3000)
		}

		this._ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				this.dispatchEvent(new CustomEvent('mesh:message', { detail: data }))
			} catch (err) {
				console.error('API Mesh Error:', err)
			}
		}
	}

	/**
	 * Fetch document content by slug.
	 *
	 * @param {string} slug
	 * @returns {Promise<Object>}
	 */
	async fetchContent(slug) {
		const clean = slug.replace(/^\/+/, '') || 'index'
		// Use server API in dev, or static paths in production (GitHub Pages)
		const res = await fetch(`/willni/data/content/${clean}.json`)
		if (!res.ok) throw new Error(`${res.status}`)
		return res.json()
	}
}

// Global instance
export const api = new UIAppAPI()
