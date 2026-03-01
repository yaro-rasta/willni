import uk from "./uk.mjs";

/** @type {Map<string, string>} */
export const localesMap = new Map([
  ["en", "English"],
  ["uk", "Українська"],
]);

/** @type {Record<string, Record<string, string>>} */
const vocabs = { uk };

/**
 * @param {string} locale
 * @returns {(key: string) => string}
 */
export default function getT(locale) {
  const dict = vocabs[locale];
  if (!dict) return (k) => k;
  return (k) => dict[k] ?? k;
}
