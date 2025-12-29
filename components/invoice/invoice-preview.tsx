"use client";

import { Download, Link, Check } from "@phosphor-icons/react";
import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  Invoice,
  InvoiceItem,
} from "@/lib/invoice-utils";
import { generateShareToken } from "@/lib/invoice-utils";
import { InvoicePDF } from "@/components/invoice/invoice-pdf";
import type { Client } from "@/lib/payment-utils";
import { formatCurrency } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";
import { toast } from "sonner";

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
  showActions?: boolean;
  showShareButton?: boolean;
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
  showActions = true,
  showShareButton = true,
}: InvoicePreviewProps) {
  const { getInvoice, getClient, updateInvoice } = usePaymentStore();
  const [linkCopied, setLinkCopied] = useState(false);

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
  let displayPaymentDetails: string | undefined = undefined;

  if (invoiceId) {
    invoice = getInvoice(invoiceId) || null;
    if (invoice) {
      invoiceClient = getClient(invoice.clientId) || null;
      invoiceItems = invoice.items || [];
      invoiceDueDate = invoice.dueDate;
      displayCompanyName = invoice.companyName || displayCompanyName || "Company Name";
      displayCompanyAddress = invoice.companyAddress || displayCompanyAddress;
      displayCompanyEmail = invoice.companyEmail || displayCompanyEmail || "";
      displayCompanyPhone = invoice.companyPhone || displayCompanyPhone;
      displayLogoUrl = invoice.logoUrl || displayLogoUrl;
      displayNotes = invoice.notes || displayNotes;
      displayPaymentDetails = invoice.paymentDetails;
    }
  } else if (client && items && dueDate) {
    invoiceClient = client;
    invoiceItems = items;
    invoiceDueDate = dueDate;
  }

  // Handle old invoices that might not have a client
  if (!invoiceClient && invoice) {
    invoiceClient = getClient(invoice.clientId) || null;
  }

  // If still no client, show a placeholder
  if (!invoiceClient) {
    return (
      <div className="mt-6 text-center text-muted-foreground">
        <p>Client information not found for this invoice.</p>
      </div>
    );
  }

  const subtotal = invoice?.subtotal || invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const tax = invoice?.tax || 0;
  const total = invoice?.total || subtotal + tax;
  const taxPercent = tax > 0 && subtotal > 0 ? (tax / subtotal) * 100 : 0;

  const handleDownloadPDF = async () => {
    if (!invoice || !invoiceClient) return;

    try {
      const blob = await pdf(
        <InvoicePDF invoice={invoice} client={invoiceClient} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleCopyShareLink = async () => {
    if (!invoice) return;

    // Get or create share token
    let shareToken = invoice.shareToken;
    if (!shareToken) {
      shareToken = generateShareToken();
      // Update invoice with new token
      updateInvoice(invoice.id, { shareToken });
    }

    const shareUrl = `${window.location.origin}/invoice/${shareToken}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="mt-6">
      <div className="space-y-6 rounded-lg border bg-card p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Invoice</h1>
            <div className="space-y-1 text-sm">
              {invoice && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Invoice No:</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
              )}
              {invoice && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium">
                    {format(invoice.issueDate, "dd/MM/yyyy")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">
                  {invoiceDueDate
                    ? format(invoiceDueDate, "dd/MM/yyyy")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
          {displayLogoUrl && (
            <div className="flex items-start gap-2">
              <img
                alt={displayCompanyName}
                className="h-16 w-16 rounded border object-contain"
                src={displayLogoUrl}
              />
            </div>
          )}
        </div>

        {/* From/To Sections */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">From</p>
            <p className="font-medium">{displayCompanyName}</p>
            {displayCompanyAddress && (
              <p className="text-sm text-muted-foreground">
                {displayCompanyAddress}
              </p>
            )}
            {displayCompanyEmail && (
              <p className="text-sm text-muted-foreground">
                {displayCompanyEmail}
              </p>
            )}
            {displayCompanyPhone && (
              <p className="text-sm text-muted-foreground">
                {displayCompanyPhone}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">To</p>
            <p className="font-medium">{invoiceClient.name}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 border-b pb-2 text-sm">
            <div className="text-muted-foreground font-medium">Description</div>
            <div className="text-right text-muted-foreground font-medium">
              Quantity
            </div>
            <div className="text-right text-muted-foreground font-medium">
              Price
            </div>
            <div className="text-right text-muted-foreground font-medium">
              Total
            </div>
          </div>
          {invoiceItems.length > 0 ? (
            invoiceItems.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                <div>{item.description || "-"}</div>
                <div className="text-right">{item.quantity || 0}</div>
                <div className="text-right">
                  {formatCurrency(item.price || 0)}
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(item.amount || 0)}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No items found
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tax</span>
                  {taxPercent > 0 && (
                    <>
                      <span className="text-muted-foreground">
                        {taxPercent.toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {(displayNotes || displayPaymentDetails) && (
          <div className="grid grid-cols-2 gap-8 border-t pt-4">
            {displayPaymentDetails && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Payment Details</p>
                <p className="whitespace-pre-line text-sm">
                  {displayPaymentDetails}
                </p>
              </div>
            )}
            {displayNotes && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Note</p>
                <p className="whitespace-pre-line text-sm">
                  {displayNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {invoice && showActions && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {showShareButton && (
            <Button onClick={handleCopyShareLink}>
              {linkCopied ? (
                <>
                  <Check className="size-4" weight="bold" />
                  Link Copied
                </>
              ) : (
                <>
                  <Link className="size-4" weight="bold" />
                  Copy Share Link
                </>
              )}
            </Button>
          )}
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="size-4" weight="fill" />
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
}
