import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PaymentStoreProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background overflow-hidden h-[calc(100svh-1rem)] flex flex-col">
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="flex flex-col gap-4 p-4">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </PaymentStoreProvider>
      </body>
    </html>
  );
}
