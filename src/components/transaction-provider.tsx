"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByPeriod: (period: string) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getExpensesByCategory: () => { [key: string]: number };
  getMonthlyData: () => Array<{ month: string; ingresos: number; gastos: number }>;
  getTopExpenseCategories: () => Array<{ category: string; amount: number; percentage: number }>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Inicializar con array vacío para aplicación limpia
const initialTransactions: Transaction[] = [];

// Opcional: Si quieres datos de ejemplo para pruebas, descomenta las siguientes líneas:
// const sampleTransactions: Transaction[] = [
//   {
//     id: "sample-1",
//     type: "income",
//     amount: 3000,
//     description: "Salario",
//     category: "Trabajo",
//     date: new Date().toISOString().split('T')[0],
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "sample-2",
//     type: "expense",
//     amount: 800,
//     description: "Renta",
//     category: "Vivienda",
//     date: new Date().toISOString().split('T')[0],
//     createdAt: new Date().toISOString(),
//   },
// ];

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // LIMPIAR localStorage existente y forzar inicio limpio
    localStorage.removeItem("financial-transactions");
    
    // Inicializar siempre con array vacío para aplicación limpia
    setTransactions(initialTransactions);
    
    // Opcional: Si quieres restaurar el comportamiento de persistencia, 
    // descomenta las siguientes líneas y comenta las de arriba:
    // const savedTransactions = localStorage.getItem("financial-transactions");
    // if (savedTransactions) {
    //   try {
    //     setTransactions(JSON.parse(savedTransactions));
    //   } catch (error) {
    //     console.error("Error loading transactions:", error);
    //     setTransactions(initialTransactions);
    //   }
    // } else {
    //   setTransactions(initialTransactions);
    // }
  }, []);

  useEffect(() => {
    // Guardar transacciones en localStorage
    if (transactions.length > 0) {
      localStorage.setItem("financial-transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  const addTransaction = useCallback((transactionData: Omit<Transaction, "id" | "createdAt">) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTransactionsByPeriod = useCallback((period: string) => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "thisWeek":
        startDate.setDate(now.getDate() - 7);
        break;
      case "thisMonth":
        startDate.setMonth(now.getMonth());
        startDate.setDate(1);
        break;
      case "thisYear":
        startDate.setFullYear(now.getFullYear());
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      case "lastMonth":
        startDate.setMonth(now.getMonth() - 1);
        startDate.setDate(1);
        break;
      case "lastYear":
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      default:
        return transactions;
    }

    return transactions.filter((t) => new Date(t.date) >= startDate);
  }, [transactions]);

  const getTotalIncome = useCallback(() => {
    return transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback(() => {
    return transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getBalance = useCallback(() => {
    return getTotalIncome() - getTotalExpenses();
  }, [getTotalIncome, getTotalExpenses]);

  const getExpensesByCategory = useCallback(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return categoryTotals;
  }, [transactions]);

  const getMonthlyData = useCallback(() => {
    const monthlyData: { [key: string]: { ingresos: number; gastos: number } } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString("es", { month: "short", year: "numeric" });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { ingresos: 0, gastos: 0 };
      }

      if (transaction.type === "income") {
        monthlyData[monthKey].ingresos += transaction.amount;
      } else {
        monthlyData[monthKey].gastos += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [transactions]);

  const getTopExpenseCategories = useCallback(() => {
    const categoryTotals = getExpensesByCategory();
    const totalExpenses = getTotalExpenses();

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [getExpensesByCategory, getTotalExpenses]);

  // Memoizar el value del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(
    () => ({
      transactions,
      addTransaction,
      deleteTransaction,
      getTransactionsByPeriod,
      getTotalIncome,
      getTotalExpenses,
      getBalance,
      getExpensesByCategory,
      getMonthlyData,
      getTopExpenseCategories,
    }),
    [
      transactions,
      addTransaction,
      deleteTransaction,
      getTransactionsByPeriod,
      getTotalIncome,
      getTotalExpenses,
      getBalance,
      getExpensesByCategory,
      getMonthlyData,
      getTopExpenseCategories,
    ]
  );

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}
