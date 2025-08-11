"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/components/transaction-provider";
import { FileText, TrendingUp, Calendar, PieChart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ReportsSection() {
  const { transactions, getMonthlyData, getTopExpenseCategories, getTotalIncome, getTotalExpenses, getBalance } = useTransactions();
  const { toast } = useToast();
  const [reportPeriod, setReportPeriod] = useState("thisYear");

  const monthlyData = getMonthlyData();
  const topCategories = getTopExpenseCategories();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();

  const generateReport = (type: string) => {
    let reportData = "";
    let filename = "";

    switch (type) {
      case "monthly":
        reportData = generateMonthlyReport();
        filename = `reporte_mensual_${new Date().toISOString().split("T")[0]}.txt`;
        break;
      case "categories":
        reportData = generateCategoriesReport();
        filename = `reporte_categorias_${new Date().toISOString().split("T")[0]}.txt`;
        break;
      case "summary":
        reportData = generateSummaryReport();
        filename = `resumen_financiero_${new Date().toISOString().split("T")[0]}.txt`;
        break;
      default:
        return;
    }

    downloadReport(reportData, filename);
  };

  const generateMonthlyReport = () => {
    let report = "=== REPORTE MENSUAL ===\n\n";
    report += `Generado el: ${new Date().toLocaleDateString("es")}\n\n`;

    monthlyData.forEach((month) => {
      const balance = month.ingresos - month.gastos;
      report += `${month.month}:\n`;
      report += `  Ingresos: $${month.ingresos.toLocaleString()}\n`;
      report += `  Gastos: $${month.gastos.toLocaleString()}\n`;
      report += `  Balance: $${balance.toLocaleString()}\n`;
      report += `  Tasa de ahorro: ${month.ingresos > 0 ? ((balance / month.ingresos) * 100).toFixed(1) : 0}%\n\n`;
    });

    return report;
  };

  const generateCategoriesReport = () => {
    let report = "=== REPORTE POR CATEGORÍAS ===\n\n";
    report += `Generado el: ${new Date().toLocaleDateString("es")}\n\n`;
    report += `Total de gastos: $${totalExpenses.toLocaleString()}\n\n`;

    topCategories.forEach((category, index) => {
      report += `${index + 1}. ${category.category}:\n`;
      report += `   Monto: $${category.amount.toLocaleString()}\n`;
      report += `   Porcentaje: ${category.percentage.toFixed(1)}%\n\n`;
    });

    return report;
  };

  const generateSummaryReport = () => {
    let report = "=== RESUMEN FINANCIERO ===\n\n";
    report += `Generado el: ${new Date().toLocaleDateString("es")}\n\n`;
    report += `TOTALES:\n`;
    report += `Ingresos totales: $${totalIncome.toLocaleString()}\n`;
    report += `Gastos totales: $${totalExpenses.toLocaleString()}\n`;
    report += `Balance: $${balance.toLocaleString()}\n`;
    report += `Tasa de ahorro: ${totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%\n\n`;

    report += `ESTADÍSTICAS:\n`;
    report += `Total de transacciones: ${transactions.length}\n`;
    report += `Promedio de ingresos mensuales: $${
      monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, m) => sum + m.ingresos, 0) / monthlyData.length).toLocaleString() : 0
    }\n`;
    report += `Promedio de gastos mensuales: $${
      monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, m) => sum + m.gastos, 0) / monthlyData.length).toLocaleString() : 0
    }\n\n`;

    report += `TOP 3 CATEGORÍAS DE GASTOS:\n`;
    topCategories.slice(0, 3).forEach((category, index) => {
      report += `${index + 1}. ${category.category}: $${category.amount.toLocaleString()} (${category.percentage.toFixed(1)}%)\n`;
    });

    return report;
  };

  const downloadReport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Reporte generado",
      description: `Se descargó el archivo: ${filename}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Resumen ejecutivo */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Registros en total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meses con Datos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-xl font-bold">{monthlyData.length}</div>
            <p className="text-xs text-muted-foreground">Períodos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-xl font-bold">{topCategories.length}</div>
            <p className="text-xs text-muted-foreground">Categorías diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Generadores de reportes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reportes Disponibles</CardTitle>
            <CardDescription>Genera reportes detallados de tus finanzas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="report-period" className="text-sm font-medium">Período del reporte:</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm border-0 px-3">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-0">
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Button onClick={() => generateReport("summary")} className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Resumen Financiero General
              </Button>
              <Button onClick={() => generateReport("monthly")} variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Reporte Mensual Detallado
              </Button>
              <Button onClick={() => generateReport("categories")} variant="outline" className="w-full justify-start">
                <PieChart className="h-4 w-4 mr-2" />
                Análisis por Categorías
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas Clave</CardTitle>
            <CardDescription>Indicadores importantes de tu situación financiera</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tasa de ahorro promedio:</span>
                <span className={`font-bold ${totalIncome > 0 && (balance / totalIncome) * 100 >= 20 ? "text-green-600" : "text-orange-600"}`}>
                  {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Gasto mensual promedio:</span>
                <span className="font-bold">
                  ${monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, m) => sum + m.gastos, 0) / monthlyData.length).toLocaleString() : 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Categoría de mayor gasto:</span>
                <span className="font-bold text-red-600">{topCategories[0]?.category || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Mejor mes (balance):</span>
                <span className="font-bold text-green-600">
                  {monthlyData.length > 0
                    ? monthlyData.reduce((best, current) => (current.ingresos - current.gastos > best.ingresos - best.gastos ? current : best)).month
                    : "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transacciones por mes:</span>
                <span className="font-bold">{monthlyData.length > 0 ? Math.round(transactions.length / monthlyData.length) : 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Tendencias</CardTitle>
          <CardDescription>Patrones identificados en tus finanzas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">Tendencias Positivas:</h4>
              <ul className="text-sm space-y-1">
                {balance > 0 && <li className="text-green-600">✓ Mantienes un balance positivo</li>}
                {monthlyData.length >= 3 && <li className="text-green-600">✓ Tienes un historial consistente de registros</li>}
                {topCategories.length > 1 && <li className="text-green-600">✓ Diversificas tus gastos en múltiples categorías</li>}
                {totalIncome > 0 && (balance / totalIncome) * 100 >= 10 && <li className="text-green-600">✓ Logras ahorrar parte de tus ingresos</li>}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Áreas de Mejora:</h4>
              <ul className="text-sm space-y-1">
                {totalIncome > 0 && (balance / totalIncome) * 100 < 20 && <li className="text-orange-600">⚠ Podrías aumentar tu tasa de ahorro</li>}
                {topCategories[0] && topCategories[0].percentage > 50 && (
                  <li className="text-orange-600">⚠ Muy concentrado en una categoría de gasto</li>
                )}
                {balance < 0 && <li className="text-red-600">⚠ Gastos superan a los ingresos</li>}
                {transactions.length < 10 && <li className="text-orange-600">⚠ Pocos registros para análisis completo</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
