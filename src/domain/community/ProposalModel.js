import { CouncilProcedureModel } from '../council/CouncilProcedureModel.js'

/**
 * @docs
 * ### ProposalModel (Спільне Творення)
 * Модель пропозиції (Proposal) до Мережі Вольних Я.
 * Фінансується з Dev Fund або Гуманітарного Фонду тільки після
 * публічного голосування (2/3 "за" від активних Я), згідно зі Статтею 4.
 * Architecture: OLMUI Model-as-Schema
 */
export class ProposalModel {
	// ==========================================
	// 1. MODEL AS SCHEMA (Статичний опис полів)
	// ==========================================

	static FUNDING_QUORUM_RATIO = 2 / 3
	static MARKETPLACE_AUTHOR_PERCENT = 0.91 // 91% автору за додаток
	static MARKETPLACE_COMMUNITY_PERCENT = 0.09 // 9% спільноті на 1-33-33-33

	static id = { help: 'Унікальний ID пропозиції', type: 'string', required: true }
	/** @type {string} */
	id

	static authorDid = { help: 'DID автора (ініціатора)', type: 'string', required: true }
	/** @type {string} */
	authorDid

	static title = { help: 'Коротка назва проєкту (результату)', type: 'string', required: true }
	/** @type {string} */
	title

	static requestedAmount = { 
		help: 'Сума запитуваних WILLNI (seed)', 
		type: 'number', 
		required: true,
		validate: (val) => val > 0 ? true : 'Сума повинна бути більшою за нуль'
	}
	/** @type {number} */
	requestedAmount

	static fundSource = { 
		help: 'Джерело фінансування', 
		type: 'string',
		options: [
			{ value: 'dev', label: 'Фонд Розвитку (33%)' },
			{ value: 'humanitarian', label: 'Гуманітарна Мета / Захист (33%)' }
		], 
		default: 'dev' 
	}
	/** @type {'dev' | 'humanitarian'} */
	fundSource

	static supportVotes = { help: 'Кількість унікальних голосів "за" від Мережі', type: 'number', default: 0 }
	/** @type {number} */
	supportVotes

	static status = { 
		help: 'Статус пропозиції', 
		type: 'string',
		options: ['created', 'voting', 'funded', 'rejected'], 
		default: 'created' 
	}
	/** @type {'created' | 'voting' | 'funded' | 'rejected'} */
	status

	constructor(data = {}) {
		Object.assign(this, data)
		if (this.supportVotes === undefined) this.supportVotes = ProposalModel.supportVotes.default
		if (!this.status) this.status = ProposalModel.status.default
		if (!this.fundSource) this.fundSource = ProposalModel.fundSource.default
	}

	validate() {
		if (!this.id || !this.title || !this.authorDid || this.requestedAmount === undefined) {
			return { isValid: false, error: 'id, title, authorDid, and requestedAmount are required' }
		}
		if (this.requestedAmount <= 0) {
			return { isValid: false, error: 'Requested amount must be positive' }
		}
		return { isValid: true }
	}

	/**
	 * Оцінює, чи пройшла пропозиція кворум для фінансування з Фонду
	 * (2/3 активних Я проголосували "за").
	 */
	evaluateFundingStrategy(totalActiveNetworkUsers) {
		if (totalActiveNetworkUsers === 0) {
			return { isFunded: false, status: 'rejected' }
		}

		const requiredVotes = Math.ceil(totalActiveNetworkUsers * ProposalModel.FUNDING_QUORUM_RATIO)
		const isFunded = this.supportVotes >= requiredVotes

		const newStatus = isFunded ? 'funded' : 'rejected'

		// Мутуємо статус самої моделі
		this.status = newStatus

		return {
			isFunded,
			status: newStatus,
			requiredVotes,
			supportVotes: this.supportVotes
		}
	}

	// ==========================================
	// 2. AGNOSTIC LOGIC (Асинхронний Генератор OLMUI)
	// ==========================================
	async *run() {
		if (!this.id) {
			this.id = 'prop-' + Date.now().toString(36)
		}

		if (!this.authorDid) {
			const res = yield { type: 'ask', field: 'authorDid', schema: ProposalModel.authorDid }
			this.authorDid = res.value
		}

		if (!this.title) {
			const res = yield { type: 'ask', field: 'title', schema: ProposalModel.title }
			this.title = res.value
		}

		if (!this.requestedAmount) {
			const res = yield { type: 'ask', field: 'requestedAmount', schema: ProposalModel.requestedAmount }
			this.requestedAmount = Number(res.value)
		}

		if (!this.fundSource || !['dev', 'humanitarian'].includes(this.fundSource)) {
			const res = yield { type: 'ask', field: 'fundSource', schema: ProposalModel.fundSource }
			this.fundSource = res.value
		}

		yield { type: 'progress', message: `Створюється нова пропозиція "${this.title}"...` }

		const validation = this.validate()
		if (!validation.isValid) {
			yield { type: 'log', level: 'warn', message: `Помилка створення пропозиції: ${validation.error}` }
			return { type: 'result', data: null }
		}

		yield { type: 'log', level: 'info', message: `Пропозиція "${this.title}" успішно висунута на голосування (ID: ${this.id})!` }
		return { type: 'result', data: this }
	}
}
