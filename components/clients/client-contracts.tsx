"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { ContractPreview } from "@/components/contracts/contract-preview";

interface ClientContractsProps {
  client: Client;
  displayCurrency: Currency;
}

export function ClientContracts({
  client,
  displayCurrency,
}: ClientContractsProps) {
  const { contracts } = usePaymentStore();
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
          className="right-0! top-0! bottom-0! h-screen! w-full overflow-y-auto rounded-none shadow-2xl sm:right-4! sm:top-4! sm:bottom-4! sm:h-[calc(100vh-2rem)]! sm:rounded-lg sm:max-w-2xl p-3 sm:p-4"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Contract Details</SheetTitle>
          </SheetHeader>
          {selectedContractId && (
            <ContractPreview contractId={selectedContractId} />
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
