"use client";

import { Calendar as CalendarIcon, Download } from "@phosphor-icons/react";
import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type InvoiceItem, paymentToInvoiceItem } from "@/lib/invoice-utils";
import { formatCurrency } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { InvoicePDF } from "./invoice-pdf";
import { InvoicePreview } from "./invoice-preview";

interface InvoiceGeneratorProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceGenerator({
  clientId,
  open,
  onOpenChange,
}: InvoiceGeneratorProps) {
  const {
    getClient,
    invoiceTemplates,
    generateInvoice,
    getInvoiceTemplate,
    getInvoice,
  } = usePaymentStore();

  const client = getClient(clientId);
  const unpaidPayments = client?.payments.filter((p) => !p.paidDate) || [];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (open && invoiceTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(invoiceTemplates[0].id);
    }
  }, [open, invoiceTemplates, selectedTemplateId]);

  useEffect(() => {
    if (!dueDate) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate);
    }
  }, [dueDate]);

  useEffect(() => {
    if (selectedPaymentIds.length > 0 && client) {
      const items: InvoiceItem[] = selectedPaymentIds
        .map((paymentId) => {
          const payment = client.payments.find((p) => p.id === paymentId);
          return payment ? paymentToInvoiceItem(payment) : null;
        })
        .filter((item): item is InvoiceItem => item !== null);

      setInvoiceItems(items);
    } else {
      setInvoiceItems([]);
    }
  }, [selectedPaymentIds, client]);

  const handleGenerate = () => {
    if (!selectedTemplateId || invoiceItems.length === 0 || !dueDate) {
      return;
    }

    const invoice = generateInvoice({
      templateId: selectedTemplateId,
      clientId,
      items: invoiceItems,
      dueDate,
    });

    setGeneratedInvoiceId(invoice.id);
  };

  const handleClose = () => {
    setSelectedPaymentIds([]);
    setInvoiceItems([]);
    setGeneratedInvoiceId(null);
    onOpenChange(false);
  };

  const handleDownloadPDF = async () => {
    if (!(generatedInvoiceId && client)) {
      return;
    }

    const invoice = getInvoice(generatedInvoiceId);
    if (!invoice) {
      return;
    }

    const template = getInvoiceTemplate(invoice.templateId);
    if (!template) {
      return;
    }

    try {
      const blob = await pdf(
        <InvoicePDF client={client} invoice={invoice} template={template} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  if (!client) {
    return null;
  }

  const selectedTemplate = selectedTemplateId
    ? getInvoiceTemplate(selectedTemplateId)
    : null;

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoice for {client.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Select a template and payments to include in the invoice.
          </DialogDescription>
        </DialogHeader>

        {generatedInvoiceId ? (
          <div className="space-y-4">
            <InvoicePreview invoiceId={generatedInvoiceId} />
            <DialogFooter>
              <Button onClick={handleDownloadPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label className="text-xs" htmlFor="template">
                  Invoice Template
                </Label>
                <Select
                  onValueChange={setSelectedTemplateId}
                  value={selectedTemplateId}
                >
                  <SelectTrigger className="w-full border-border" id="template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {invoiceTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {invoiceTemplates.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    No templates available. Create one in the Invoices page.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Due Date</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        className={cn(
                          "w-full justify-start text-left font-normal hover:bg-white/10 hover:text-white",
                          !dueDate && "text-muted-foreground"
                        )}
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? (
                          format(dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    }
                  />
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      className="p-2 [--cell-size:2.5rem]"
                      initialFocus
                      mode="single"
                      onSelect={setDueDate}
                      selected={dueDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Select Payments to Invoice</Label>
                {unpaidPayments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No unpaid payments available for this client.
                  </p>
                ) : (
                  <Combobox
                    emptyMessage="No payments found."
                    multiple={true}
                    onValueChange={setSelectedPaymentIds}
                    options={unpaidPayments.map((payment) => ({
                      value: payment.id,
                      label:
                        payment.type === "retainer"
                          ? "Retainer Payment"
                          : `Installment ${payment.installmentNumber}`,
                      description: `${formatCurrency(payment.amount)} • Due: ${format(payment.dueDate, "MMM dd, yyyy")}`,
                    }))}
                    placeholder="Select payments..."
                    searchPlaceholder="Search payments..."
                    value={selectedPaymentIds}
                  />
                )}
              </div>

              {invoiceItems.length > 0 && selectedTemplate && dueDate && (
                <div className="border-t pt-4">
                  <InvoicePreview
                    client={client}
                    dueDate={dueDate}
                    items={invoiceItems}
                    template={selectedTemplate}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button
                disabled={
                  !selectedTemplateId || invoiceItems.length === 0 || !dueDate
                }
                onClick={handleGenerate}
              >
                Generate Invoice
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
