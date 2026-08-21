import { useCallback } from 'react'

/**
 * Web Audio API synthesizer for kitchen notifications.
 * Plays high-clarity bell frequencies without external audio file dependencies.
 */
export function playKitchenChimeAudio(soundEnabled = true) {
  if (!soundEnabled) return

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc2.type = 'triangle'

    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc2.frequency.setValueAtTime(880, now + 0.08) // A5

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.08)
    osc1.stop(now + 0.5)
    osc2.stop(now + 0.5)
  } catch {
    // Audio playback prevented or unavailable in browser environment
  }
}

export function useKitchenChime() {
  const playChime = useCallback((soundEnabled = true) => {
    playKitchenChimeAudio(soundEnabled)
  }, [])

  return { playChime }
}
