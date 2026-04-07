import { CouncilProcedureModel } from '../council/CouncilProcedureModel.js'

/**
 * @docs
 * ### AntiCorruptionModel (Захист від Узурпації)
 * Відповідає за логіку Права на Fork та обробку сигналів недовіри
 * до Ради (Стаття 3г Кону).
 * Architecture: OLMUI Model-as-Schema
 */
export class AntiCorruptionModel {
	// ==========================================
	// 1. MODEL AS SCHEMA (Статичний опис полів)
	// ==========================================
	
	static modelName = 'AntiCorruptionShield'

	static signalId = { help: 'Унікальний ідентифікатор сигналу Fork', type: 'string', required: true }
	/** @type {string} */
	signalId

	static did = { help: 'DID учасника, що висловлює недовіру', type: 'string', required: true }
	/** @type {string} */
	did

	static timestamp = { help: 'Час подачі сигналу', type: 'string', default: () => new Date().toISOString() }
	/** @type {string} */
	timestamp

	constructor(data = {}) {
		Object.assign(this, data)
		if (!this.timestamp) this.timestamp = AntiCorruptionModel.timestamp.default()
	}

	validate() {
		if (!this.signalId || !this.did) {
			return { isValid: false, error: 'signalId and did are required' }
		}
		return { isValid: true }
	}

	/**
	 * Перевіряє, чи достатньо унікальних сигналів для активації процедури Fork
	 * (переобрання Ради) протягом 30 днів.
	 * 
	 * @param {Array<{did: string, timestamp: string}>} signals - Отримані сигнали (Array of AntiCorruptionModel)
	 * @param {number} totalNetworkUsers - Загальна кількість верифікованих Я
	 * @returns {{ isForkTriggered: boolean, uniqueSignalsCount: number, thresholdRequired: number }}
	 */
	static evaluateForkSignal(signals, totalNetworkUsers) {
		if (totalNetworkUsers <= 0) {
			return { isForkTriggered: false, uniqueSignalsCount: 0, thresholdRequired: 0 }
		}

		// Відфільтровуємо лише унікальні DID (кожен має лише 1 голос недовіри)
		const uniqueDids = new Set(signals.map(s => s.did))
		const uniqueSignalsCount = uniqueDids.size

		const thresholdRequired = Math.ceil(totalNetworkUsers * CouncilProcedureModel.FORK_SIGNAL_THRESHOLD_RATIO)

		return {
			isForkTriggered: uniqueSignalsCount >= thresholdRequired,
			uniqueSignalsCount,
			thresholdRequired
		}
	}

	// ==========================================
	// 2. AGNOSTIC LOGIC (Асинхронний Генератор OLMUI)
	// ==========================================
	async *run() {
		if (!this.signalId) {
			this.signalId = 'fork-' + Date.now().toString(36)
		}

		if (!this.did) {
			const res = yield { type: 'ask', field: 'did', schema: AntiCorruptionModel.did }
			this.did = res.value
		}

		yield { type: 'progress', message: `Фіксація сигналу недовіри (Захист від Узурпації)...` }

		const validation = this.validate()
		if (!validation.isValid) {
			yield { type: 'log', level: 'warn', message: `Помилка оформлення сигналу: ${validation.error}` }
			return { type: 'result', data: null }
		}

		yield { type: 'log', level: 'info', message: `Сигнал недовіри (${this.signalId}) від DID ${this.did} зареєстровано.` }
		return { type: 'result', data: this }
	}
}
