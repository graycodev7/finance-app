import { ArrowDownIcon, ArrowUpIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Transaction } from "@/components/transaction-provider"
import { memo, useCallback, useMemo } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/dialog"

interface TransactionItemProps {
  transaction: Transaction
  onDelete?: (id: string, description: string) => void
  showDeleteButton?: boolean
}

export const TransactionItem = memo(function TransactionItem({ transaction, onDelete, showDeleteButton = false }: TransactionItemProps) {
  // Memoizar el callback de eliminación
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(transaction.id, transaction.description)
    }
  }, [onDelete, transaction.id, transaction.description]);

  // Memoizar los estilos del icono para evitar recálculos
  const iconContainerClass = useMemo(() => 
    `flex items-center justify-center w-10 h-10 rounded-xl shadow-sm ${
      transaction.type === "income"
        ? "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600"
        : "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600"
    }`, [transaction.type]);

  // Memoizar la fecha formateada
  const formattedDate = useMemo(() => 
    new Date(transaction.date).toLocaleDateString("es"), 
    [transaction.date]
  );

  return (
    <div className="group flex items-center justify-between p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-lg border-0">
      <div className="flex items-center space-x-3">
        <div className={iconContainerClass}>
          {transaction.type === "income" ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate text-base">{transaction.description}</p>
          <p className="text-sm text-muted-foreground font-medium">
            {transaction.category} • {formattedDate}
          </p>
          {transaction.notes && (
            <p className="text-sm text-muted-foreground/70 italic mt-2 line-clamp-2 bg-slate-50/80 p-2 rounded-xl">
              {transaction.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div
          className={`font-bold text-lg px-3 py-1.5 rounded-xl ${
            transaction.type === "income" 
              ? "text-emerald-700 bg-emerald-50/80" 
              : "text-rose-700 bg-rose-50/80"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
        </div>

        {showDeleteButton && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-muted-foreground hover:text-rose-600 hover:bg-rose-50/80 rounded-xl border-0 shadow-sm hover:shadow-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la transacción "
                  {transaction.description}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
});