"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { Invoice } from "@/lib/invoice-utils";
import { formatCurrency } from "@/lib/payment-utils";
import { Badge } from "../ui/badge";

interface InvoiceListProps {
  invoices: Invoice[];
  onInvoiceClick: (invoiceId: string) => void;
}

export function InvoiceList({ invoices, onInvoiceClick }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No invoices generated yet. Generate invoices from the Clients page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-2">
      <CardContent className="p-0">
        <div className="space-y-1">
          {invoices.map((invoice) => (
            <div
              className="mx-2 flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-white/10"
              key={invoice.id}
              onClick={() => onInvoiceClick(invoice.id)}
            >
              <div>
                <p className="font-medium">{invoice.invoiceNumber}</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {formatCurrency(invoice.total)}
                </span>
                <Badge variant="secondary">
                  {invoice.status.charAt(0).toUpperCase() +
                    invoice.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
