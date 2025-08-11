"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardCharts } from "@/components/dashboard-charts"
import { ReportsSection } from "@/components/reports-section"
import { ArrowDownIcon, ArrowUpIcon, Wallet, AlertTriangle, Target } from "lucide-react"
import { useTransactions } from "@/components/transaction-provider"
import { useCurrency } from "@/components/currency-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TransactionItem } from "@/components/transaction-item"
import { AuthWrapper } from "@/components/auth-wrapper"

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  
  // Optimizar el callback de cambio de período
  const handlePeriodChange = useCallback((value: string) => {
    setSelectedPeriod(value);
  }, []);
  const {
    transactions,
    getTransactionsByPeriod,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getMonthlyData,
    getTopExpenseCategories,
  } = useTransactions()
  
  const { formatAmount } = useCurrency()

  // Memoizar cálculos costosos
  const displayTransactions = useMemo(() => 
    selectedPeriod === "all" ? transactions : getTransactionsByPeriod(selectedPeriod), 
    [selectedPeriod, transactions, getTransactionsByPeriod]
  )
  
  const totalIncome = useMemo(() => getTotalIncome(), [getTotalIncome])
  const totalExpenses = useMemo(() => getTotalExpenses(), [getTotalExpenses])
  const balance = useMemo(() => getBalance(), [getBalance])
  const monthlyData = useMemo(() => getMonthlyData(), [getMonthlyData])
  const topCategories = useMemo(() => getTopExpenseCategories(), [getTopExpenseCategories])

  // Calcular métricas de análisis
  const savingsRate = useMemo(() => 
    totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0", 
    [totalIncome, balance]
  )
  const topExpenseCategory = useMemo(() => topCategories[0], [topCategories])
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions])

  // Análisis de patrones
  const insights = useMemo(() => {
    const insights: Array<{
      type: string;
      title: string;
      description: string;
    }> = []
    
    // Solo mostrar alertas si hay transacciones registradas
    if (transactions.length === 0) {
      return insights
    }

    // Alerta de tasa de ahorro baja (solo si hay ingresos)
    if (totalIncome > 0 && Number(savingsRate) < 20) {
      insights.push({
        type: "warning",
        title: "Tasa de ahorro baja",
        description: `Tu tasa de ahorro es del ${savingsRate}%. Se recomienda ahorrar al menos el 20% de tus ingresos.`,
      })
    }

    // Alerta de concentración de gastos (solo si hay gastos)
    if (topExpenseCategory && topExpenseCategory.percentage > 40 && totalExpenses > 0) {
      insights.push({
        type: "alert",
        title: "Concentración de gastos alta",
        description: `El ${topExpenseCategory.percentage.toFixed(1)}% de tus gastos se concentra en ${topExpenseCategory.category}. Considera diversificar.`,
      })
    }

    // Alerta de balance negativo (solo si hay transacciones)
    if (balance < 0 && (totalIncome > 0 || totalExpenses > 0)) {
      insights.push({
        type: "error",
        title: "Balance negativo",
        description: "Tus gastos superan tus ingresos. Es importante revisar tu presupuesto.",
      })
    }

    return insights
  }, [transactions.length, totalIncome, totalExpenses, savingsRate, topExpenseCategory, balance])

  return (
    <AuthWrapper>
      <div className="flex-1 space-y-4 sm:space-y-5 main-content pt-16 md:pt-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen responsive-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 w-full">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Dashboard Financiero
            </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger id="period-filter" name="period-filter" className="w-full sm:w-[180px] border-0 bg-white/80 backdrop-blur-sm shadow-lg shadow-slate-200/50 rounded-2xl">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent className="border-0 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md">
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alertas y análisis */}
      {insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Alert 
              key={index} 
              variant={insight.type === "error" ? "destructive" : "default"} 
              className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg shadow-orange-100/50 rounded-2xl backdrop-blur-sm"
            >
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-semibold text-lg">{insight.title}</AlertTitle>
              <AlertDescription className="text-sm opacity-80">{insight.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Tarjetas de resumen - DISEÑO COMPACTO */}
      <div className="responsive-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* Ingresos */}
        <div 
          className="group relative overflow-hidden p-4 rounded-2xl shadow-md shadow-emerald-100/50 hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300 border-0"
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            backgroundColor: '#ecfdf5'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-emerald-700">Ingresos Totales</p>
              <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors duration-300">
                <ArrowUpIcon className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl md:text-2xl font-bold text-emerald-700 mb-1">
              {formatAmount(totalIncome)}
            </div>
            <p className="text-xs text-emerald-600/70">Total acumulado</p>
          </div>
        </div>

        {/* Gastos */}
        <div 
          className="group relative overflow-hidden p-4 rounded-2xl shadow-md shadow-rose-100/50 hover:shadow-lg hover:shadow-rose-200/50 transition-all duration-300 border-0"
          style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)',
            backgroundColor: '#fff1f2'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-rose-700">Gastos Totales</p>
              <div className="p-2 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors duration-300">
                <ArrowDownIcon className="h-4 w-4 text-rose-600" />
              </div>
            </div>
            <div className="text-2xl md:text-2xl font-bold text-rose-700 mb-1">
              {formatAmount(totalExpenses)}
            </div>
            <p className="text-xs text-rose-600/70">Total acumulado</p>
          </div>
        </div>

        {/* Balance */}
        <div 
          className="group relative overflow-hidden p-4 rounded-2xl shadow-md shadow-blue-100/50 hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300 border-0"
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            backgroundColor: '#eff6ff'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-blue-700">Balance</p>
              <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className={`text-2xl md:text-2xl font-bold mb-1 ${balance >= 0 ? "text-blue-700" : "text-red-700"}`}>
              {formatAmount(balance)}
            </div>
            <p className="text-xs text-blue-600/70">Balance actual disponible</p>
          </div>
        </div>

        {/* Tasa de Ahorro */}
        <div 
          className="group relative overflow-hidden p-4 rounded-2xl shadow-md shadow-amber-100/50 hover:shadow-lg hover:shadow-amber-200/50 transition-all duration-300 border-0"
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            backgroundColor: '#fffbeb'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-amber-700">Tasa de Ahorro</p>
              <div className="p-2 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors duration-300">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className={`text-2xl md:text-2xl font-bold mb-1 ${Number(savingsRate) >= 20 ? "text-amber-700" : "text-amber-700"}`}>
              {savingsRate}%
            </div>
            <p className="text-xs text-amber-600/70">{Number(savingsRate) >= 20 ? "¡Excelente!" : "Mejorable"}</p>
          </div>
        </div>
      </div>

      {/* Gráficos - Rediseñados */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-md shadow-slate-200/50 rounded-xl border-0 p-1.5">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white text-sm">Gráficos</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white text-sm">Análisis</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white text-sm">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="responsive-card bg-white/80 backdrop-blur-sm rounded-2xl shadow-md shadow-slate-200/50 border-0 p-4 sm:p-5 lg:p-6 chart-container">
            <DashboardCharts transactions={transactions} monthlyData={monthlyData} topCategories={topCategories} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="responsive-grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <div className="responsive-card bg-white/80 backdrop-blur-sm rounded-2xl shadow-md shadow-slate-200/50 border-0 p-4 sm:p-5 lg:p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Análisis de Patrones</h3>
                <p className="text-sm text-slate-600">Insights sobre tus hábitos financieros</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Mayor categoría de gasto:</h4>
                  <p className="text-sm text-slate-600">
                    {topExpenseCategory
                      ? `${topExpenseCategory.category} representa el ${topExpenseCategory.percentage.toFixed(1)}% de tus gastos (${formatAmount(topExpenseCategory.amount)})`
                      : "No hay datos suficientes"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Promedio mensual:</h4>
                  <p className="text-sm text-slate-600">
                    Ingresos: $
                    {monthlyData.length > 0
                      ? Math.round(
                          monthlyData.reduce((sum, m) => sum + m.ingresos, 0) / monthlyData.length,
                        ).toLocaleString()
                      : "0"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Gastos: $
                    {monthlyData.length > 0
                      ? Math.round(
                          monthlyData.reduce((sum, m) => sum + m.gastos, 0) / monthlyData.length,
                        ).toLocaleString()
                      : "0"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Recomendaciones:</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {Number(savingsRate) < 20 && <li>• Intenta aumentar tu tasa de ahorro al 20%</li>}
                    {topExpenseCategory && topExpenseCategory.percentage > 30 && (
                      <li>• Considera reducir gastos en {topExpenseCategory.category}</li>
                    )}
                    <li>• Revisa tus gastos mensuales regularmente</li>
                    <li>• Establece metas de ahorro específicas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="responsive-card bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/50 border-0 p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Distribución de Gastos</h3>
                <p className="text-sm text-slate-600">Desglose detallado por categoría</p>
              </div>
              <div className="space-y-4">
                {topCategories.slice(0, 6).map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-slate-800">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{formatAmount(category.amount)}</div>
                      <div className="text-xs text-slate-500">{category.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="responsive-card bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/50 border-0 p-4 sm:p-6 lg:p-8">
            <ReportsSection />
          </div>
        </TabsContent>
      </Tabs>

      {/* Transacciones recientes - Rediseñadas */}
      <div className="responsive-card bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/50 border-0 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Transacciones Recientes</h3>
          <p className="text-sm text-slate-600">Últimas 5 transacciones registradas</p>
        </div>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 bg-slate-50/80 rounded-2xl">
                <TransactionItem
                  transaction={transaction}
                  showDeleteButton={false}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-12 text-lg">
              No hay transacciones registradas. ¡Agrega tu primera transacción!
            </p>
          )}
        </div>
      </div>
      </div>
    </AuthWrapper>
  )
}