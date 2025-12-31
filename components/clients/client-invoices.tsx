"use client";

import { ArrowSquareOut, FileText } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type Currency,
  convertCurrency,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/currency-utils";
import { useFormattedDate } from "@/lib/date-utils";
import type { Client } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";
import { InvoicePreview } from "@/components/invoice/invoice-preview";

interface ClientInvoicesProps {
  client: Client;
  displayCurrency: Currency;
}

export function ClientInvoices({
  client,
  displayCurrency,
}: ClientInvoicesProps) {
  const { invoices, contracts, getContract } = usePaymentStore();
  const formatDate = useFormattedDate();
  const clientInvoices = useMemo(
    () => invoices.filter((i) => i.clientId === client.id),
    [invoices, client.id]
  );
  const [convertedTotals, setConvertedTotals] = useState<
    Record<string, number>
  >({});
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const convertTotals = async () => {
      // All amounts are stored in USD (base currency)
      // Convert from USD to display currency
      const converted: Record<string, number> = {};
      for (const invoice of clientInvoices) {
        if (displayCurrency !== "USD") {
          converted[invoice.id] = await convertCurrency(
            invoice.total,
            "USD",
            displayCurrency
          );
        } else {
          converted[invoice.id] = invoice.total;
        }
      }
      setConvertedTotals(converted);
    };
    convertTotals();
  }, [clientInvoices, displayCurrency]);

  const getStatusBadge = (
    status: "draft" | "sent" | "paid"
  ): { label: string; variant: "default" | "destructive"; className?: string } => {
    if (status === "paid") {
      return { 
        label: "Paid", 
        variant: "default",
        className: "bg-green-500/10 text-green-600 dark:text-green-400"
      };
    }
    return { label: "Unpaid", variant: "destructive" };
  };

  const handleInvoiceClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
  };

  if (clientInvoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            All invoices generated for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground text-sm">
            No invoices found for this client.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="invoices" className="py-0">
      <CardHeader className="sr-only">
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-sm hover:bg-card">
              <TableHead className="w-[100px] border-r">Due Date</TableHead>
              <TableHead className="w-[110px] border-r">Amount</TableHead>
              <TableHead className="w-[100px] border-r">Status</TableHead>
              <TableHead className="w-[140px] border-r">Invoice</TableHead>
              <TableHead className="w-[120px] border-r">Source</TableHead>
              <TableHead className="w-[100px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientInvoices.map((invoice) => {
              const statusBadge = getStatusBadge(invoice.status);
              const contract = invoice.contractId ? getContract(invoice.contractId) : null;
              return (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => handleInvoiceClick(invoice.id)}
                >
                  <TableCell className="border-r">
                    <span className="text-sm">
                      {formatDate(invoice.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell className="border-r">
                    <span className="text-sm">
                      {formatCurrencyUtil(
                        convertedTotals[invoice.id] ?? invoice.total,
                        displayCurrency
                      )}
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
                  <TableCell className="border-r">
                    {contract ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Badge variant="outline" className="text-xs gap-1">
                              <FileText className="h-3 w-3" />
                              {contract.contractNumber}
                            </Badge>
                          }
                        />
                        <TooltipContent>
                          <p>From Contract: {contract.contractNumber}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Standalone
                      </Badge>
                    )}
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
    </Card>
  );
}
