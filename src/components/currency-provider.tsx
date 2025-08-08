"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
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

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("finance-app-currency");
    if (savedCurrency) {
      try {
        const parsedCurrency = JSON.parse(savedCurrency);
        const foundCurrency = CURRENCIES.find(c => c.code === parsedCurrency.code);
        if (foundCurrency) {
          setCurrencyState(foundCurrency);
        }
      } catch (error) {
        // If there's an error loading, keep the default
      }
    }
  }, []);

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("finance-app-currency", JSON.stringify(newCurrency));
  };

  // Format amount with currency symbol
  const formatAmount = (amount: number): string => {
    const formatted = amount.toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${currency.symbol}${formatted}`;
  };

  // Format amount without currency symbol (for internal calculations display)
  const formatAmountWithoutSymbol = (amount: number): string => {
    return amount.toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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
