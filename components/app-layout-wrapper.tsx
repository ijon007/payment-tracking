"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname?.startsWith("/invoice/") || pathname?.startsWith("/contract/");

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-[calc(100svh-1rem)] flex-col overflow-hidden bg-background">
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

