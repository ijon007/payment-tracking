"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditableInvoicePreview } from "@/components/invoice/editable-invoice-preview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { InvoiceItem } from "@/lib/invoice-utils";
import { generateInvoiceNumber } from "@/lib/invoice-utils";
import { usePaymentStore } from "@/lib/store";

interface InvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
}

export function InvoiceSheet({
  open,
  onOpenChange,
  clientId,
}: InvoiceSheetProps) {
  const router = useRouter();
  const { clients, generateInvoice } = usePaymentStore();

  const [companyName, setCompanyName] = useState<string>("");
  const [companyAddress, setCompanyAddress] = useState<string>("");
  const [companyEmail, setCompanyEmail] = useState<string>("");
  const [companyPhone, setCompanyPhone] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<string | undefined>(undefined);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(clientId);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [taxPercent, setTaxPercent] = useState(0);

  useEffect(() => {
    if (clientId) {
      setSelectedClientId(clientId);
    }
  }, [clientId]);

  useEffect(() => {
    if (!dueDate) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate);
    }
  }, [dueDate]);

  const handleCreateInvoice = () => {
    if (!selectedClientId || items.length === 0 || !dueDate) {
      return;
    }

    if (!companyName || !companyEmail) {
      return;
    }

    generateInvoice({
      clientId: selectedClientId,
      items,
      dueDate,
      tax: taxPercent > 0 ? taxPercent : undefined,
      companyName,
      companyAddress: companyAddress || undefined,
      companyEmail,
      companyPhone: companyPhone || undefined,
      logoUrl,
      notes: notes || undefined,
      paymentDetails,
    });

    handleClose();
    router.push("/invoices");
  };

  const handleClose = () => {
    setCompanyName("");
    setCompanyAddress("");
    setCompanyEmail("");
    setCompanyPhone("");
    setLogoUrl(undefined);
    setNotes("");
    setPaymentDetails(undefined);
    setSelectedClientId(clientId);
    setInvoiceNumber(generateInvoiceNumber());
    setIssueDate(new Date());
    setDueDate(undefined);
    setItems([]);
    setTaxPercent(0);
    onOpenChange(false);
  };

  return (
    <Sheet onOpenChange={handleClose} open={open}>
      <SheetContent
        className="!right-4 !top-4 !bottom-4 !h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-lg shadow-2xl sm:max-w-4xl p-0"
        side="right"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b p-6">
            <SheetTitle>Create Invoice</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <EditableInvoicePreview
              clients={clients}
              dueDate={dueDate}
              invoiceNumber={invoiceNumber}
              issueDate={issueDate}
              items={items}
              selectedClientId={selectedClientId}
              taxPercent={taxPercent}
              companyName={companyName}
              companyAddress={companyAddress}
              companyEmail={companyEmail}
              companyPhone={companyPhone}
              logoUrl={logoUrl}
              notes={notes}
              paymentDetails={paymentDetails}
              onClientChange={setSelectedClientId}
              onDueDateChange={setDueDate}
              onInvoiceNumberChange={setInvoiceNumber}
              onIssueDateChange={(date) => setIssueDate(date || new Date())}
              onItemsChange={setItems}
              onTaxPercentChange={setTaxPercent}
              onCompanyNameChange={setCompanyName}
              onCompanyAddressChange={setCompanyAddress}
              onCompanyEmailChange={setCompanyEmail}
              onCompanyPhoneChange={setCompanyPhone}
              onLogoUrlChange={setLogoUrl}
              onNotesChange={setNotes}
              onPaymentDetailsChange={setPaymentDetails}
            />
          </div>

          <div className="border-t p-6">
            <div className="flex items-center justify-end gap-2">
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
              <Button
                disabled={!selectedClientId || items.length === 0 || !dueDate || !companyName || !companyEmail}
                onClick={handleCreateInvoice}
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

