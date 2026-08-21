import { useState, useEffect } from 'react'
import { getElapsedTime } from '../utils/timeFormatter'

/**
 * Hook providing relative time for an order based on created_at (e.g. "Just now", "3 mins ago").
 * Optimized to tick only once every 30 seconds, preventing unnecessary re-renders across the grid.
 */
export function useElapsedTime(createdAt) {
  const [elapsed, setElapsed] = useState(() => getElapsedTime(createdAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedTime(createdAt))
    }, 30000)

    return () => clearInterval(interval)
  }, [createdAt])

  return elapsed
}
