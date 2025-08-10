"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { apiClient } from "@/lib/api";

// Currency types and data
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  {
    code: "USD",
    symbol: "$",
    name: "Dólar Estadounidense",
    locale: "en-US"
  },
  {
    code: "PEN", 
    symbol: "S/",
    name: "Sol Peruano",
    locale: "es-PE"
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "es-ES"
  }
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  formatAmountWithoutSymbol: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[1]); // Default to PEN (Sol Peruano)
  const { user } = useAuth();

  // Currency will be set by the settings page when it loads user preferences
  // This avoids multiple API calls and ensures consistency

  // Save currency to database when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    // Currency is saved to database via settings page - no direct API call needed here
    // The settings page handles the updatePreferences call
  };

  // Format amount with currency symbol
  const formatAmount = (amount: number): string => {
    try {
      // Ensure amount is a valid number
      const numAmount = Number(amount);
      const validAmount = isNaN(numAmount) ? 0 : numAmount;
      
      // Use the currency's locale with proper formatting
      const formatted = new Intl.NumberFormat(currency.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(validAmount);
      
      return `${currency.symbol}${formatted}`;
    } catch (error) {
      // Fallback to en-US formatting if locale fails
      console.warn(`Currency formatting failed for locale ${currency.locale}, using fallback`);
      const numAmount = Number(amount);
      const validAmount = isNaN(numAmount) ? 0 : numAmount;
      
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(validAmount);
      
      return `${currency.symbol}${formatted}`;
    }
  };

  // Format amount without currency symbol (for internal calculations display)
  const formatAmountWithoutSymbol = (amount: number): string => {
    try {
      // Ensure amount is a valid number
      const numAmount = Number(amount);
      const validAmount = isNaN(numAmount) ? 0 : numAmount;
      
      // Use the currency's locale with proper formatting
      return new Intl.NumberFormat(currency.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(validAmount);
    } catch (error) {
      // Fallback to en-US formatting if locale fails
      console.warn(`Currency formatting failed for locale ${currency.locale}, using fallback`);
      const numAmount = Number(amount);
      const validAmount = isNaN(numAmount) ? 0 : numAmount;
      
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(validAmount);
    }
  };

  const value = {
    currency,
    setCurrency,
    formatAmount,
    formatAmountWithoutSymbol
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
