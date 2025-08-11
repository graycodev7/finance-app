"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { apiClient, type Transaction as ApiTransaction } from "@/lib/api";
import { useAuth } from "./auth-provider";

// Updated interface to match backend API
export interface Transaction {
  id: string; // Keep as string for frontend compatibility
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
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, "id" | "createdAt">>) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  getTransactionsByPeriod: (period: string) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getExpensesByCategory: () => { [key: string]: number };
  getMonthlyData: () => Array<{ month: string; ingresos: number; gastos: number }>;
  getTopExpenseCategories: () => Array<{ category: string; amount: number; percentage: number }>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Helper function to convert API transaction to frontend format
function convertApiTransaction(apiTransaction: ApiTransaction): Transaction {
  // Ensure amount is a valid number
  const amount = Number(apiTransaction.amount);
  const validAmount = isNaN(amount) ? 0 : amount;
  
  // Handle date conversion more robustly
  let validDate = new Date().toISOString().split('T')[0]; // Default to today
  if (apiTransaction.date) {
    try {
      const parsedDate = new Date(apiTransaction.date);
      if (!isNaN(parsedDate.getTime())) {
        validDate = parsedDate.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Invalid date received from backend:', apiTransaction.date);
    }
  }
  
  return {
    id: String(apiTransaction.id), // Ensure no leading zeros
    type: apiTransaction.type,
    amount: validAmount,
    description: apiTransaction.description,
    category: apiTransaction.category || "Sin categoría",
    date: validDate,
    createdAt: apiTransaction.created_at,
  };
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load transactions from backend when authenticated
  const refreshTransactions = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getTransactions();

      if (response.success && response.data) {
        // Handle both array and object with transactions property
        const transactionsArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any)?.transactions || [];
        const convertedTransactions = transactionsArray.map(convertApiTransaction);
        setTransactions(convertedTransactions);
      } else {
        throw new Error(response.message || 'Failed to load transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Load transactions on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      refreshTransactions();
    } else if (!isAuthenticated && !authLoading) {
      // Clear transactions when not authenticated
      setTransactions([]);
      setError(null);
    }
  }, [isAuthenticated, authLoading, refreshTransactions]);

  const addTransaction = useCallback(async (transactionData: Omit<Transaction, "id" | "createdAt">) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to add transactions');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.addTransaction({
        type: transactionData.type,
        amount: transactionData.amount,
        category: transactionData.category,
        description: transactionData.description,
        date: transactionData.date,
        notes: transactionData.notes,
      });

      if (response.success) {
        // After successfully adding transaction, reload all transactions from backend
        // This ensures we get the most up-to-date data with correct formatting
        await refreshTransactions();
      } else {
        throw new Error(response.message || 'Failed to create transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateTransaction = useCallback(async (id: string, transactionData: Partial<Omit<Transaction, "id" | "createdAt">>) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to update transactions');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.updateTransaction(parseInt(id), transactionData);

      if (response.success && response.data) {
        const updatedTransaction = convertApiTransaction(response.data.transaction);
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? updatedTransaction : t))
        );
      } else {
        throw new Error(response.message || 'Failed to update transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to delete transactions');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.deleteTransaction(parseInt(id));

      if (response.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => {
        const amount = Number(t.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => {
        const amount = Number(t.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
  }, [transactions]);

  const getBalance = useCallback(() => {
    return getTotalIncome() - getTotalExpenses();
  }, [getTotalIncome, getTotalExpenses]);

  const getExpensesByCategory = useCallback(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      const amount = Number(expense.amount);
      const validAmount = isNaN(amount) ? 0 : amount;
      const category = expense.category || "Sin categoría";
      categoryTotals[category] = (categoryTotals[category] || 0) + validAmount;
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

      const amount = Number(transaction.amount);
      const validAmount = isNaN(amount) ? 0 : amount;
      
      if (transaction.type === "income") {
        monthlyData[monthKey].ingresos += validAmount;
      } else {
        monthlyData[monthKey].gastos += validAmount;
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
      isLoading,
      error,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      refreshTransactions,
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
      isLoading,
      error,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      refreshTransactions,
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
