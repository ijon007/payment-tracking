"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoiceTemplateCard } from "@/components/invoices/invoice-template-card";
import { InvoiceTemplatesEmpty } from "@/components/invoices/invoice-templates-empty";
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

export default function InvoicesPage() {
  const { invoiceTemplates, invoices, deleteInvoiceTemplate } =
    usePaymentStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );

  const handleDelete = (id: string) => {
    deleteInvoiceTemplate(id);
    setDeleteDialogOpen(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Invoices</h1>
        </div>
        <Link href="/invoices/templates/new">
          <Button>
            <Plus className="mr-2 size-3" weight="bold" />
            New Template
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="mb-4 font-semibold text-lg">Invoice Templates</h2>
          {invoiceTemplates.length === 0 ? (
            <InvoiceTemplatesEmpty />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {invoiceTemplates.map((template) => (
                <InvoiceTemplateCard
                  key={template.id}
                  onDelete={(id) => setDeleteDialogOpen(id)}
                  template={template}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-semibold text-lg">Generated Invoices</h2>
          <InvoiceList
            invoices={invoices}
            onInvoiceClick={setSelectedInvoiceId}
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
              variant="destructive"
            >
              <Trash className="size-3" weight="fill" />
              <span>Delete</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
        open={selectedInvoiceId !== null}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoiceId && (
            <InvoicePreview invoiceId={selectedInvoiceId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
