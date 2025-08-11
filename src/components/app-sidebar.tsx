"use client";

import { Calculator, BarChartIcon as ChartBar, Home, PlusCircle, Settings, History, Menu, X, LogOut, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CalculatorModal } from "./calculator-modal";
import { useAuth } from "./auth-provider";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Agregar Transacción",
    url: "/transactions",
    icon: PlusCircle,
  },
  {
    title: "Historial",
    url: "/history",
    icon: History,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Botón de menú móvil */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 right-4 z-50 md:hidden modern-button border-0 bg-white backdrop-blur-sm"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay para móvil */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200/50">
            <div className="p-2 rounded-xl bg-black shadow-md">
              <ChartBar className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">FinanceApp</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Navegación</h3>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 modern-nav-item text-sm font-medium transition-all duration-200",
                      pathname === item.url 
                        ? "modern-nav-active" 
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>


          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200/50 space-y-3">
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl">
                <div className="p-2 rounded-xl bg-gray-100">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
            
            {/* Calculator Button */}
            <Button 
              onClick={() => setCalculatorOpen(true)} 
              className="w-full modern-button border-0 bg-black text-white hover:bg-gray-800 h-12 font-semibold"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </Button>
            
            {/* Logout Button */}
            <Button 
              onClick={() => setLogoutConfirmOpen(true)}
              variant="outline"
              className="w-full h-10 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      <CalculatorModal open={calculatorOpen} onOpenChange={setCalculatorOpen} />
      
      {/* Modal de confirmación para cerrar sesión */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar cierre de sesión
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              ¿Estás seguro de que deseas cerrar sesión?
              <br />
              <span className="text-sm text-slate-500 mt-2 block">
                Tendrás que volver a iniciar sesión para acceder a tu cuenta.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setLogoutConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setLogoutConfirmOpen(false);
                logout();
              }}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sí, cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}