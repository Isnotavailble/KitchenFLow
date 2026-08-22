import { useEffect, useRef } from 'react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { subscribeToOrderStream } from '../services/sseService'
import { playKitchenChimeAudio } from '../features/kds/hooks/useKitchenChime'

/**
 * Global SSE Listener Component
 * Awakens the real-time Server-Sent Events stream as soon as any user logs in.
 * Handles order-created, order-updated, and menu-updated events.
 * Closes the connection cleanly when the user logs out.
 */
export default function SseGlobalListener() {
  const { user, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const addToastRef = useRef(addToast)

  useEffect(() => {
    addToastRef.current = addToast
  }, [addToast])

  useEffect(() => {
    // Only awaken the SSE stream when user is logged in
    if (!isAuthenticated || !user) return

    const unsubscribe = subscribeToOrderStream({
      onConnect: () => {
        console.log('[SSE] Live stream connected for user:', user.username)
      },
      onOrderCreated: (rawOrder) => {
        const orderNum = rawOrder.orderNumber || rawOrder.id
        playKitchenChimeAudio(true)
        addToastRef.current?.(`New Live Order #${orderNum} received!`, 'new_order')
        window.dispatchEvent(new CustomEvent('kf:order-created', { detail: rawOrder }))
      },
      onOrderUpdated: (rawOrder) => {
        const orderNum = rawOrder.orderNumber || rawOrder.id
        const isCompleted = rawOrder.status === 'completed' || rawOrder.status === 'COMPLETED'
        const isCancelled = rawOrder.status === 'cancelled' || rawOrder.status === 'CANCELLED'

        if (isCompleted) {
          playKitchenChimeAudio(true)
          addToastRef.current?.(`Order #${orderNum} is Ready for Pickup!`, 'success')
        } else if (isCancelled) {
          addToastRef.current?.(`Order #${orderNum} was Cancelled`, 'warning')
        }

        window.dispatchEvent(new CustomEvent('kf:order-updated', { detail: rawOrder }))
      },
      onMenuUpdated: (menuData) => {
        if (typeof menuData?.isAvailable === 'boolean' && menuData?.name) {
          addToastRef.current?.(`"${menuData.name}" is now ${menuData.isAvailable ? 'Available' : 'Unavailable'}`, 'info')
        } else if (menuData?.deleted) {
          addToastRef.current?.('A menu item was deleted', 'info')
        }
        window.dispatchEvent(new CustomEvent('kf:menu-updated', { detail: menuData }))
      },
      onCategoryUpdated: (catData) => {
        window.dispatchEvent(new CustomEvent('kf:category-updated', { detail: catData }))
      },


      onError: (err) => {
        console.warn('[SSE] Orders stream reconnecting...', err)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [isAuthenticated, user?.id])

  return null
}
