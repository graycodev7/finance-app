"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/components/transaction-provider"
import { Download, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCSVExport } from "@/hooks/use-csv-export"
import { TransactionItem } from "@/components/transaction-item"

export default function HistoryPage() {
  const { transactions, deleteTransaction } = useTransactions()
  const { toast } = useToast()
  const { exportToCSV } = useCSVExport()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Filtrar transacciones
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  // Obtener categorías únicas
  const uniqueCategories = Array.from(new Set(transactions.map((t) => t.category)))

  const handleDelete = (id: string, description: string) => {
    deleteTransaction(id)
    toast({
      title: "Transacción eliminada",
      description: `Se eliminó "${description}" correctamente`,
    })
  }

  const handleExportCSV = () => {
    const csvHeaders = ["Fecha", "Tipo", "Descripción", "Categoría", "Monto", "Notas"]
    const csvData = filteredTransactions.map((t) => [
      t.date,
      t.type === "income" ? "Ingreso" : "Gasto",
      t.description,
      t.category,
      t.amount.toString(),
      t.notes || "",
    ])

    exportToCSV({
      filename: `transacciones_${new Date().toISOString().split("T")[0]}.csv`,
      headers: csvHeaders,
      data: csvData,
    })
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 pt-20 md:pt-8 main-content min-h-screen">
      <div className="flex items-center space-x-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text">
          Historial de Transacciones
        </h2>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card-purple p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-purple-900 mb-2">Filtros y Búsqueda</h3>
          <p className="text-sm text-purple-700/70">Encuentra transacciones específicas usando los filtros</p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-purple-600/70" />
            <Input
              placeholder="Buscar por descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 modern-input border-0 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="modern-input border-0 bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="glass-card border-0">
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="modern-input border-0 bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="glass-card border-0">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleExportCSV} 
            className="modern-button border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-purple-700 hover:text-purple-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Lista de transacciones */}
      <div className="glass-card p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Transacciones ({filteredTransactions.length})
          </h3>
          <p className="text-sm text-slate-600">
            {filteredTransactions.length === transactions.length
              ? "Mostrando todas las transacciones"
              : `Mostrando ${filteredTransactions.length} de ${transactions.length} transacciones`}
          </p>
        </div>
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 bg-slate-50/80 rounded-2xl">
                <TransactionItem
                  transaction={transaction}
                  onDelete={handleDelete}
                  showDeleteButton={true}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg mb-2">No se encontraron transacciones</p>
              <p className="text-sm text-slate-400">
                {transactions.length === 0
                  ? "¡Agrega tu primera transacción para comenzar!"
                  : "Intenta ajustar los filtros de búsqueda"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}