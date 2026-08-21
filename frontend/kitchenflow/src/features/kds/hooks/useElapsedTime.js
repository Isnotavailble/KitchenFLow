import { useState, useEffect } from 'react'
import { getElapsedTime } from '../utils/timeFormatter'

/**
 * Hook providing a live elapsed timer for an order based on created_at.
 * Ticks smoothly every 1 second without flashing.
 */
export function useElapsedTime(createdAt) {
  const [elapsed, setElapsed] = useState(() => getElapsedTime(createdAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedTime(createdAt))
    }, 1000)

    return () => clearInterval(interval)
  }, [createdAt])

  return elapsed
}
