"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Invoice } from "@/lib/invoice-utils";
import { formatCurrency } from "@/lib/payment-utils";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { usePaymentStore } from "@/lib/store";
import { useFormattedDate } from "@/lib/date-utils";

interface InvoiceListProps {
  invoices: Invoice[];
  onInvoiceClick: (invoiceId: string) => void;
}

function getStatusBadge(
  status: Invoice["status"]
): { label: string; variant: "default" | "destructive"; className?: string } {
  if (status === "paid") {
    return { 
      label: "Paid", 
      variant: "default",
      className: "bg-green-500/10 text-green-600 dark:text-green-400"
    };
  }
  return { label: "Unpaid", variant: "destructive" };
}

export function InvoiceList({ invoices, onInvoiceClick }: InvoiceListProps) {
  const { getClient } = usePaymentStore();
  const formatDate = useFormattedDate();

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
    <Card className="py-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-sm hover:bg-card">
              <TableHead className="w-[100px] border-r">Due Date</TableHead>
              <TableHead className="w-[120px] border-r">Client</TableHead>
              <TableHead className="w-[110px] border-r">Amount</TableHead>
              <TableHead className="w-[100px] border-r">Status</TableHead>
              <TableHead className="w-[140px] border-r">Invoice</TableHead>
              <TableHead className="w-[100px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const client = getClient(invoice.clientId);
              const clientName = client?.name || "Unknown Client";
              const statusBadge = getStatusBadge(invoice.status);

              return (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => onInvoiceClick(invoice.id)}
                >
                  <TableCell className="border-r">
                    <span className="text-sm">
                      {formatDate(invoice.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell className="border-r">
                    <span className="text-sm">{clientName}</span>
                  </TableCell>
                  <TableCell className="border-r">
                    <span className="text-sm">
                      {formatCurrency(invoice.total)}
                    </span>
                  </TableCell>
                  <TableCell className="border-r">
                    <Badge 
                      variant={statusBadge.variant} 
                      className={`text-xs ${statusBadge.className || ""}`}
                    >
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-r">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {invoice.invoiceNumber}
                      </span>
                      {invoice.companyName && (
                        <span className="text-muted-foreground text-xs">
                          {invoice.companyName}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(invoice.issueDate)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
