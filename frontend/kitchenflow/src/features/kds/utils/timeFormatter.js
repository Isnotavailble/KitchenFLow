export function parseTimestampMs(createdAt) {
  if (!createdAt) return null
  if (typeof createdAt === 'number') return createdAt
  if (createdAt instanceof Date) return createdAt.getTime()
  return new Date(createdAt).getTime()
}

/**
 * Formats a timestamp into human-readable relative time (minutes/hours ago).
 *
 * Examples:
 * - < 1 min: "Just now"
 * - 1 min: "1 min ago"
 * - 2 - 59 mins: "N mins ago"
 * - 1 hour: "1 hour ago"
 * - 2+ hours: "N hours ago"
 *
 * Thresholds:
 * - Fresh (< 5 mins): text-emerald-600
 * - Moderate (5 - 9 mins): text-amber-600
 * - Urgent (>= 10 mins): text-rose-600
 */
export function getElapsedTime(createdAt) {
  if (!createdAt) {
    return {
      formatted: 'Just now',
      mins: 0,
      threshold: 'fresh',
      isPriority: false,
      colorClass: 'text-emerald-600'
    }
  }

  const createdTime = parseTimestampMs(createdAt)
  if (createdTime == null || isNaN(createdTime)) {
    return {
      formatted: 'Just now',
      mins: 0,
      threshold: 'fresh',
      isPriority: false,
      colorClass: 'text-emerald-600'
    }
  }

  const now = Date.now()
  const diffMs = Math.max(0, now - createdTime)
  const mins = Math.floor(diffMs / 60000)

  let formatted = 'Just now'
  if (mins >= 120) {
    const hours = Math.floor(mins / 60)
    formatted = `${hours} hours ago`
  } else if (mins >= 60) {
    formatted = '1 hour ago'
  } else if (mins === 1) {
    formatted = '1 min ago'
  } else if (mins > 1) {
    formatted = `${mins} mins ago`
  }

  let threshold = 'fresh'
  let colorClass = 'text-emerald-600'
  let isPriority = false

  if (mins >= 10) {
    threshold = 'urgent'
    colorClass = 'text-rose-600'
    isPriority = true
  } else if (mins >= 5) {
    threshold = 'moderate'
    colorClass = 'text-amber-600'
  }

  return {
    formatted,
    mins,
    threshold,
    isPriority,
    colorClass
  }
}
