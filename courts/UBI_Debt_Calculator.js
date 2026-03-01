/**
 * Суверенний Калькулятор Боргу (UBI Energy)
 * Формула на основі Конституційної Істини (yaro.page/i)
 */

const DEBT_PER_CITIZEN_BASIS = 62000000; // База за 28 років
const START_DATE = new Date("1996-06-28T00:00:00Z"); // День Конституції
const DEBT_BASIS_YEARS = 28;

// Розрахунок боргу в секунду (на основі 28-річного циклу)
const DEBT_PER_SECOND =
  DEBT_PER_CITIZEN_BASIS / DEBT_BASIS_YEARS / 365.25 / 24 / 3600;

// Окрема енергія за катування (CASE-TORTURE)
const TORTURE_START_DATE = new Date("2023-02-09T03:00:00Z");
const BTC_RATE_PER_DAY = 1.0;

export function calculateSovereignDebt() {
  const now = new Date();

  // 1. Конституційний борг (Гривня)
  const timeSinceConstitution = (now - START_DATE) / 1000; // в секундах
  const uahDebt = timeSinceConstitution * DEBT_PER_SECOND;

  // 2. Енергетичний борг за катування (BTC)
  const timeSinceTorture = Math.abs(now - TORTURE_START_DATE);
  const diffDays = Math.ceil(timeSinceTorture / (1000 * 60 * 60 * 24));
  const btcDebt = diffDays * BTC_RATE_PER_DAY;

  return {
    uahConstitutionDebt: uahDebt.toFixed(0),
    btcTortureEnergy: btcDebt.toFixed(2),
    daysSinceConstitution: (
      timeSinceConstitution /
      (3600 * 24 * 365.25)
    ).toFixed(2),
    lastUpdate: now.toISOString(),
  };
}

const currentStatus = calculateSovereignDebt();
console.log(`--- АктуалІзаціЯ Боргу Системи ---`);
console.log(`Років прожито в Системі: ${currentStatus.daysSinceConstitution}`);
console.log(`Конституційний Борг: ${currentStatus.uahConstitutionDebt} грн`);
console.log(`Енергія Боргу (BTC): ${currentStatus.btcTortureEnergy}`);
