"use client";

import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoiceStats } from "@/components/invoices/invoice-stats";
import { InvoiceSheet } from "@/components/invoices/invoice-sheet";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePaymentStore } from "@/lib/store";

export default function InvoicesPage() {
  const { invoices } = usePaymentStore();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <h1 className="font-semibold truncate">Invoices</h1>
        </div>
        <Button onClick={() => setInvoiceSheetOpen(true)} className="shrink-0">
          <Plus className="size-3 sm:size-4" weight="bold" />
          <span className="hidden sm:inline">Create Invoice</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <InvoiceStats />
        
        <div>
          <h2 className="mb-3 sm:mb-4 font-semibold text-base sm:text-lg">Generated Invoices</h2>
          <InvoiceList
            invoices={invoices}
            onInvoiceClick={setSelectedInvoiceId}
          />
        </div>
      </div>

      <Sheet
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
        open={selectedInvoiceId !== null}
      >
        <SheetContent
          side="right"
          className="right-0! top-0! bottom-0! h-screen! w-full overflow-y-auto rounded-none shadow-2xl sm:right-4! sm:top-4! sm:bottom-4! sm:h-[calc(100vh-2rem)]! sm:rounded-lg sm:max-w-2xl p-3 sm:p-4"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Invoice Details</SheetTitle>
          </SheetHeader>
          {selectedInvoiceId && (
            <InvoicePreview invoiceId={selectedInvoiceId} />
          )}
        </SheetContent>
      </Sheet>

      <InvoiceSheet
        onOpenChange={setInvoiceSheetOpen}
        open={invoiceSheetOpen}
      />
    </div>
  );
}
