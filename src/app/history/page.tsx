"use client"

import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransactions } from '@/components/transaction-provider'
import { Download, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCSVExport } from "@/hooks/use-csv-export"
import { TransactionItem } from "@/components/transaction-item"
import { EditTransactionModal } from "@/components/edit-transaction-modal"

export default function HistoryPage() {
  const { transactions, deleteTransaction } = useTransactions()
  const { toast } = useToast()
  const { exportToCSV } = useCSVExport()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  // Filtrar transacciones
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = filterCategory === "all" || (transaction.category || "Sin categoría") === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  // Obtener categorías únicas
  const uniqueCategories = Array.from(new Set(transactions.map((t) => t.category || "Sin categoría")))

  const handleDelete = (id: string, description: string) => {
    deleteTransaction(id)
    toast({
      title: "Transacción eliminada",
      description: `Se eliminó "${description}" correctamente`,
    })
  }

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction)
    setEditModalOpen(true)
  }

  const handleExportCSV = () => {
    const csvHeaders = ["Fecha", "Tipo", "Descripción", "Categoría", "Monto", "Notas"]
    const csvData = filteredTransactions.map((t) => [
      t.date,
      t.type === "income" ? "Ingreso" : "Gasto",
      t.description,
      t.category || "Sin categoría",
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
    <div className="flex-1 space-y-3 sm:space-y-4 main-content pt-16 md:pt-6 min-h-screen px-2 sm:px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Historial de Transacciones
        </h2>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card-black p-3 sm:p-4 lg:p-5 mx-1 sm:mx-0">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Filtros y Búsqueda</h3>
          <p className="text-sm text-gray-700/70">Encuentra transacciones específicas usando los filtros</p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-600/70" />
            <Input
              placeholder="Buscar por descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 modern-input border-0 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
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
            className="modern-button border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-gray-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Lista de transacciones */}
      <div className="card-black p-3 sm:p-4 lg:p-5 mx-1 sm:mx-0">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
            Transacciones ({filteredTransactions.length})
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {filteredTransactions.length === transactions.length
              ? "Mostrando todas las transacciones"
              : `Mostrando ${filteredTransactions.length} de ${transactions.length} transacciones`}
          </p>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-2 sm:p-3 bg-slate-50/80 rounded-xl sm:rounded-2xl">
                <TransactionItem
                  transaction={transaction}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  showDeleteButton={true}
                  showEditButton={true}
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

      {/* Modal de edición */}
      <EditTransactionModal
        transaction={selectedTransaction}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  )
}