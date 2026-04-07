/**
 * @docs
 * ### CouncilProcedureModel (Процедура Ради)
 * Містить константи та правила формування Ради за Коном (Стаття 3б, 3в, 3г).
 */
export class CouncilProcedureModel {
	// Стаття 3б. Процедура Ради
	static JURY_SIZE_MIN = 12
	static QUORUM_RATIO = 2 / 3
	static JURY_COOLDOWN_MONTHS = 6
	static PREPARATION_DAYS_MIN = 14
	static MAX_TRIAL_DURATION_DAYS = 90
	static IMPEACHMENT_THRESHOLD = 3 // Мінімум 3 верифікованих Я для скарги на присяжного

	// Стаття 3в. Апеляція
	static APPEAL_WINDOW_DAYS = 30
	static APPEAL_STAKE_WILLNI = 99

	// Стаття 3г. Захист від Узурпації
	static FORK_SIGNAL_THRESHOLD_RATIO = 1 / 3
	static FORK_WINDOW_DAYS = 30

	/**
	 * Перевіряє чи досягнуто кворум 2/3 для прийняття рішення.
	 * @param {number} totalVotes Всього присяжних 
	 * @param {number} yesVotes Голосів 'за'
	 * @returns {boolean}
	 */
	static isQuorumReached(totalVotes, yesVotes) {
		if (totalVotes < this.JURY_SIZE_MIN) return false
		const threshold = Math.ceil(totalVotes * this.QUORUM_RATIO)
		return yesVotes >= threshold
	}
}
