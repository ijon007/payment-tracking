"use client";

import { format } from "date-fns";
import type { DateFormat } from "./settings-store";
import { useSettings } from "./settings-store";

/**
 * Format a date using the user's preferred date format from settings
 */
export function formatDate(date: Date, customFormat?: DateFormat): string {
  // This function will be used in client components that have access to useSettings hook
  // For server components or components without hook access, use formatDateWithFormat instead
  throw new Error(
    "formatDate requires useSettings hook. Use formatDateWithFormat or use useFormattedDate hook instead."
  );
}

/**
 * Format a date with a specific format string
 */
export function formatDateWithFormat(
  date: Date,
  dateFormat: DateFormat
): string {
  // Map our format strings to date-fns format patterns
  const formatMap: Record<DateFormat, string> = {
    "MM/dd/yyyy": "MM/dd/yyyy",
    "dd/MM/yyyy": "dd/MM/yyyy",
    "yyyy-MM-dd": "yyyy-MM-dd",
    "MMM dd, yyyy": "MMM dd, yyyy",
    "dd MMM yyyy": "dd MMM yyyy",
    "dd.MM.yyyy": "dd.MM.yyyy",
  };

  const formatPattern = formatMap[dateFormat] || "MMM dd, yyyy";
  return format(date, formatPattern);
}

/**
 * Hook to format dates using settings
 */
export function useFormattedDate() {
  const { settings } = useSettings();

  return (date: Date, customFormat?: DateFormat) => {
    const formatToUse = customFormat || settings.dateFormat;
    return formatDateWithFormat(date, formatToUse);
  };
}

