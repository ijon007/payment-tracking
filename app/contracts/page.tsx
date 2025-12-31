"use client";

import { Plus } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { ContractList } from "@/components/contracts/contract-list";
import { ContractPreview } from "@/components/contracts/contract-preview";
import { ContractTemplateUpload } from "@/components/contracts/contract-template-upload";
import { ContractSheet } from "@/components/contracts/contract-sheet";
import { ContractFilters } from "@/components/contracts/contract-filters";
import type { Contract } from "@/lib/contract-utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePaymentStore } from "@/lib/store";

export default function ContractsPage() {
  const { userContractTemplate, contracts } = usePaymentStore();

  const [mounted, setMounted] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [contractSheetOpen, setContractSheetOpen] = useState(false);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>(contracts);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use empty arrays during SSR to prevent hydration mismatch
  const contractsToUse = mounted ? contracts : [];
  const hasTemplate = mounted && userContractTemplate !== null;

  useEffect(() => {
    setFilteredContracts(contracts);
  }, [contracts]);

  const handleContractCreated = (contractId: string) => {
    setContractSheetOpen(false);
    
    // Small delay to allow create sheet to close smoothly, then open preview
    setTimeout(() => {
      setSelectedContractId(contractId);
    }, 200);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <h1 className="font-semibold truncate">Contracts</h1>
        </div>
        {hasTemplate && (
          <Button onClick={() => setContractSheetOpen(true)} className="shrink-0">
            <Plus className="size-3 sm:size-4" weight="bold" />
            <span className="hidden sm:inline">Create Contract</span>
            <span className="sm:hidden">Create</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6">
        {!hasTemplate ? (
          <ContractTemplateUpload />
        ) : (
          <div>
            <div className="mb-4">
              <ContractFilters
                contracts={contractsToUse}
                onFilterChange={setFilteredContracts}
              />
            </div>
            <ContractList
              contracts={filteredContracts}
              onContractClick={setSelectedContractId}
            />
          </div>
        )}
      </div>

      <Sheet
        onOpenChange={(open) => !open && setSelectedContractId(null)}
        open={selectedContractId !== null}
      >
        <SheetContent
          side="right"
          className="right-0! top-0! bottom-0! h-screen! w-full overflow-y-auto rounded-none shadow-2xl sm:right-4! sm:top-4! sm:bottom-4! sm:h-[calc(100vh-2rem)]! sm:rounded-lg sm:max-w-2xl p-0"
        >
          <div className="h-full overflow-y-auto p-3 sm:p-4">
            <SheetHeader className="sr-only">
              <SheetTitle>Contract Details</SheetTitle>
            </SheetHeader>
            {selectedContractId && (
              <ContractPreview contractId={selectedContractId} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ContractSheet
        onOpenChange={setContractSheetOpen}
        open={contractSheetOpen}
        onContractCreated={handleContractCreated}
      />
    </div>
  );
}
