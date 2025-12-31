"use client";

import {
  CheckCircleIcon,
  InfoIcon,
  SpinnerIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-4" weight="fill" />,
        info: <InfoIcon className="size-4" weight="fill" />,
        warning: <WarningIcon className="size-4" weight="fill" />,
        error: <XCircleIcon className="size-4" weight="fill" />,
        loading: <SpinnerIcon className="size-4 animate-spin" weight="fill" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          toast:
            "cn-toast group shadow-lg backdrop-blur-md border-2 transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] hover:border-opacity-80",
          title: "font-semibold tracking-tight",
          description: "opacity-90 text-sm",
          actionButton:
            "bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-md transition-colors",
          cancelButton:
            "bg-muted hover:bg-muted/80 border border-border rounded-md transition-colors",
          success:
            "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50",
          info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50",
          warning:
            "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/50",
          error:
            "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
