"use client";

import { useEffect, useState } from "react";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { usePaymentStore } from "@/lib/store";

interface PublicInvoiceViewProps {
  token: string;
}

export function PublicInvoiceView({ token }: PublicInvoiceViewProps) {
  const { getInvoiceByToken, invoices } = usePaymentStore();
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    // Try to find invoice by token
    const invoice = getInvoiceByToken(token);
    
    if (invoice) {
      setInvoiceId(invoice.id);
    } else {
      // For old invoices without tokens, try to match by ID if token looks like an ID
      // This is a fallback for backward compatibility
      const possibleInvoice = invoices.find((inv) => inv.id === token);
      if (possibleInvoice) {
        setInvoiceId(possibleInvoice.id);
      }
    }
  }, [token, getInvoiceByToken, invoices]);

  if (!invoiceId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Invoice Not Found</h1>
          <p className="text-muted-foreground">
            The invoice you're looking for doesn't exist or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <InvoicePreview invoiceId={invoiceId} showShareButton={false} />
      </div>
    </div>
  );
}

