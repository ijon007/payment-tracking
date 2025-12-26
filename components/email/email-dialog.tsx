"use client";

import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePaymentStore } from "@/lib/store";
import { ContractPDF } from "../contracts/contract-pdf";
import { InvoicePDF } from "../invoice/invoice-pdf";
import { SimpleTextEditor } from "./simple-text-editor";

interface EmailDialogProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailDialog({
  clientId,
  open,
  onOpenChange,
}: EmailDialogProps) {
  const {
    getClient,
    invoices,
    contracts,
    getInvoiceTemplate,
    getContractTemplate,
  } = usePaymentStore();

  const client = getClient(clientId);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>([]);

  // Filter invoices and contracts for this client
  const clientInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.clientId === clientId),
    [invoices, clientId]
  );

  const clientContracts = useMemo(
    () => contracts.filter((contract) => contract.clientId === clientId),
    [contracts, clientId]
  );

  // Initialize To field with client name when dialog opens
  useEffect(() => {
    if (open && client) {
      setTo(client.name);
      setSubject("");
      setBody("");
      setSelectedInvoiceIds([]);
      setSelectedContractIds([]);
    }
  }, [open, client]);

  const handleClose = () => {
    setTo("");
    setSubject("");
    setBody("");
    setSelectedInvoiceIds([]);
    setSelectedContractIds([]);
    onOpenChange(false);
  };

  const handleSend = async () => {
    // Generate PDFs for selected attachments
    const attachments: { name: string; blob: Blob }[] = [];

    // Generate invoice PDFs
    for (const invoiceId of selectedInvoiceIds) {
      const invoice = clientInvoices.find((i) => i.id === invoiceId);
      if (!(invoice && client)) {
        continue;
      }

      const template = getInvoiceTemplate(invoice.templateId);
      if (!template) {
        continue;
      }

      try {
        const blob = await pdf(
          <InvoicePDF client={client} invoice={invoice} template={template} />
        ).toBlob();
        attachments.push({
          name: `${invoice.invoiceNumber}.pdf`,
          blob,
        });
      } catch (error) {
        console.error(
          `Failed to generate PDF for invoice ${invoiceId}:`,
          error
        );
      }
    }

    // Generate contract PDFs
    for (const contractId of selectedContractIds) {
      const contract = clientContracts.find((c) => c.id === contractId);
      if (!(contract && client)) {
        continue;
      }

      const template = getContractTemplate(contract.templateId);
      if (!template) {
        continue;
      }

      try {
        const blob = await pdf(
          <ContractPDF
            client={client}
            contract={contract}
            template={template}
          />
        ).toBlob();
        attachments.push({
          name: `${contract.contractNumber}.pdf`,
          blob,
        });
      } catch (error) {
        console.error(
          `Failed to generate PDF for contract ${contractId}:`,
          error
        );
      }
    }

    // Placeholder for email sending functionality
    console.log("Email data:", {
      to,
      subject,
      body,
      attachments: attachments.map((a) => a.name),
    });

    // For now, just close the dialog
    // In the future, this would integrate with an email API
    handleClose();
  };

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const toggleContract = (contractId: string) => {
    setSelectedContractIds((prev) =>
      prev.includes(contractId)
        ? prev.filter((id) => id !== contractId)
        : [...prev, contractId]
    );
  };

  if (!client) {
    return null;
  }

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email to {client.name}</DialogTitle>
          <DialogDescription>
            Compose and send an email with optional attachments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient email address"
              value={to}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              value={subject}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="body">Message</Label>
            <SimpleTextEditor
              onChange={setBody}
              placeholder="Write your message here..."
              value={body}
            />
          </div>

          {(clientInvoices.length > 0 || clientContracts.length > 0) && (
            <div className="grid gap-3 border-t pt-4">
              <Label>Attachments</Label>

              {clientInvoices.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-medium text-muted-foreground text-sm">
                    Invoices
                  </Label>
                  {clientInvoices.map((invoice) => (
                    <div
                      className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted/50"
                      key={invoice.id}
                    >
                      <Checkbox
                        checked={selectedInvoiceIds.includes(invoice.id)}
                        id={`invoice-${invoice.id}`}
                        onCheckedChange={() => toggleInvoice(invoice.id)}
                      />
                      <label
                        className="flex-1 cursor-pointer text-sm"
                        htmlFor={`invoice-${invoice.id}`}
                      >
                        <div className="font-medium">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Issued: {format(invoice.issueDate, "MMM dd, yyyy")} •
                          Due: {format(invoice.dueDate, "MMM dd, yyyy")}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {clientContracts.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-medium text-muted-foreground text-sm">
                    Contracts
                  </Label>
                  {clientContracts.map((contract) => (
                    <div
                      className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted/50"
                      key={contract.id}
                    >
                      <Checkbox
                        checked={selectedContractIds.includes(contract.id)}
                        id={`contract-${contract.id}`}
                        onCheckedChange={() => toggleContract(contract.id)}
                      />
                      <label
                        className="flex-1 cursor-pointer text-sm"
                        htmlFor={`contract-${contract.id}`}
                      >
                        <div className="font-medium">
                          {contract.contractNumber}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Issued: {format(contract.issueDate, "MMM dd, yyyy")} •
                          Period: {format(contract.startDate, "MMM dd, yyyy")} -{" "}
                          {format(contract.endDate, "MMM dd, yyyy")}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!(to && subject)} onClick={handleSend}>
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
