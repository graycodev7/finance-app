"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Transaction, useTransactions } from "./transaction-provider";
import { Loader2 } from "lucide-react";

interface EditTransactionModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
};

export function EditTransactionModal({ transaction, open, onOpenChange }: EditTransactionModalProps) {
  const { updateTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: "",
    notes: "",
  });

  // Cargar datos de la transacción cuando se abre el modal
  useEffect(() => {
    if (transaction && open) {
      // Formatear la fecha correctamente para el input type="date"
      let formattedDate = "";
      if (transaction.date) {
        try {
          const date = new Date(transaction.date);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          }
        } catch (error) {
          formattedDate = new Date().toISOString().split('T')[0];
        }
      }

      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        category: transaction.category || "",
        date: formattedDate,
        notes: transaction.notes || "",
      });
    }
  }, [transaction, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;
    
    if (!formData.amount || !formData.description || !formData.category) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsLoading(true);
    
    try {
      // Asegurar que la fecha esté en el formato correcto para el backend
      let dateToSend = formData.date;
      if (formData.date) {
        try {
          // Convertir la fecha a formato ISO completo si es necesario
          const date = new Date(formData.date);
          if (!isNaN(date.getTime())) {
            dateToSend = date.toISOString();
          }
        } catch (error) {
          // Si hay error, usar la fecha original
          dateToSend = formData.date;
        }
      }

      await updateTransaction(transaction.id, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: dateToSend,
        notes: formData.notes,
      });
      
      onOpenChange(false);
    } catch (error) {

      alert("Error al actualizar la transacción");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setFormData({
      type: "expense",
      amount: "",
      description: "",
      category: "",
      date: "",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Editar Transacción
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Modifica los datos de la transacción seleccionada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Transacción */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-700 font-medium">
              Tipo de Transacción *
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger id="type" name="type" className="form-input-fixed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-700 font-medium">
              Monto *
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.00"
              className="form-input-fixed"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">
              Descripción *
            </Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Ej: Compra en supermercado"
              className="form-input-fixed"
              required
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700 font-medium">
              Categoría *
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger id="category" name="category" className="form-input-fixed">
                <SelectValue placeholder="Selecciona la categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-700 font-medium">
              Fecha
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="form-input-fixed"
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700 font-medium">
              Notas (opcional)
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Información adicional..."
              className="form-input-fixed min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Transacción"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
