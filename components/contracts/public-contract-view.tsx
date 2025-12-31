"use client";

import { useEffect, useState } from "react";
import { ContractPreview } from "@/components/contracts/contract-preview";
import { usePaymentStore } from "@/lib/store";

interface PublicContractViewProps {
  token: string;
}

export function PublicContractView({ token }: PublicContractViewProps) {
  const { getContractByToken, contracts } = usePaymentStore();
  const [contractId, setContractId] = useState<string | null>(null);

  useEffect(() => {
    // Try to find contract by token
    const contract = getContractByToken(token);
    
    if (contract) {
      setContractId(contract.id);
    } else {
      // For old contracts without tokens, try to match by ID if token looks like an ID
      // This is a fallback for backward compatibility
      const possibleContract = contracts.find((cnt) => cnt.id === token);
      if (possibleContract) {
        setContractId(possibleContract.id);
      }
    }
  }, [token, getContractByToken, contracts]);

  if (!contractId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Contract Not Found</h1>
          <p className="text-muted-foreground">
            The contract you're looking for doesn't exist or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <ContractPreview contractId={contractId} showActions={true} showShareButton={false} />
      </div>
    </div>
  );
}

