"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import type { Transaction } from "@/components/transaction-provider";

interface DashboardChartsProps {
  transactions: Transaction[];
  monthlyData: Array<{ month: string; ingresos: number; gastos: number }>;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
}

// Memoizar colores para evitar recreación en cada render
const CHART_COLORS = {
  income: "#059669", // Verde más suave
  expense: "#dc2626", // Rojo más suave
  categories: [
    "#059669", // Verde suave
    "#2563eb", // Azul suave
    "#d97706", // Amber suave
    "#dc2626", // Rojo suave
    "#7c3aed", // Violeta suave
    "#0891b2", // Cyan suave
    "#65a30d", // Lime suave
    "#ea580c", // Orange suave
  ],
} as const;

export const DashboardCharts = memo(function DashboardCharts({ transactions, monthlyData, topCategories }: DashboardChartsProps) {
  // Memoizar cálculos costosos para evitar recálculos innecesarios
  const { totalIncome, totalExpenses, pieData } = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      pieData: [
        { name: "Ingresos", value: income, color: CHART_COLORS.income },
        { name: "Gastos", value: expenses, color: CHART_COLORS.expense },
      ]
    };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full glass-card p-6 text-center">
          <p className="text-muted-foreground text-base">No hay datos suficientes para mostrar gráficos</p>
          <p className="text-sm text-muted-foreground mt-2">Agrega algunas transacciones para ver los análisis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Gráfico de área moderno - Ingresos vs Gastos por mes (SIN BALANCE) */}
      {monthlyData.length > 0 && (
        <div className="col-span-full lg:col-span-2 glass-card p-6 relative overflow-hidden">
          {/* Gradiente de fondo decorativo más sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-blue-50/10 to-purple-50/20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-200/20 to-transparent rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full shadow-lg" />
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    Flujo Financiero Mensual
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">Evolución detallada de tus finanzas</p>
                </div>
              </div>
            </div>
            
            {/* Indicadores de métricas mejorados */}
            <div className="flex gap-8 mb-8 ml-2">
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50/60 rounded-full border border-emerald-100/50">
                <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm" />
                <span className="text-sm font-semibold text-emerald-800">Ingresos</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-red-50/60 rounded-full border border-red-100/50">
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-sm" />
                <span className="text-sm font-semibold text-red-800">Gastos</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={420}>
              <AreaChart 
                data={monthlyData}
                margin={{ top: 20, right: 40, left: 20, bottom: 80 }}
              >
                <defs>
                  {/* Gradientes muy suaves y claros */}
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.15}/>
                    <stop offset="50%" stopColor="#059669" stopOpacity={0.08}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.15}/>
                    <stop offset="50%" stopColor="#dc2626" stopOpacity={0.08}/>
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02}/>
                  </linearGradient>
                  
                  {/* Filtros para efectos de sombra */}
                  <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
                  </filter>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="2 8" 
                  stroke="#e2e8f0" 
                  strokeOpacity={0.4}
                  horizontal={true}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 13, fill: "#475569", fontWeight: 600 }} 
                  angle={-45} 
                  textAnchor="end" 
                  height={90}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                
                <YAxis 
                  tick={{ fontSize: 13, fill: "#475569", fontWeight: 500 }} 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                
                <Tooltip
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`, 
                    name === "ingresos" ? "💰 Ingresos" : "💸 Gastos"
                  ]}
                  labelFormatter={(label) => `📅 ${label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(20px)',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '16px 20px',
                  }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '8 4', strokeOpacity: 0.6 }}
                />
                
                {/* Área de ingresos con gradiente muy sutil */}
                <Area
                  type="natural"
                  dataKey="ingresos"
                  stroke="#059669"
                  strokeWidth={3}
                  fill="url(#incomeGradient)"
                  name="ingresos"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    stroke: '#059669', 
                    strokeWidth: 2, 
                    fill: '#ffffff',
                    filter: 'url(#dropShadow)',
                    style: { transition: 'all 0.2s ease' }
                  }}
                />
                
                {/* Área de gastos con gradiente muy sutil */}
                <Area
                  type="natural"
                  dataKey="gastos"
                  stroke="#dc2626"
                  strokeWidth={3}
                  fill="url(#expenseGradient)"
                  name="gastos"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    stroke: '#dc2626', 
                    strokeWidth: 2, 
                    fill: '#ffffff',
                    filter: 'url(#dropShadow)',
                    style: { transition: 'all 0.2s ease' }
                  }}
                />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gráfico de pastel modernizado - Distribución Ingresos vs Gastos */}
      <div className="glass-card p-8 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/20 to-blue-50/30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-red-200/30 to-transparent rounded-full blur-xl" />
        
        <div className="relative z-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Distribución General
                </h3>
                <p className="text-slate-600 text-sm">Balance de tu dinero</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  {/* Gradientes para el pie chart */}
                  <linearGradient id="incomeSlice" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="expenseSlice" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  
                  {/* Sombra para el pie chart */}
                  <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.15"/>
                  </filter>
                </defs>
                
                <Pie 
                  data={[
                    { ...pieData[0], fill: "url(#incomeSlice)" },
                    { ...pieData[1], fill: "url(#expenseSlice)" }
                  ]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={75} 
                  outerRadius={120} 
                  paddingAngle={8} 
                  dataKey="value"
                  filter="url(#pieShadow)"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={3}
                />
                <Tooltip 
                  formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(16px)',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '16px 20px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Leyenda modernizada */}
          <div className="flex justify-center gap-8 mt-6">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/30">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm border-2 border-white/50" 
                  style={{ 
                    background: index === 0 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : 'linear-gradient(135deg, #ef4444, #dc2626)'
                  }} 
                />
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-800">{entry.name}</div>
                  <div className="text-xs text-slate-600 font-medium">
                    {totalIncome + totalExpenses > 0 ? ((entry.value / (totalIncome + totalExpenses)) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top categorías con barras de progreso personalizadas */}
      {topCategories.length > 0 && (
        <div className="col-span-full glass-card p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full" />
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Top Categorías de Gastos
                </h3>
                <p className="text-slate-600 text-sm">Donde inviertes tu dinero</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topCategories.slice(0, 6).map((category, index) => (
              <div key={category.category} className="p-6 bg-white/70 backdrop-blur-sm rounded-3xl border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded-full shadow-sm border-2 border-white/60" 
                      style={{ backgroundColor: CHART_COLORS.categories[index % CHART_COLORS.categories.length] }}
                    />
                    <span className="text-sm font-bold text-slate-800">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">${category.amount.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 font-semibold bg-slate-100/60 px-2 py-1 rounded-full mt-1">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-200/60 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{
                      width: `${Math.min(category.percentage, 100)}%`,
                      background: `linear-gradient(90deg, ${CHART_COLORS.categories[index % CHART_COLORS.categories.length]}, ${CHART_COLORS.categories[index % CHART_COLORS.categories.length]}dd)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});