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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Invoices</h1>
        </div>
        <Button onClick={() => setInvoiceSheetOpen(true)}>
          <Plus className="size-3" weight="bold" />
          Create Invoice
        </Button>
      </div>

      <div className="grid gap-6">
        <InvoiceStats />
        
        <div>
          <h2 className="mb-4 font-semibold text-lg">Generated Invoices</h2>
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
          className="!right-4 !top-4 !bottom-4 !h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-lg shadow-2xl sm:max-w-2xl p-5"
        >
          <SheetHeader>
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
