"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContractList } from "@/components/contracts/contract-list";
import { ContractPreview } from "@/components/contracts/contract-preview";
import { ContractTemplateCard } from "@/components/contracts/contract-template-card";
import { ContractTemplatesEmpty } from "@/components/contracts/contract-templates-empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePaymentStore } from "@/lib/store";

export default function ContractsPage() {
  const { contractTemplates, contracts, deleteContractTemplate } =
    usePaymentStore();

  const [mounted, setMounted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use empty arrays during SSR to prevent hydration mismatch
  const templatesToUse = mounted ? contractTemplates : [];
  const contractsToUse = mounted ? contracts : [];

  const handleDelete = (id: string) => {
    deleteContractTemplate(id);
    setDeleteDialogOpen(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Contracts</h1>
        </div>
        <Link href="/contracts/templates/new">
          <Button>
            <Plus className="size-3" weight="bold" />
            New Template
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="mb-4 font-semibold text-lg">Contract Templates</h2>
          {templatesToUse.length === 0 ? (
            <ContractTemplatesEmpty />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templatesToUse.map((template) => (
                <ContractTemplateCard
                  key={template.id}
                  onDelete={(id) => setDeleteDialogOpen(id)}
                  template={template}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-semibold text-lg">Generated Contracts</h2>
          <ContractList
            contracts={contractsToUse}
            onContractClick={setSelectedContractId}
          />
        </div>
      </div>

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
        open={deleteDialogOpen !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogOpen && handleDelete(deleteDialogOpen)}
            >
              <Trash className="size-3" weight="fill" />
              <span>Delete</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => !open && setSelectedContractId(null)}
        open={selectedContractId !== null}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
          </DialogHeader>
          {selectedContractId && (
            <ContractPreview contractId={selectedContractId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
