import { useContext } from 'react'
import { KdsContext } from '../context/kdsContextDef'

export function useKds() {
  const context = useContext(KdsContext)
  if (!context) {
    throw new Error('useKds must be used within a KdsProvider')
  }
  return context
}
