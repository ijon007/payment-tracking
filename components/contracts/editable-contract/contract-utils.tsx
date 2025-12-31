import { formatCurrency } from "@/lib/currency-utils";
import { formatContractCurrency } from "@/lib/contract-settings";
import type { Currency } from "@/lib/currency-utils";
import { formatDateWithFormat } from "@/lib/date-utils";
import type { DateFormat } from "@/lib/settings-store";

/**
 * Format date for display in contract using the specified date format
 */
export function formatDateForContract(
  date: Date | undefined | null,
  dateFormat?: DateFormat
): string {
  if (!date) return "___ / ___ / ___";
  
  if (dateFormat) {
    const formatted = formatDateWithFormat(date, dateFormat);
    // Replace separators with " / " for consistent display
    // Handle different separator types: /, -, .
    return formatted
      .replace(/\//g, " / ")
      .replace(/-/g, " / ")
      .replace(/\./g, " / ")
      .replace(/\s{2,}/g, " ") // Replace multiple spaces with single space
      .trim();
  }
  
  // Default format (DD / MM / YYYY) if no format specified
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day} / ${month} / ${year}`;
}

/**
 * Format currency for display in contract
 */
export function formatCurrencyDisplay(amount: number, currency: Currency): string {
  return formatContractCurrency(amount, currency);
}

/**
 * Get currency display name
 */
export function getCurrencyDisplayName(currency: Currency): string {
  if (currency === "ALL") return "lekë";
  return formatCurrency(1, currency).replace("1.00", "").trim();
}

