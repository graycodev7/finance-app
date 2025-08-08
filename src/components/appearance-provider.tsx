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
    } else {
      htmlElement.removeAttribute('data-custom-appearance')
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
