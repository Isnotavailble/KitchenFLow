import { WORKLOAD_TIERS, WORKLOAD_CATEGORIES } from '../constants/kdsConstants'

/**
 * Calculates the internal workload complexity rating for an order.
 * Mathematical calculation: SUM(item.quantity * item.tierWeight)
 * Returns category and badge styling variant without exposing raw mathematical formula.
 */
export function calculateOrderComplexity(items = []) {
  const totalPoints = items.reduce((sum, item) => {
    const tierWeight = item.tier || WORKLOAD_TIERS.LIGHT
    return sum + (item.qty * tierWeight)
  }, 0)

  let category = WORKLOAD_CATEGORIES.LIGHT
  let variant = 'light'

  if (totalPoints >= 5 && totalPoints <= 10) {
    category = WORKLOAD_CATEGORIES.MEDIUM
    variant = 'medium'
  } else if (totalPoints >= 11) {
    category = WORKLOAD_CATEGORIES.HEAVY
    variant = 'heavy'
  }

  return {
    points: totalPoints,
    category,
    variant
  }
}
