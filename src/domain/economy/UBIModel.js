/**
 * @docs
 * ### UBIModel (Економіка Синергії)
 * Реалізує розподіл ресурсів за моделлю 1-33-33-33 (Стаття 5 Кону).
 * Застосовує ізоляцію для від'єднаних.
 * Architecture: OLMUI Model-as-Schema
 */
export class UBIModel {
	// ==========================================
	// 1. MODEL AS SCHEMA (Статичний опис полів)
	// ==========================================

	static modelName = '1-33-33-33'
	static PERCENT_FOUNDER = 0.01 // 1% координація
	static PERCENT_UBI = 0.33 // 33% Безумовний Дохід
	static PERCENT_DEV = 0.33 // 33% Розвиток технологій
	static PERCENT_HUMANITARIAN = 0.33 // 33% Гуманітарна та оборонна підтримка

	static amount = { 
		help: 'Сума (seed) для розподілу 1-33-33-33', 
		type: 'number', 
		required: true,
		validate: (val) => val > 0 ? true : 'Сума має бути більше нуля'
	}
	/** @type {number} */
	amount

	constructor(data = {}) {
		Object.assign(this, data)
		this.db = data.db
	}

	/**
	 * Розподіл вхідної суми (токени або seed) відповідно до Кону.
	 * @param {number} amount Сума для розподілу
	 * @returns {{ founder: number, ubi: number, dev: number, humanitarian: number }}
	 */
	static distribute(amount) {
		const ubi = Math.floor(amount * this.PERCENT_UBI)
		const dev = Math.floor(amount * this.PERCENT_DEV)
		const humanitarian = Math.floor(amount * this.PERCENT_HUMANITARIAN)
		// Rest goes to founder to avoid precision loss on 1%
		const founder = amount - ubi - dev - humanitarian

		return {
			founder,
			ubi,
			dev,
			humanitarian
		}
	}

	/**
	 * Розраховує UBI на одного учасника (якщо учасник не від'єднаний).
	 * @param {number} ubiPool Загальний фонд UBI
	 * @param {Array<{did: string, role?: string, isDisconnected: boolean}>} networkUsers Всі верифіковані користувачі Мережі
	 * @returns {{ perCapita: number, eligibleCount: number }} 
	 */
	static calculatePerCapita(ubiPool, networkUsers) {
		// Стаття 5.3: Від'єднані втрачають право на UBI
		const eligibleUsers = networkUsers.filter(user => !user.isDisconnected)
		
		if (eligibleUsers.length === 0) {
			return { perCapita: 0, eligibleCount: 0 }
		}

		// Рівна частка від Community Fund
		const perCapita = Math.floor(ubiPool / eligibleUsers.length)
		
		return { perCapita, eligibleCount: eligibleUsers.length }
	}

	// ==========================================
	// 2. AGNOSTIC LOGIC (Асинхронний Генератор OLMUI)
	// ==========================================
	async *run() {
		if (!this.amount) {
			const res = yield { type: 'ask', field: 'amount', schema: UBIModel.amount }
			this.amount = Number(res.value)
		}

		const validation = UBIModel.amount.validate(this.amount)
		if (validation !== true) {
			yield { type: 'log', level: 'warn', message: `Помилка: ${validation}` }
			return { type: 'result', data: null }
		}

		yield { type: 'progress', message: 'Розподіл за пропорцією 1-33-33-33...' }

		const distribution = UBIModel.distribute(this.amount)

		if (this.db) {
			const history = (await this.db.loadDocument('economy/ubi_distribution')) || []
			history.push({
				amount: this.amount,
				...distribution,
				timestamp: new Date().toISOString(),
			})
			await this.db.saveDocument('economy/ubi_distribution', history)
		}

		yield { type: 'log', level: 'info', message: `Результат: UBI ${distribution.ubi}, Dev ${distribution.dev}, Hum ${distribution.humanitarian}, Founder ${distribution.founder}` }
		return { type: 'result', data: distribution }
	}
}
