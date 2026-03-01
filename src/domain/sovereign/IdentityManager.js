import { Crypto } from '../../../../../nan.web/packages/auth-core/src/index.js'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Manages local Sovereign Identity (Ed25519 Keys).
 * Stores keys in cli/data/identity.json.
 */
export class IdentityManager {
	#privateKey = null
	#publicKey = null
	#filePath = null

	constructor(dataDir = 'data') {
		this.#filePath = path.join(process.cwd(), dataDir, 'identity.json')
	}

	get publicKey() {
		return this.#publicKey
	}

	get privateKey() {
		return this.#privateKey
	}

	/**
	 * Load existing identity or generate new one.
	 */
	load() {
		if (fs.existsSync(this.#filePath)) {
			const data = JSON.parse(fs.readFileSync(this.#filePath, 'utf-8'))
			this.#privateKey = data.privateKey
			this.#publicKey = data.publicKey
			return false // Not new
		} else {
			const { publicKey, privateKey } = Crypto.generateKeyPair()
			this.#privateKey = privateKey
			this.#publicKey = publicKey
			this.save()
			return true // New
		}
	}

	save() {
		const dir = path.dirname(this.#filePath)
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
		fs.writeFileSync(
			this.#filePath,
			JSON.stringify(
				{
					publicKey: this.#publicKey,
					privateKey: this.#privateKey,
				},
				null,
				2,
			),
			'utf-8',
		)
	}

	/**
	 * Sign content using private key.
	 * @param {string} content
	 * @returns {string} Base64 signature
	 */
	sign(content) {
		if (!this.#privateKey) throw new Error('Identity not loaded')
		return Crypto.sign(this.#privateKey, content)
	}

	/**
	 * Verify signature using public key.
	 */
	verify(content, signature, publicKey = this.#publicKey) {
		return Crypto.verify(publicKey, content, signature)
	}
}
