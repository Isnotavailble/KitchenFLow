import { useState, useEffect } from 'react'
import { getElapsedTime } from '../utils/timeFormatter'

/**
 * Hook providing relative time for an order based on created_at (e.g. "Just now", "3 mins ago").
 * Ticks every 10 seconds to keep live orders synchronized with server elapsed time.
 */
export function useElapsedTime(createdAt) {
  const [elapsed, setElapsed] = useState(() => getElapsedTime(createdAt))

  useEffect(() => {
    setElapsed(getElapsedTime(createdAt))

    const interval = setInterval(() => {
      setElapsed(getElapsedTime(createdAt))
    }, 10000)

    return () => clearInterval(interval)
  }, [createdAt])

  return elapsed
}
