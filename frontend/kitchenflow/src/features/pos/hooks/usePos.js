import { useContext } from 'react'
import { PosContext } from '../context/posContextDef'

export function usePos() {
  const context = useContext(PosContext)
  if (!context) {
    throw new Error('usePos must be used within a PosProvider')
  }
  return context
}
