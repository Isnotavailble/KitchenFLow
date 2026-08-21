/**
 * Calculates live elapsed duration from a created_at timestamp string or Date object.
 * Returns formatted time e.g. "12:45 min", total minutes, and threshold level.
 * 
 * Thresholds (Option 3):
 * - Fresh: < 5 mins
 * - Moderate: 5 - 9.99 mins
 * - Urgent / Priority: >= 10 mins
 */
export function getElapsedTime(createdAt) {
  if (!createdAt) {
    return {
      formatted: '00:00 min',
      mins: 0,
      secs: 0,
      threshold: 'fresh',
      isPriority: false,
      colorClass: 'text-zinc-500'
    }
  }

  const createdTime = new Date(createdAt).getTime()
  const now = Date.now()
  const diffMs = Math.max(0, now - createdTime)
  const totalSeconds = Math.floor(diffMs / 1000)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60

  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} min`

  let threshold = 'fresh'
  let colorClass = 'text-zinc-500'
  let isPriority = false

  if (mins >= 10) {
    threshold = 'urgent'
    colorClass = 'text-rose-600 font-bold'
    isPriority = true
  } else if (mins >= 5) {
    threshold = 'moderate'
    colorClass = 'text-amber-600 font-medium'
  }

  return {
    formatted,
    totalSeconds,
    mins,
    secs,
    threshold,
    isPriority,
    colorClass
  }
}
