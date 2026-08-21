import React, { useState, useEffect } from 'react'
import { ThemeContext } from './themeContextDef'

export function ThemeProvider({ children }) {
  // Explicitly initialize to false (Light Mode)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('kitchenflow_theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('kitchenflow_theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
