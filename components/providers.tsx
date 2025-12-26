"use client";

import { useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { SettingsProvider, useSettings } from "@/lib/settings-store";
import { PaymentStoreProvider } from "@/lib/store";

function ThemeSync() {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const { settings, setTheme } = useSettings();

  // Sync next-themes with settings on mount
  useEffect(() => {
    if (settings.appearance.theme !== nextTheme) {
      setNextTheme(settings.appearance.theme);
    }
  }, []); // Only run on mount

  // Sync settings when next-themes changes (user interaction)
  useEffect(() => {
    if (nextTheme && nextTheme !== settings.appearance.theme) {
      setTheme(nextTheme as "light" | "dark" | "system");
    }
  }, [nextTheme, settings.appearance.theme, setTheme]);

  return null;
}

function InnerProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeSync />
      <PaymentStoreProvider>{children}</PaymentStoreProvider>
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem>
      <SettingsProvider>
        <InnerProviders>{children}</InnerProviders>
      </SettingsProvider>
    </ThemeProvider>
  );
}

