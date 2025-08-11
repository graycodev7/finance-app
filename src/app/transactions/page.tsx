"use client"

import type React from "react"
import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, DollarSign, PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransactions } from "@/components/transaction-provider"

const categories = {
  income: ["Salario", "Freelance", "Inversiones", "Bonos", "Otros ingresos"],
  expense: [
    "Vivienda",
    "Alimentación",
    "Transporte",
    "Entretenimiento",
    "Servicios",
    "Salud",
    "Educación",
    "Compras",
    "Otros gastos",
  ],
}

export default function TransactionsPage() {
  const { toast } = useToast()
  const { addTransaction } = useTransactions()
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    // Ensure amount is a valid number
    const parsedAmount = Number.parseFloat(formData.amount);
    const validAmount = isNaN(parsedAmount) ? 0 : parsedAmount;

    addTransaction({
      type: formData.type,
      amount: validAmount,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      notes: formData.notes,
    })

    toast({
      title: "¡Transacción agregada!",
      description: `${formData.type === "income" ? "Ingreso" : "Gasto"} de $${formData.amount} registrado correctamente`,
    })

    setFormData({
      type: "expense",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" && { category: "" }),
    }))
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-5 main-content pt-16 md:pt-6 min-h-screen responsive-container">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Agregar Transacción
        </h2>
      </div>

      <Tabs defaultValue="single" className="space-y-4 w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 h-auto p-1">
          <TabsTrigger value="single" className="text-sm px-4 py-3 sm:px-6 sm:py-3">Transacción Individual</TabsTrigger>
          <TabsTrigger value="bulk" className="text-sm px-4 py-3 sm:px-6 sm:py-3">Múltiples Transacciones</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="responsive-grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Formulario */}
            <div className="responsive-card card-blue p-3 sm:p-4 lg:p-5">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10">
                    <PlusCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">Nueva Transacción</h3>
                </div>
                <p className="text-sm text-blue-700/70">Registra un nuevo ingreso o gasto en tu control financiero</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de transacción */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-blue-900 font-medium">Tipo de Transacción *</Label>
                  <Select name="type" value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger id="type" className="modern-input border-0 bg-white/80 backdrop-blur-sm px-3">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-0">
                      <SelectItem value="income">Ingreso</SelectItem>
                      <SelectItem value="expense">Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Monto */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-blue-900 font-medium">Monto *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-blue-600/70" />
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      autoComplete="transaction-amount"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      className="pl-10 modern-input border-0 bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-blue-900 font-medium">Descripción *</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Ej: Compra en supermercado"
                    autoComplete="off"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="modern-input border-0 bg-white/80 backdrop-blur-sm"
                    required
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-blue-900 font-medium">Categoría *</Label>
                  <Select name="category" value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger id="category" className="modern-input border-0 bg-white/80 backdrop-blur-sm px-3">
                      <SelectValue placeholder="Selecciona la categoría" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-0">
                      {categories[formData.type as keyof typeof categories].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-blue-900 font-medium">Fecha</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-blue-600/70" />
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      autoComplete="transaction-date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="pl-10 modern-input border-0 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-blue-900 font-medium">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Información adicional..."
                    autoComplete="off"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="modern-input border-0 bg-white/80 backdrop-blur-sm resize-none"
                  />
                </div>

                <Button type="submit" className="w-full modern-button border-0 bg-blue-600 text-white hover:bg-blue-700 h-12 text-lg font-semibold">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Agregar Transacción
                </Button>
              </form>
            </div>

            {/* Vista previa */}
            <div className="responsive-card card-slate p-3 sm:p-4 lg:p-5">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Vista Previa</h3>
                <p className="text-sm text-slate-600">Así se verá tu transacción una vez guardada</p>
              </div>
              
              <div className="space-y-4">
                <div className={`p-6 rounded-2xl ${
                  formData.type === "income"
                    ? "bg-gradient-to-r from-emerald-50 to-emerald-100"
                    : "bg-gradient-to-r from-rose-50 to-rose-100"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-lg">{formData.description || "Descripción de la transacción"}</span>
                    <span className={`font-bold text-2xl ${
                      formData.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {formData.type === "income" ? "+" : "-"}${formData.amount || "0.00"}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p className="font-medium">
                      {formData.category || "Categoría"} • {formData.date}
                    </p>
                    {formData.notes && <p className="mt-2 italic">{formData.notes}</p>}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-xl">
                    <span className="font-medium">Tipo:</span>
                    <span className="font-semibold">{formData.type === "income" ? "💰 Ingreso" : "💸 Gasto"}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-xl">
                    <span className="font-medium">Monto:</span>
                    <span className="font-semibold">${formData.amount || "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-xl">
                    <span className="font-medium">Categoría:</span>
                    <span className="font-semibold">{formData.category || "Sin categoría"}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-xl">
                    <span className="font-medium">Fecha:</span>
                    <span className="font-semibold">{formData.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <div className="responsive-card glass-card p-3 sm:p-4 lg:p-5 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Múltiples Transacciones</h3>
            <p className="text-slate-600 mb-6">Agrega varias transacciones de una vez (próximamente)</p>
            <div className="py-16">
              <p className="text-slate-500 text-lg mb-2">Esta funcionalidad estará disponible próximamente.</p>
              <p className="text-sm text-slate-400">
                Podrás importar transacciones desde CSV o agregar múltiples entradas manualmente.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}