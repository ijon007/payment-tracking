"use client";

import { useEffect, useState } from "react";
import { EditableInvoicePreview } from "@/components/invoice/editable-invoice-preview";
import { InvoiceSettingsDropdown, type InvoiceSettings } from "@/components/invoices/invoice-settings-dropdown";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { InvoiceItem } from "@/lib/invoice-utils";
import { generateInvoiceNumber } from "@/lib/invoice-utils";
import { usePaymentStore } from "@/lib/store";
import type { Currency } from "@/lib/currency-utils";

interface InvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export function InvoiceSheet({
  open,
  onOpenChange,
  clientId,
  onInvoiceCreated,
}: InvoiceSheetProps) {
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
  
  // Invoice settings state
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
    const selectedClient = clientId ? clients.find((c) => c.id === clientId) : undefined;
    return {
      dateFormat: "dd/MM/yyyy",
      invoiceSize: "A4",
      salesTaxEnabled: false,
      salesTaxPercent: 0,
      vatEnabled: false,
      vatPercent: 0,
      currency: (selectedClient?.currency as Currency) || "USD",
      discountEnabled: false,
      showQrCode: false,
    };
  });

  useEffect(() => {
    if (clientId) {
      setSelectedClientId(clientId);
      const selectedClient = clients.find((c) => c.id === clientId);
      if (selectedClient?.currency) {
        setInvoiceSettings((prev) => ({
          ...prev,
          currency: selectedClient.currency as Currency,
        }));
      }
    }
  }, [clientId, clients]);

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

    const invoice = generateInvoice({
      clientId: selectedClientId,
      items,
      dueDate,
      companyName,
      companyAddress: companyAddress || undefined,
      companyEmail,
      companyPhone: companyPhone || undefined,
      logoUrl,
      notes: notes || undefined,
      paymentDetails,
      // Invoice settings
      dateFormat: invoiceSettings.dateFormat,
      invoiceSize: invoiceSettings.invoiceSize,
      salesTaxEnabled: invoiceSettings.salesTaxEnabled,
      salesTaxPercent: invoiceSettings.salesTaxEnabled ? invoiceSettings.salesTaxPercent : undefined,
      vatEnabled: invoiceSettings.vatEnabled,
      vatPercent: invoiceSettings.vatEnabled ? invoiceSettings.vatPercent : undefined,
      currency: invoiceSettings.currency,
      discountEnabled: invoiceSettings.discountEnabled,
      showQrCode: invoiceSettings.showQrCode,
    });

    handleClose();
    onInvoiceCreated?.(invoice.id);
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
    // Reset settings to defaults
    const selectedClient = clientId ? clients.find((c) => c.id === clientId) : undefined;
    setInvoiceSettings({
      dateFormat: "dd/MM/yyyy",
      invoiceSize: "A4",
      salesTaxEnabled: false,
      salesTaxPercent: 0,
      vatEnabled: false,
      vatPercent: 0,
      currency: (selectedClient?.currency as Currency) || "USD",
      discountEnabled: false,
      showQrCode: false,
    });
    onOpenChange(false);
  };

  return (
    <Sheet onOpenChange={handleClose} open={open}>
      <SheetContent
        className="right-0! top-0! bottom-0! h-screen! w-full overflow-y-auto rounded-none shadow-2xl sm:right-4! sm:top-4! sm:bottom-4! sm:h-[calc(100vh-2rem)]! sm:rounded sm:max-w-4xl p-0"
        side="right"
        showCloseButton={false}
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Create Invoice</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <div className="mb-4 flex justify-end">
              <InvoiceSettingsDropdown
                settings={invoiceSettings}
                onSettingsChange={(updates) =>
                  setInvoiceSettings((prev) => ({ ...prev, ...updates }))
                }
              />
            </div>
            <EditableInvoicePreview
                clients={clients}
                dueDate={dueDate}
                invoiceNumber={invoiceNumber}
                issueDate={issueDate}
                items={items}
                selectedClientId={selectedClientId}
                companyName={companyName}
                companyAddress={companyAddress}
                companyEmail={companyEmail}
                companyPhone={companyPhone}
                logoUrl={logoUrl}
                notes={notes}
                paymentDetails={paymentDetails}
                invoiceSettings={invoiceSettings}
                onClientChange={setSelectedClientId}
                onDueDateChange={setDueDate}
                onInvoiceNumberChange={setInvoiceNumber}
                onIssueDateChange={(date) => setIssueDate(date || new Date())}
                onItemsChange={setItems}
                onCompanyNameChange={setCompanyName}
                onCompanyAddressChange={setCompanyAddress}
                onCompanyEmailChange={setCompanyEmail}
                onCompanyPhoneChange={setCompanyPhone}
                onLogoUrlChange={setLogoUrl}
                onNotesChange={setNotes}
                onPaymentDetailsChange={setPaymentDetails}
                onSettingsChange={(updates) =>
                  setInvoiceSettings((prev) => ({ ...prev, ...updates }))
                }
              />
          </div>

          <div className="border-t p-3 sm:p-6">
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <Button onClick={handleClose} variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                disabled={!selectedClientId || items.length === 0 || !dueDate || !companyName || !companyEmail}
                onClick={handleCreateInvoice}
                className="w-full sm:w-auto"
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

