"use client";

import { useCallback, useEffect, useState } from "react";

export type Currency = "USD" | "EUR" | "GBP" | "ALL";

export const CURRENCIES: { code: Currency; name: string; symbol: string }[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "ALL", name: "Albanian Lek", symbol: "L" },
];

const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";

// Cache for exchange rates
let exchangeRatesCache: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch exchange rates from API
 */
async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch(EXCHANGE_RATE_API);
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Return default rates if API fails
    return {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      ALL: 93.5,
    };
  }
}

/**
 * Get exchange rates (with caching)
 */
async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();

  if (exchangeRatesCache && now - cacheTimestamp < CACHE_DURATION) {
    return exchangeRatesCache;
  }

  exchangeRatesCache = await fetchExchangeRates();
  cacheTimestamp = now;
  return exchangeRatesCache;
}

/**
 * Convert currency amount from one currency to another
 * Exchange rates are relative to USD (base currency)
 * Example: rates["EUR"] = 0.92 means 1 USD = 0.92 EUR
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await getExchangeRates();

  // All rates are relative to USD
  // If fromCurrency is USD, we just multiply by the target rate
  if (fromCurrency === "USD") {
    const toRate = rates[toCurrency] || 1;
    return amount * toRate;
  }

  // If toCurrency is USD, we divide by the source rate
  if (toCurrency === "USD") {
    const fromRate = rates[fromCurrency] || 1;
    return amount / fromRate;
  }

  // Convert between two non-USD currencies
  // Step 1: Convert from source currency to USD
  const fromRate = rates[fromCurrency] || 1;
  const amountInUSD = amount / fromRate;

  // Step 2: Convert from USD to target currency
  const toRate = rates[toCurrency] || 1;
  return amountInUSD * toRate;
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "USD"
): string {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency);
  const currencyCode = currencyInfo?.code || currency;

  // Special handling for Albanian Lek (ALL) - no decimal places
  if (currency === "ALL") {
    return new Intl.NumberFormat("sq-AL", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

/**
 * Hook for currency conversion
 */
export function useCurrencyConversion() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRates() {
      try {
        const fetchedRates = await getExchangeRates();
        if (mounted) {
          setRates(fetchedRates);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load exchange rates"
          );
          setLoading(false);
        }
      }
    }

    loadRates();

    return () => {
      mounted = false;
    };
  }, []);

  const convert = useCallback(
    async (amount: number, fromCurrency: Currency, toCurrency: Currency) => {
      return convertCurrency(amount, fromCurrency, toCurrency);
    },
    []
  );

  return {
    rates,
    loading,
    error,
    convert,
  };
}
