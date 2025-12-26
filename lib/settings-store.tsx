"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Currency } from "./currency-utils";

export type DateFormat =
  | "MM/dd/yyyy"
  | "dd/MM/yyyy"
  | "yyyy-MM-dd"
  | "MMM dd, yyyy"
  | "dd MMM yyyy";

export type Theme = "light" | "dark" | "system";

export interface AppSettings {
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
    logoUrl?: string;
  };
  appearance: {
    theme: Theme;
  };
  dateFormat: DateFormat;
  baseCurrency: Currency;
}

const STORAGE_KEY = "payment-tracker-settings";

const DEFAULT_SETTINGS: AppSettings = {
  company: {
    name: "",
    address: "",
    email: "",
    phone: "",
    logoUrl: "",
  },
  appearance: {
    theme: "system",
  },
  dateFormat: "MMM dd, yyyy",
  baseCurrency: "USD",
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateCompany: (updates: Partial<AppSettings["company"]>) => void;
  updateAppearance: (updates: Partial<AppSettings["appearance"]>) => void;
  setDateFormat: (format: DateFormat) => void;
  setBaseCurrency: (currency: Currency) => void;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle missing fields
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          company: {
            ...DEFAULT_SETTINGS.company,
            ...parsed.company,
          },
          appearance: {
            ...DEFAULT_SETTINGS.appearance,
            ...parsed.appearance,
          },
        };
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save settings to localStorage:", error);
      }
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      company: {
        ...prev.company,
        ...(updates.company || {}),
      },
      appearance: {
        ...prev.appearance,
        ...(updates.appearance || {}),
      },
    }));
  }, []);

  const updateCompany = useCallback(
    (updates: Partial<AppSettings["company"]>) => {
      setSettings((prev) => ({
        ...prev,
        company: {
          ...prev.company,
          ...updates,
        },
      }));
    },
    []
  );

  const updateAppearance = useCallback(
    (updates: Partial<AppSettings["appearance"]>) => {
      setSettings((prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          ...updates,
        },
      }));
    },
    []
  );

  const setDateFormat = useCallback((format: DateFormat) => {
    setSettings((prev) => ({
      ...prev,
      dateFormat: format,
    }));
  }, []);

  const setBaseCurrency = useCallback((currency: Currency) => {
    setSettings((prev) => ({
      ...prev,
      baseCurrency: currency,
    }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme,
      },
    }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateCompany,
        updateAppearance,
        setDateFormat,
        setBaseCurrency,
        setTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}

