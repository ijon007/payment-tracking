"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Contract } from "@/lib/contract-utils";
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

interface ContractListProps {
  contracts: Contract[];
  onContractClick: (contractId: string) => void;
}

function getStatusBadge(
  status: Contract["status"]
): { 
  label: string; 
  variant: "default" | "secondary" | "destructive" | "outline";
  className?: string;
} {
  switch (status) {
    case "active":
    case "signed":
      return { 
        label: status.charAt(0).toUpperCase() + status.slice(1), 
        variant: "default",
        className: "bg-green-500/10 text-green-600 dark:text-green-400"
      };
    case "sent":
      return { 
        label: "Sent", 
        variant: "secondary" 
      };
    case "expired":
      return { 
        label: "Expired", 
        variant: "destructive" 
      };
    default:
      return { 
        label: "Draft", 
        variant: "outline" 
      };
  }
}

export function ContractList({ contracts, onContractClick }: ContractListProps) {
  const { getClient } = usePaymentStore();
  const formatDate = useFormattedDate();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors by only rendering dates after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <Card size="default">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Loading...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card size="default">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No contracts generated yet. Create your first contract to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="flex flex-col gap-3 sm:hidden">
        {contracts.map((contract) => {
          const client = getClient(contract.clientId);
          const clientName = client?.name || "Unknown Client";
          const statusBadge = getStatusBadge(contract.status);

          return (
            <Card
              key={contract.id}
              size="default"
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => onContractClick(contract.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {contract.contractNumber}
                    </div>
                  </div>
                  <Badge 
                    variant={statusBadge.variant} 
                    className={`text-xs shrink-0 ${statusBadge.className || ""}`}
                  >
                    {statusBadge.label}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Client:</span>
                    <span className="font-medium truncate ml-2">{clientName}</span>
                  </div>
                  {contract.projectCost && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Project Cost:</span>
                      <span className="font-semibold">{formatCurrency(contract.projectCost)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{formatDate(contract.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{formatDate(contract.endDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(contract.issueDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <Card size="default" className="hidden sm:block py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-sm hover:bg-card">
                <TableHead className="w-[140px] border-r">Contract Number</TableHead>
                <TableHead className="w-[120px] border-r">Client</TableHead>
                <TableHead className="w-[100px] border-r">Start Date</TableHead>
                <TableHead className="w-[100px] border-r">End Date</TableHead>
                <TableHead className="w-[110px] border-r">Project Cost</TableHead>
                <TableHead className="w-[100px] border-r">Status</TableHead>
                <TableHead className="w-[100px]">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => {
                const client = getClient(contract.clientId);
                const clientName = client?.name || "Unknown Client";
                const statusBadge = getStatusBadge(contract.status);

                return (
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer transition-colors"
                    onClick={() => onContractClick(contract.id)}
                  >
                    <TableCell className="border-r">
                      <span className="text-sm font-medium">
                        {contract.contractNumber}
                      </span>
                    </TableCell>
                    <TableCell className="border-r">
                      <span className="text-sm">{clientName}</span>
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
                          ? formatCurrency(contract.projectCost)
                          : "—"}
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
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(contract.issueDate)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
