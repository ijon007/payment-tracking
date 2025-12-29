"use client";

import { format } from "date-fns";
import type {
  Invoice,
  InvoiceItem,
} from "@/lib/invoice-utils";
import type { Client } from "@/lib/payment-utils";
import { formatCurrency } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";

interface InvoicePreviewProps {
  invoiceId?: string;
  client?: Client;
  items?: InvoiceItem[];
  dueDate?: Date;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  logoUrl?: string;
  notes?: string;
}

export function InvoicePreview({
  invoiceId,
  client,
  items,
  dueDate,
  companyName,
  companyAddress,
  companyEmail,
  companyPhone,
  logoUrl,
  notes,
}: InvoicePreviewProps) {
  const { getInvoice, getClient } = usePaymentStore();

  let invoice: Invoice | null = null;
  let invoiceClient: Client | null = null;
  let invoiceItems: InvoiceItem[] = [];
  let invoiceDueDate: Date | null = null;
  let displayCompanyName = companyName || "";
  let displayCompanyAddress = companyAddress;
  let displayCompanyEmail = companyEmail || "";
  let displayCompanyPhone = companyPhone;
  let displayLogoUrl = logoUrl;
  let displayNotes = notes;

  if (invoiceId) {
    invoice = getInvoice(invoiceId) || null;
    if (invoice) {
      invoiceClient = getClient(invoice.clientId) || null;
      invoiceItems = invoice.items;
      invoiceDueDate = invoice.dueDate;
      displayCompanyName = invoice.companyName;
      displayCompanyAddress = invoice.companyAddress;
      displayCompanyEmail = invoice.companyEmail;
      displayCompanyPhone = invoice.companyPhone;
      displayLogoUrl = invoice.logoUrl;
      displayNotes = invoice.notes;
    }
  } else if (client && items && dueDate && companyName && companyEmail) {
    invoiceClient = client;
    invoiceItems = items;
    invoiceDueDate = dueDate;
  }

  if (!(displayCompanyName && displayCompanyEmail && invoiceClient)) {
    return null;
  }

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = invoice?.tax || 0;
  const total = invoice?.total || subtotal + tax;

  return (
    <div className="mt-6">
      <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              {displayLogoUrl && (
                <img
                  alt={displayCompanyName}
                  className="mb-4 h-12"
                  src={displayLogoUrl}
                />
              )}
              <h2 className="font-bold text-2xl">
                {displayCompanyName}
              </h2>
              <div className="mt-2 space-y-1 text-muted-foreground text-sm">
                {displayCompanyAddress && (
                  <p>{displayCompanyAddress}</p>
                )}
                <p>{displayCompanyEmail}</p>
                {displayCompanyPhone && (
                  <p>{displayCompanyPhone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h1 className="mb-2 font-bold text-3xl">INVOICE</h1>
              {invoice && (
                <p className="text-muted-foreground text-sm">
                  Invoice #: {invoice.invoiceNumber}
                </p>
              )}
              {invoice && (
                <p className="text-muted-foreground text-sm">
                  Issue Date: {format(invoice.issueDate, "MMM dd, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="mb-2 font-semibold">Bill To:</h3>
              <p className="font-medium">{invoiceClient.name}</p>
            </div>
            <div className="text-right">
              <h3 className="mb-2 font-semibold">Due Date:</h3>
              <p>
                {invoiceDueDate
                  ? format(invoiceDueDate, "MMM dd, yyyy")
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, index) => (
                  <tr className="border-b" key={index}>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          {displayNotes && (
            <div className="border-t pt-4">
              <p className="whitespace-pre-line text-muted-foreground text-sm">
                {displayNotes}
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
