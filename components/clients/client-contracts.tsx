"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
import { format } from "date-fns";
import Link from "next/link";
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
import type { Client } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";

interface ClientContractsProps {
  client: Client;
  displayCurrency: Currency;
}

export function ClientContracts({
  client,
  displayCurrency,
}: ClientContractsProps) {
  const { contracts, getContractTemplate } = usePaymentStore();
  const clientContracts = useMemo(
    () => contracts.filter((c) => c.clientId === client.id),
    [contracts, client.id]
  );
  const [convertedCosts, setConvertedCosts] = useState<Record<string, number>>(
    {}
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
    status: "draft" | "sent" | "signed" | "active" | "expired"
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
      case "signed":
        return "default";
      case "sent":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (clientContracts.length === 0) {
    return (
      <Card id="contracts">
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
    <Card id="contracts">
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
        <CardDescription>
          All contracts generated for this client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Number</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Project Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientContracts.map((contract) => {
              const _template = getContractTemplate(contract.templateId);
              return (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.contractNumber}
                  </TableCell>
                  <TableCell>
                    {format(contract.issueDate, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(contract.startDate, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(contract.endDate, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {contract.projectCost
                      ? formatCurrencyUtil(
                          convertedCosts[contract.id] ?? contract.projectCost,
                          displayCurrency
                        )
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(contract.status)}>
                      {contract.status.charAt(0).toUpperCase() +
                        contract.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/contracts?contract=${contract.id}`}>
                      <Button size="sm" variant="ghost">
                        <ArrowSquareOut className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
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
