/**
 * Lightweight, Asynchronous SSE Stream Client for KitchenFlow
 * Uses native async fetch + ReadableStream (non-blocking, zero CPU overhead while idle).
 * Implements a strict 3-retry connection policy with stepped backoff.
 */

let activeAbortController = null
let isConnecting = false
let reconnectTimer = null
let retryCount = 0
const MAX_RETRIES = 3
const subscribers = new Set()

export function subscribeToOrderStream(callbacks = {}) {
  subscribers.add(callbacks)

  if (!activeAbortController && !isConnecting) {
    retryCount = 0
    startStream()
  }

  return () => {
    subscribers.delete(callbacks)
    if (subscribers.size === 0) {
      stopGlobalStream()
    }
  }
}

export function stopGlobalStream() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (activeAbortController) {
    activeAbortController.abort()
    activeAbortController = null
  }
  isConnecting = false
  retryCount = 0
}

async function startStream() {
  const token = localStorage.getItem('kf_access_token')
  if (!token || isConnecting) return

  isConnecting = true
  activeAbortController = new AbortController()

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  const url = `${baseUrl.replace(/\/+$/, '')}/orders/stream`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      signal: activeAbortController.signal
    })

    isConnecting = false

    if (!response.ok) {
      throw new Error(`SSE stream returned HTTP ${response.status}`)
    }

    // Reset retry counter on successful handshake
    retryCount = 0
    subscribers.forEach((sub) => sub.onConnect?.())

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (activeAbortController && !activeAbortController.signal.aborted) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() || ''

      for (const chunk of chunks) {
        if (!chunk.trim()) continue

        const lines = chunk.split('\n')
        let eventName = 'message'
        let rawData = ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('event:')) {
            eventName = trimmed.substring(6).trim()
          } else if (trimmed.startsWith('data:')) {
            rawData = trimmed.substring(5).trim()
          }
        }

        if (rawData) {
          try {
            const data = JSON.parse(rawData)
            if (eventName === 'order-created') {
              subscribers.forEach((sub) => sub.onOrderCreated?.(data))
            } else if (eventName === 'order-updated') {
              subscribers.forEach((sub) => sub.onOrderUpdated?.(data))
            } else if (eventName === 'menu-updated') {
              subscribers.forEach((sub) => sub.onMenuUpdated?.(data))
            } else if (eventName === 'category-updated') {
              subscribers.forEach((sub) => sub.onCategoryUpdated?.(data))
            }

          } catch {
            if (eventName === 'INIT') {
              subscribers.forEach((sub) => sub.onConnect?.())
            }
          }
        }
      }
    }
  } catch (err) {
    isConnecting = false
    if (err.name !== 'AbortError') {
      subscribers.forEach((sub) => sub.onError?.(err))

      if (retryCount < MAX_RETRIES && subscribers.size > 0 && localStorage.getItem('kf_access_token')) {
        retryCount++
        const delay = retryCount * 2000 // 2s, 4s, 6s
        console.warn(`[SSE] Connection dropped. Retrying (${retryCount}/${MAX_RETRIES}) in ${delay / 1000}s...`)

        reconnectTimer = setTimeout(() => {
          startStream()
        }, delay)
      } else if (retryCount >= MAX_RETRIES) {
        console.warn(`[SSE] Reached maximum retry limit (${MAX_RETRIES}). Stream paused.`)
      }
    }
  } finally {
    isConnecting = false
  }
}
