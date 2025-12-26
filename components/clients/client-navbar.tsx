"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "general-info", label: "General" },
  { id: "contracts", label: "Contracts" },
  { id: "invoices", label: "Invoices" },
];

interface ClientNavbarProps {
  className?: string;
}

export function ClientNavbar({ className }: ClientNavbarProps) {
  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center">
        <TabsList variant="line" className="h-auto bg-transparent">
          {SECTIONS.map((section) => (
            <TabsTrigger key={section.id} value={section.id}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </nav>
  );
}
