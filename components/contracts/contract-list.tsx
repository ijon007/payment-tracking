"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Contract } from "@/lib/contract-utils";
import { useFormattedDate } from "@/lib/date-utils";
import { Badge } from "../ui/badge";

interface ContractListProps {
  contracts: Contract[];
  onContractClick: (contractId: string) => void;
}

export function ContractList({
  contracts,
  onContractClick,
}: ContractListProps) {
  const formatDate = useFormattedDate();

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No contracts generated yet. Generate contracts from the Clients
            page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-2">
      <CardContent className="p-0">
        <div className="space-y-1">
          {contracts.map((contract) => (
            <div
              className="mx-2 flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-white/10"
              key={contract.id}
              onClick={() => onContractClick(contract.id)}
            >
              <div>
                <p className="font-medium">{contract.contractNumber}</p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(new Date(contract.issueDate))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {contract.status.charAt(0).toUpperCase() +
                    contract.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
