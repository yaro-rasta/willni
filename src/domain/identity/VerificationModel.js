/**
 * @docs
 * ### VerificationModel (Протокол Двох Живих Свідків - 2LW)
 * Відповідає за процес верифікації Я у Мережі (Стаття 6 Кону).
 * Architecture: OLMUI Model-as-Schema
 */
export class VerificationModel {
	// ==========================================
	// 1. MODEL AS SCHEMA (Статичний опис полів)
	// ==========================================

	static did = { 
		help: 'DID (корінь) учасника (Ed25519 public key)', 
		type: 'string', 
		required: true,
		validate: (val) => val ? true : 'DID is required'
	}
	/** @type {string} */
	did

	static witness1 = { 
		help: 'DID Першого Свідка', 
		type: 'string'
	}
	/** @type {string} */
	witness1

	static witness2 = { 
		help: 'DID Другого Свідка', 
		type: 'string'
	}
	/** @type {string} */
	witness2

	static witness3 = { 
		help: 'DID Третього Свідка (Тільки для Генезис-Кола)', 
		type: 'string'
	}
	/** @type {string} */
	witness3

	static witnesses = { help: 'DIDs of the witnesses who verified this person (minimum 2)', type: 'array', default: () => [] }
	/** @type {string[]} */
	witnesses

	static isGenesis = { 
		help: 'Це верифікація Генезис-Кола (без попередніх свідків)?', 
		type: 'boolean', 
		default: false,
		options: [{value: true, label: 'Так (Генезис-Коло 3+)'}, {value: false, label: 'Ні (Протокол 2LW)'}]
	}
	/** @type {boolean} */
	isGenesis

	static timestamp = { help: 'Час фізичної верифікації', type: 'string', default: () => new Date().toISOString() }
	/** @type {string} */
	timestamp

	constructor(data = {}) {
		Object.assign(this, data)
		if (this.witnesses === undefined) this.witnesses = VerificationModel.witnesses.default()
		if (this.isGenesis === undefined) this.isGenesis = VerificationModel.isGenesis.default
		if (!this.timestamp) this.timestamp = VerificationModel.timestamp.default()
		this.db = data.db
	}

	/**
	 * Перевіряє валідність акту верифікації за Коном (Стаття 6).
	 */
	validate() {
		if (!this.did) {
			return { isValid: false, error: 'DID is required for verification' }
		}

		if (!Array.isArray(this.witnesses)) {
			return { isValid: false, error: 'Witnesses must be an array of DIDs' }
		}

		const uniqueWitnesses = new Set(this.witnesses)
		if (uniqueWitnesses.size !== this.witnesses.length) {
			return { isValid: false, error: 'Witnesses must be unique individuals' }
		}

		if (this.witnesses.includes(this.did)) {
			return { isValid: false, error: 'An individual cannot be a witness for themselves' }
		}

		if (this.isGenesis) {
			// Стаття 6.1: Генезис-Коло починається з мінімум 3 вольних Я
			if (this.witnesses.length < 3) {
				return { isValid: false, error: 'Genesis Circle requires at least 3 mutual witnesses' }
			}
		} else {
			// Стаття 6.2: Протокол 2LW: підтвердження мінімум 2 вже верифікованих Я
			if (this.witnesses.length < 2) {
				return { isValid: false, error: '2LW Protocol requires at least 2 verified witnesses' }
			}
		}

		return { isValid: true }
	}

	static from(input) {
		if (input instanceof VerificationModel) return input
		return new VerificationModel(input)
	}

	// ==========================================
	// 2. AGNOSTIC LOGIC (Асинхронний Генератор OLMUI)
	// ==========================================
	async *run() {
		if (!this.did) {
			const res = yield { type: 'ask', field: 'did', schema: VerificationModel.did }
			this.did = res.value
		}

		if (this.isGenesis === undefined || this.isGenesis === null || typeof this.isGenesis !== 'boolean') {
			const res = yield { type: 'ask', field: 'isGenesis', schema: VerificationModel.isGenesis }
			this.isGenesis = res.value === 'true' || res.value === true
		}

		if (!this.witness1) {
			const res = yield { type: 'ask', field: 'witness1', schema: VerificationModel.witness1 }
			this.witness1 = res.value
		}

		if (!this.witness2) {
			const res = yield { type: 'ask', field: 'witness2', schema: VerificationModel.witness2 }
			this.witness2 = res.value
		}

		this.witnesses = [this.witness1, this.witness2]

		if (this.isGenesis && !this.witness3) {
			const res = yield { type: 'ask', field: 'witness3', schema: VerificationModel.witness3 }
			this.witness3 = res.value
			this.witnesses.push(this.witness3)
		}

		yield { type: 'progress', message: `Валідація протоколу ${this.isGenesis ? 'Генезис-Кола' : '2LW'}...` }

		const check = this.validate()
		if (!check.isValid) {
			yield { type: 'log', level: 'warn', message: `Помилка верифікації: ${check.error}` }
			return { type: 'result', data: null }
		}

		if (this.db) {
			const verifiedList = (await this.db.loadDocument('identity/verified')) || []
			verifiedList.push({
				did: this.did,
				witnesses: this.witnesses,
				isGenesis: this.isGenesis,
				timestamp: this.timestamp
			})
			await this.db.saveDocument('identity/verified', verifiedList)
		}

		yield { type: 'log', level: 'info', message: `Я [DID: ${this.did}] успішно верифіковано (${this.witnesses.length} свідків)!` }
		return { type: 'result', data: this }
	}
}
