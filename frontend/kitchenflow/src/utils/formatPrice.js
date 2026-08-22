/**
 * Format price in Myanmar Kyat (MMK) with comma thousands separators.
 * e.g., 8500 -> "8,500 MMK", 1000 -> "1,000 MMK"
 */
export const formatMMK = (price) => {
  const num = typeof price === 'number' ? price : Number(price) || 0
  return `${num.toLocaleString('en-US')} MMK`
}


/**
 * Format raw number with comma thousands separators.
 * e.g., 8500 -> "8,500"
 */
export const formatNumber = (num) => {
  const val = typeof num === 'number' ? num : Number(num) || 0
  return val.toLocaleString('en-US')
}

export default formatMMK
