import React from 'react'
import { KdsProvider } from './context/KdsContext'
import KdsPage from './KdsPage'

export function KdsFeature() {
  return (
    <KdsProvider>
      <KdsPage />
    </KdsProvider>
  )
}

export default KdsFeature
