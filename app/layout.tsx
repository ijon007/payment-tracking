import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PaymentStoreProvider } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payments Tracker",
  description: "Internal payment tracking dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      >
        <PaymentStoreProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex h-[calc(100svh-1rem)] flex-col overflow-hidden bg-background">
              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4 p-4">{children}</div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </PaymentStoreProvider>
      </body>
    </html>
  );
}
