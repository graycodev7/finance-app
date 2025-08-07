import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { TransactionProvider } from "@/components/transaction-provider"
// import { AppearanceProvider } from "@/components/appearance-provider" // Temporalmente deshabilitado

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dashboard Financiero",
  description: "Control de gastos e ingresos personal",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TransactionProvider>
              <div className="flex h-screen bg-background">
                {/* Sidebar fijo en desktop, overlay en móvil */}
                <AppSidebar />
                {/* Contenido principal */}
                <main className="flex-1 overflow-auto">{children}</main>
                <Toaster />
              </div>
          </TransactionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
