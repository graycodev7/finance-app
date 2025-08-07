"use client";

import { Calculator, BarChartIcon as ChartBar, Home, PlusCircle, Settings, TrendingDown, TrendingUp, Wallet, History, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalculatorModal } from "@/components/calculator-modal";
import { useTransactions } from "@/components/transaction-provider";
import { cn } from "@/lib/utils";

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
  const { getTotalIncome, getTotalExpenses, getBalance } = useTransactions();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();

  const quickStats = [
    {
      title: "Ingresos",
      value: `${totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Gastos",
      value: `${totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      title: "Balance",
      value: `${balance.toLocaleString()}`,
      icon: Wallet,
      color: balance >= 0 ? "text-emerald-600" : "text-rose-600",
      bgColor: balance >= 0 ? "bg-emerald-50" : "bg-rose-50",
    },
  ];

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
          "fixed left-0 top-0 z-40 h-full w-64 modern-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-200/50">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <ChartBar className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">FinanceApp</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xs font-semibold text-slate-500 mb-6 uppercase tracking-wider">Navegación</h3>
              <nav className="space-y-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 modern-nav-item text-sm font-medium transition-all duration-200",
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

            {/* Quick Stats */}
            <div className="p-6 border-t border-slate-200/50">
              <h3 className="text-xs font-semibold text-slate-500 mb-6 uppercase tracking-wider">Resumen Rápido</h3>
              <div className="space-y-4">
                {quickStats.map((stat) => (
                  <div key={stat.title} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{stat.title}</span>
                    </div>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200/50">
            <Button 
              onClick={() => setCalculatorOpen(true)} 
              className="w-full modern-button border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 h-12 font-semibold"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </Button>
          </div>
        </div>
      </aside>

      <CalculatorModal open={calculatorOpen} onOpenChange={setCalculatorOpen} />
    </>
  );
}