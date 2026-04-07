import { CouncilProcedureModel } from './CouncilProcedureModel.js'

/**
 * @docs
 * ### CouncilCaseModel (Рада - Звернення та Справа)
 * Модель справи стосовно можливого від'єднання учасника (Стаття 3).
 * Architecture: OLMUI Model-as-Schema
 */
export class CouncilCaseModel {
	// ==========================================
	// 1. MODEL AS SCHEMA (Статичний опис полів)
	// ==========================================

	static id = { help: 'Унікальний ID справи', type: 'string', required: true }
	/** @type {string} */
	id

	static initiatorDid = { help: 'DID ініціатора (того, хто подає)', type: 'string', required: true }
	/** @type {string} */
	initiatorDid

	static respondentDid = { help: 'DID звинуваченого (від\'єднуваного)', type: 'string', required: true }
	/** @type {string} */
	respondentDid

	static evidence = { help: 'Масив доказів (посилання, тексти, підписи)', type: 'array', default: () => [] }
	/** @type {string[]} */
	evidence

	static status = { 
		help: 'Статус справи', 
		type: 'string', 
		options: ['initiated', 'active', 'appealed', 'closed-disconnect', 'closed-acquitted'], 
		default: 'initiated' 
	}
	/** @type {'initiated' | 'active' | 'appealed' | 'closed-disconnect' | 'closed-acquitted'} */
	status

	static severityLevel = { 
		help: 'Запитуваний рівень від\'єднання (1-5)', 
		type: 'number', 
		default: 1,
		options: [
			{ value: 1, label: '1 - Мінімальна (1 рік)' },
			{ value: 2, label: '2 - Помірна (3 роки)' },
			{ value: 3, label: '3 - Значна (9 років)' },
			{ value: 4, label: '4 - Тяжка (33 роки)' },
			{ value: 5, label: '5 - Абсолютна (99 років)' }
		],
		validate: (val) => (val >= 1 && val <= 5) ? true : 'Рівень має бути від 1 до 5'
	}
	/** @type {1|2|3|4|5} */
	severityLevel

	static jurors = { help: 'Список DID присяжних (мінімум 12)', type: 'array', default: () => [] }
	/** @type {string[]} */
	jurors

	static votesForDisconnect = { help: 'Кількість голосів ЗА від\'єднання', type: 'number', default: 0 }
	/** @type {number} */
	votesForDisconnect

	static createdAt = { help: 'Час ініціації (ISO 8601)', type: 'string', default: () => new Date().toISOString() }
	/** @type {string} */
	createdAt

	constructor(data = {}) {
		Object.assign(this, data)
		if (!this.evidence) this.evidence = CouncilCaseModel.evidence.default()
		if (!this.status) this.status = CouncilCaseModel.status.default
		if (!this.jurors) this.jurors = CouncilCaseModel.jurors.default()
		if (this.votesForDisconnect === undefined) this.votesForDisconnect = CouncilCaseModel.votesForDisconnect.default
		if (!this.createdAt) this.createdAt = CouncilCaseModel.createdAt.default()
		if (this.severityLevel === undefined) this.severityLevel = CouncilCaseModel.severityLevel.default
		this.db = data.db
	}

	validate() {
		if (!this.id || !this.initiatorDid || !this.respondentDid) {
			return { isValid: false, error: 'id, initiatorDid, and respondentDid are required' }
		}
		if (this.initiatorDid === this.respondentDid) {
			return { isValid: false, error: 'initiator cannot accuse themselves' }
		}
		const sevCheck = CouncilCaseModel.severityLevel.validate(this.severityLevel)
		if (sevCheck !== true) {
			return { isValid: false, error: sevCheck }
		}
		return { isValid: true }
	}

	/**
	 * Дає оцінку чи було рішення прийняте на основі зібраних голосів і кворуму.
	 * Звертається до CouncilProcedureModel для валідації 2/3.
	 */
	evaluateDecision() {
		if (this.status === 'closed-disconnect' || this.status === 'closed-acquitted') {
			return { finalized: true, currentStatus: this.status }
		}
		
		if (this.jurors.length < CouncilProcedureModel.JURY_SIZE_MIN) {
			return { finalized: false, reason: 'Not enough jurors active' }
		}
		
		const isQuorumReached = CouncilProcedureModel.isQuorumReached(this.jurors.length, this.votesForDisconnect)
		
		if (isQuorumReached) {
			const yearsMap = { 1: 1, 2: 3, 3: 9, 4: 33, 5: 99 }
			return { 
				finalized: true, 
				newStatus: 'closed-disconnect', 
				disconnectYears: yearsMap[this.severityLevel] 
			}
		} else {
			return { 
				finalized: true, 
				newStatus: 'closed-acquitted' 
			}
		}
	}

	static from(input) {
		if (input instanceof CouncilCaseModel) return input
		return new CouncilCaseModel(input)
	}

	// ==========================================
	// 2. AGNOSTIC LOGIC (Асинхронний Генератор OLMUI)
	// ==========================================
	async *run() {
		if (!this.id) {
			this.id = 'case-' + Date.now().toString(36)
		}

		if (!this.initiatorDid) {
			const res = yield { type: 'ask', field: 'initiatorDid', schema: CouncilCaseModel.initiatorDid }
			this.initiatorDid = res.value
		}
		
		if (!this.respondentDid) {
			const res = yield { type: 'ask', field: 'respondentDid', schema: CouncilCaseModel.respondentDid }
			this.respondentDid = res.value
		}

		if (!this.severityLevel || this.severityLevel === 1) { // ask if default
			const res = yield { type: 'ask', field: 'severityLevel', schema: CouncilCaseModel.severityLevel }
			this.severityLevel = Number(res.value)
		}

		yield { type: 'progress', message: `Ініціалізація справи Ради проти ${this.respondentDid}...` }

		const validation = this.validate()
		if (!validation.isValid) {
			yield { type: 'log', level: 'warn', message: `Помилка реєстрації справи: ${validation.error}` }
			return { type: 'result', data: null }
		}

		if (this.db) {
			const cases = (await this.db.loadDocument('council/cases')) || []
			cases.push({
				id: this.id,
				initiatorDid: this.initiatorDid,
				respondentDid: this.respondentDid,
				status: this.status,
				severityLevel: this.severityLevel,
				votesForDisconnect: this.votesForDisconnect,
				createdAt: this.createdAt
			})
			await this.db.saveDocument('council/cases', cases)
		}

		yield { type: 'log', level: 'info', message: `Справу успішно сформовано. ID: ${this.id}` }
		return { type: 'result', data: this }
	}

	async *executeDecision() {
		const decision = this.evaluateDecision()
		
		yield { type: 'progress', message: `Екзекуція рішення по справі ${this.id}...` }

		if (!decision.finalized) {
			yield { type: 'log', level: 'warn', message: `Рішення по справі ${this.id} ще не фіналізовано: ${decision.reason}` }
			return { type: 'result', data: null }
		}

		this.status = decision.newStatus

		if (this.db) {
			// Update the specific case status in council/cases
			const cases = (await this.db.loadDocument('council/cases')) || []
			const existingIndex = cases.findIndex(c => c.id === this.id)
			if (existingIndex >= 0) {
				cases[existingIndex].status = this.status
				await this.db.saveDocument('council/cases', cases)
			}

			// Add to disconnected registry if convicted
			if (decision.newStatus === 'closed-disconnect') {
				const disconnected = (await this.db.loadDocument('council/disconnected')) || []
				disconnected.push({
					did: this.respondentDid,
					disconnectedAt: new Date().toISOString(),
					disconnectYears: decision.disconnectYears,
					reasonCaseId: this.id
				})
				await this.db.saveDocument('council/disconnected', disconnected)
			}
		}

		yield { type: 'log', level: 'info', message: `Екзекуцію завершено. Статус: ${this.status}` }
		return { type: 'result', data: decision }
	}
}
