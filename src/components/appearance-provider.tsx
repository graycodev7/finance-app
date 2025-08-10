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

  // Forzar siempre modo claro - deshabilitar tema oscuro
  useEffect(() => {
    if (!mounted) return
    
    // Siempre forzar modo claro (customAppearance = false)
    if (customAppearance !== false) {
      setCustomAppearance(false)
    }
  }, [customAppearance, mounted])

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
