/**
 * @param {number} total
 * @returns {{ founder: number, community: number, humanitarian: number, development: number }}
 */
export function distributeRevenue(total) {
  const founder = total * 0.01
  const share = (total - founder) / 3
  return { founder, community: share, humanitarian: share, development: share }
}
