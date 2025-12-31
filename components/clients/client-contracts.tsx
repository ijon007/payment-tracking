"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
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
  type Currency,
  convertCurrency,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/currency-utils";
import { useFormattedDate } from "@/lib/date-utils";
import type { Client } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";
import { ContractPreview, ContractPreviewActions } from "@/components/contracts/contract-preview";
import { InvoicePreview } from "@/components/invoice/invoice-preview";

interface ClientContractsProps {
  client: Client;
  displayCurrency: Currency;
}

export function ClientContracts({
  client,
  displayCurrency,
}: ClientContractsProps) {
  const { contracts, invoices, getInvoice } = usePaymentStore();
  const formatDate = useFormattedDate();
  const clientContracts = useMemo(
    () => contracts.filter((c) => c.clientId === client.id),
    [contracts, client.id]
  );
  const [convertedCosts, setConvertedCosts] = useState<Record<string, number>>(
    {}
  );
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const convertCosts = async () => {
      // All amounts are stored in USD (base currency)
      // Convert from USD to display currency
      const converted: Record<string, number> = {};
      for (const contract of clientContracts) {
        if (contract.projectCost) {
          if (displayCurrency !== "USD") {
            converted[contract.id] = await convertCurrency(
              contract.projectCost,
              "USD",
              displayCurrency
            );
          } else {
            converted[contract.id] = contract.projectCost;
          }
        }
      }
      setConvertedCosts(converted);
    };
    convertCosts();
  }, [clientContracts, displayCurrency]);

  const getStatusBadgeVariant = (
    status: "created" | "sent" | "signed" | "active" | "expired"
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
      case "signed":
        return "default";
      case "sent":
        return "secondary";
      case "created":
        return "outline";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleContractClick = (contractId: string) => {
    setSelectedContractId(contractId);
  };

  if (clientContracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>
            All contracts generated for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground text-sm">
            No contracts found for this client.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="contracts" className="py-0">
      <CardHeader className="sr-only">
        <CardTitle>Contracts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-sm hover:bg-card">
              <TableHead className="w-[140px] border-r">Contract Number</TableHead>
              <TableHead className="w-[100px] border-r">Issue Date</TableHead>
              <TableHead className="w-[100px] border-r">Start Date</TableHead>
              <TableHead className="w-[100px] border-r">End Date</TableHead>
              <TableHead className="w-[110px] border-r">Project Cost</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientContracts.map((contract) => {
              return (
                <TableRow
                  key={contract.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => handleContractClick(contract.id)}
                >
                  <TableCell className="border-r">
                    <span className="text-sm font-medium">
                      {contract.contractNumber}
                    </span>
                  </TableCell>
                  <TableCell className="border-r">
                    <span className="text-sm">
                      {formatDate(contract.issueDate)}
                    </span>
                  </TableCell>
                  <TableCell className="border-r">
                    <span className="text-sm">
                      {formatDate(contract.startDate)}
                    </span>
                  </TableCell>
                  <TableCell className="border-r">
                    <span className="text-sm">
                      {formatDate(contract.endDate)}
                    </span>
                  </TableCell>
                  <TableCell className="border-r">
                    <span className="text-sm">
                      {contract.projectCost
                        ? formatCurrencyUtil(
                            convertedCosts[contract.id] ?? contract.projectCost,
                            displayCurrency
                          )
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(contract.status)}>
                      {contract.status.charAt(0).toUpperCase() +
                        contract.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <Sheet
        onOpenChange={(open) => !open && setSelectedContractId(null)}
        open={selectedContractId !== null}
      >
        <SheetContent
          side="right"
          className="right-0! top-0! bottom-0! h-screen! w-full overflow-y-auto rounded-none shadow-2xl sm:right-4! sm:top-4! sm:bottom-4! sm:h-[calc(100vh-2rem)]! sm:rounded-lg sm:max-w-2xl p-0"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Contract Details</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-6">
              {selectedContractId && (
                <>
                  <ContractPreview contractId={selectedContractId} showActions={false} />
                  
                  {/* Generated Invoices Section */}
                  {(() => {
                    const contract = contracts.find((c) => c.id === selectedContractId);
                    if (!contract || !contract.invoiceIds || contract.invoiceIds.length === 0) {
                      return null;
                    }
                    
                    const contractInvoices = contract.invoiceIds
                      .map((id) => getInvoice(id))
                      .filter((inv): inv is NonNullable<typeof inv> => inv !== undefined);
                    
                    if (contractInvoices.length === 0) {
                      return null;
                    }
                    
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Generated Invoices</CardTitle>
                          <CardDescription>
                            Invoices automatically generated from this contract's payment plan
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {contractInvoices.map((invoice) => {
                              const statusBadge = invoice.status === "paid" 
                                ? { label: "Paid", variant: "default" as const, className: "bg-green-500/10 text-green-600 dark:text-green-400" }
                                : { label: "Unpaid", variant: "destructive" as const };
                              
                              return (
                                <div
                                  key={invoice.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                  onClick={() => setSelectedInvoiceId(invoice.id)}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {invoice.invoiceNumber}
                                      </span>
                                      <Badge 
                                        variant={statusBadge.variant}
                                        className={`text-xs ${statusBadge.className || ""}`}
                                      >
                                        {statusBadge.label}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                      <span>Due: {formatDate(invoice.dueDate)}</span>
                                      <span>
                                        {formatCurrencyUtil(invoice.total, displayCurrency)}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedInvoiceId(invoice.id);
                                    }}
                                  >
                                    <ArrowSquareOut className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </>
              )}
            </div>
            {selectedContractId && (
              <div className="border-t p-3 sm:p-4">
                <ContractPreviewActions contractId={selectedContractId} />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Invoice Preview Sheet */}
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
