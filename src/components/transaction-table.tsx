"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2 } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

export function TransactionTable({ 
  transactions, 
  onEdit, 
  onDelete, 
  showEditButton = true, 
  showDeleteButton = true 
}: TransactionTableProps) {
  const { formatAmount } = useCurrency();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const handleEdit = (transaction: Transaction) => {
    if (onEdit) {
      onEdit(transaction);
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-lg">
          No hay transacciones que mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Vista de tabla para pantallas medianas y grandes */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/50">
              <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Fecha</th>
              <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Descripción</th>
              <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Categoría</th>
              <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Tipo</th>
              <th className="text-right py-4 px-4 font-semibold text-slate-700 text-sm">Monto</th>
              {(showEditButton || showDeleteButton) && (
                <th className="text-center py-4 px-4 font-semibold text-slate-700 text-sm">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr 
                key={transaction.id} 
                className={`border-b border-slate-200/40 hover:bg-slate-50/50 transition-colors ${
                  index === transactions.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="py-4 px-4 text-sm text-slate-600">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{transaction.description}</p>
                    {transaction.notes && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{transaction.notes}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category || "Sin categoría"}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <Badge 
                    variant={transaction.type === "income" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {transaction.type === "income" ? "Ingreso" : "Gasto"}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-semibold text-sm ${
                    transaction.type === "income" 
                      ? "text-emerald-600" 
                      : "text-rose-600"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}{formatAmount(transaction.amount)}
                  </span>
                </td>
                {(showEditButton || showDeleteButton) && (
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      {showEditButton && onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {showDeleteButton && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.')) {
                              handleDelete(transaction.id);
                            }
                          }}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de cards para pantallas pequeñas */}
      <div className="md:hidden space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{transaction.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {transaction.category || "Sin categoría"} • {formatDate(transaction.date)}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-3">
                <span className={`font-bold text-sm px-2 py-1 rounded-lg ${
                  transaction.type === "income" 
                    ? "text-emerald-700 bg-emerald-50" 
                    : "text-rose-700 bg-rose-50"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}{formatAmount(transaction.amount)}
                </span>
              </div>
            </div>
            
            {transaction.notes && (
              <p className="text-xs text-slate-500 mb-3 line-clamp-2 bg-slate-50 p-2 rounded-lg">
                {transaction.notes}
              </p>
            )}
            
            {(showEditButton || showDeleteButton) && (
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                {showEditButton && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(transaction)}
                    className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 h-8 px-3"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
                {showDeleteButton && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.')) {
                        handleDelete(transaction.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-8 px-3"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
