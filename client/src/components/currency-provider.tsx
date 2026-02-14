import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Currency = "PHP" | "SGD" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number | string) => string;
  currencySymbol: string;
}

const currencyConfig: Record<Currency, { symbol: string; code: string; locale: string }> = {
  PHP: { symbol: "\u20B1", code: "PHP", locale: "en-PH" },
  SGD: { symbol: "S$", code: "SGD", locale: "en-SG" },
  USD: { symbol: "$", code: "USD", locale: "en-US" },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem("preferred-currency");
    return (stored as Currency) || "PHP";
  });

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    localStorage.setItem("preferred-currency", c);
  }

  const config = currencyConfig[currency];

  function formatCurrency(amount: number | string): string {
    const num = typeof amount === "string" ? Number(amount) : amount;
    return `${config.symbol}${num.toLocaleString(config.locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, currencySymbol: config.symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
