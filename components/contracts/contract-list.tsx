"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { Contract } from "@/lib/contract-utils";

interface ContractListProps {
  contracts: Contract[];
  onContractClick: (contractId: string) => void;
}

export function ContractList({
  contracts,
  onContractClick,
}: ContractListProps) {
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
        <div className="divide-y">
          {contracts.map((contract) => (
            <div
              className="mx-2 flex cursor-pointer items-center justify-between rounded-md p-4 transition-colors hover:bg-white/10"
              key={contract.id}
              onClick={() => onContractClick(contract.id)}
            >
              <div>
                <p className="font-medium">{contract.contractNumber}</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(contract.issueDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-secondary px-2 py-1 text-secondary-foreground text-xs">
                  {contract.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
