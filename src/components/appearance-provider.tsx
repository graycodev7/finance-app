"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface AppearanceContextType {
  customAppearance: boolean
  setCustomAppearance: (value: boolean) => void
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined)

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [customAppearance, setCustomAppearance] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Asegurar que el componente esté montado (hidratación)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sincronizar con el tema de next-themes
  useEffect(() => {
    if (!mounted) return
    
    // Usar resolvedTheme para obtener el tema real (sistema resuelto)
    const currentTheme = resolvedTheme || theme
    const shouldActivate = currentTheme === "dark"
    
    console.log('Theme check:', { theme, resolvedTheme, currentTheme, shouldActivate })
    
    if (customAppearance !== shouldActivate) {
      setCustomAppearance(shouldActivate)
    }
  }, [theme, resolvedTheme, customAppearance, mounted])

  useEffect(() => {
    if (!mounted) return
    
    // Aplicar el atributo data al elemento html
    const htmlElement = document.documentElement
    if (customAppearance) {
      htmlElement.setAttribute('data-custom-appearance', 'true')
      console.log('✅ Custom dark theme ACTIVATED - data-custom-appearance="true" applied to <html>')
      console.log('HTML element classes:', htmlElement.className)
      console.log('HTML element attributes:', [...htmlElement.attributes].map(attr => `${attr.name}="${attr.value}"`).join(', '))
    } else {
      htmlElement.removeAttribute('data-custom-appearance')
      console.log('❌ Custom dark theme DEACTIVATED - data-custom-appearance removed from <html>')
    }
  }, [customAppearance, mounted])

  return (
    <AppearanceContext.Provider value={{ customAppearance, setCustomAppearance }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider')
  }
  return context
}
