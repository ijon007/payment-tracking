"use client";

import { CaretDown, Plus, QrCode, Trash, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceItem } from "@/lib/invoice-utils";
import { calculateInvoiceTotals } from "@/lib/invoice-utils";
import type { Client } from "@/lib/payment-utils";
import { formatCurrency } from "@/lib/currency-utils";
import { formatDateWithFormat } from "@/lib/date-utils";
import type { InvoiceSettings } from "@/components/invoices/invoice-settings-dropdown";

interface EditableInvoicePreviewProps {
  clients: Client[];
  selectedClientId?: string;
  invoiceNumber?: string;
  issueDate?: Date;
  dueDate?: Date;
  items?: InvoiceItem[];
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  logoUrl?: string;
  notes?: string;
  paymentDetails?: string;
  invoiceSettings: InvoiceSettings;
  onClientChange?: (clientId: string | undefined) => void;
  onInvoiceNumberChange?: (invoiceNumber: string) => void;
  onIssueDateChange?: (date: Date | undefined) => void;
  onDueDateChange?: (date: Date | undefined) => void;
  onItemsChange?: (items: InvoiceItem[]) => void;
  onCompanyNameChange?: (value: string) => void;
  onCompanyAddressChange?: (value: string) => void;
  onCompanyEmailChange?: (value: string) => void;
  onCompanyPhoneChange?: (value: string) => void;
  onLogoUrlChange?: (value: string | undefined) => void;
  onNotesChange?: (value: string) => void;
  onPaymentDetailsChange?: (value: string | undefined) => void;
  onSettingsChange?: (settings: Partial<InvoiceSettings>) => void;
}

export function EditableInvoicePreview({
  clients,
  selectedClientId,
  invoiceNumber = "INV-0002",
  issueDate = new Date(),
  dueDate,
  items = [],
  companyName = "",
  companyAddress = "",
  companyEmail = "",
  companyPhone = "",
  logoUrl,
  notes = "",
  paymentDetails,
  invoiceSettings,
  onClientChange,
  onInvoiceNumberChange,
  onIssueDateChange,
  onDueDateChange,
  onItemsChange,
  onCompanyNameChange,
  onCompanyAddressChange,
  onCompanyEmailChange,
  onCompanyPhoneChange,
  onLogoUrlChange,
  onNotesChange,
  onPaymentDetailsChange,
  onSettingsChange,
}: EditableInvoicePreviewProps) {
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : undefined;

  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountInput, setDiscountInput] = useState<string>("");
  const [salesTaxInput, setSalesTaxInput] = useState<string>("");
  const [vatInput, setVatInput] = useState<string>("");

  // Sync local input state with props
  useEffect(() => {
    setDiscountInput(discountAmount.toString());
  }, [discountAmount]);

  useEffect(() => {
    if (invoiceSettings.salesTaxEnabled) {
      setSalesTaxInput(invoiceSettings.salesTaxPercent?.toString() || "");
    }
  }, [invoiceSettings.salesTaxPercent, invoiceSettings.salesTaxEnabled]);

  useEffect(() => {
    if (invoiceSettings.vatEnabled) {
      setVatInput(invoiceSettings.vatPercent?.toString() || "");
    }
  }, [invoiceSettings.vatPercent, invoiceSettings.vatEnabled]);

  const { subtotal, salesTax, vat, discount, total } = calculateInvoiceTotals(
    items,
    {
      salesTaxPercent: invoiceSettings.salesTaxEnabled
        ? invoiceSettings.salesTaxPercent
        : undefined,
      vatPercent: invoiceSettings.vatEnabled
        ? invoiceSettings.vatPercent
        : undefined,
      discountAmount: invoiceSettings.discountEnabled ? discountAmount : undefined,
    }
  );

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === "description") {
      item.description = value as string;
    } else if (field === "quantity") {
      item.quantity = Number(value) || 0;
    } else if (field === "price") {
      item.price = Number(value) || 0;
    }
    
    item.amount = item.quantity * item.price;
    newItems[index] = item;
    onItemsChange?.(newItems);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      description: "",
      quantity: 1,
      price: 0,
      amount: 0,
    };
    onItemsChange?.([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange?.(newItems);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoUrlChange?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLogoUrlChange?.(undefined);
  };

  const defaultDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Invoice</h1>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Invoice No:</span>
              <Input
                className="h-6 w-32 border-none bg-transparent p-0 font-medium focus-visible:ring-0"
                onChange={(e) => onInvoiceNumberChange?.(e.target.value)}
                value={invoiceNumber}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Issue Date:</span>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      className="h-6 border-none bg-transparent p-0 font-normal shadow-none hover:bg-transparent"
                      variant="ghost"
                    >
                      {formatDateWithFormat(issueDate, invoiceSettings.dateFormat)}
                    </Button>
                  }
                />
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    initialFocus
                    mode="single"
                    onSelect={(date) => onIssueDateChange?.(date)}
                    selected={issueDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Due Date:</span>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      className="h-6 border-none bg-transparent p-0 font-normal shadow-none hover:bg-transparent"
                      variant="ghost"
                    >
                      {formatDateWithFormat(defaultDueDate, invoiceSettings.dateFormat)}
                    </Button>
                  }
                />
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    initialFocus
                    mode="single"
                    onSelect={(date) => onDueDateChange?.(date)}
                    selected={defaultDueDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            type="file"
          />
          <div
            className="relative h-16 w-16 rounded border bg-muted overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLogoClick();
              }
            }}
          >
            {logoUrl ? (
              <>
                <img
                  alt="Company logo"
                  className="h-full w-full object-cover"
                  src={logoUrl}
                />
                <button
                  className="absolute right-1 top-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  onClick={handleRemoveLogo}
                  type="button"
                >
                  <X className="size-3" weight="bold" />
                </button>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                Click to add logo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* From/To Sections */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">From</p>
          <Input
            className="border-none bg-transparent p-0 font-medium focus-visible:ring-0"
            onChange={(e) => onCompanyNameChange?.(e.target.value)}
            placeholder="Company Name"
            value={companyName}
          />
          <Input
            className="border-none bg-transparent p-0 text-sm text-muted-foreground focus-visible:ring-0"
            onChange={(e) => onCompanyAddressChange?.(e.target.value)}
            placeholder="Company Address"
            value={companyAddress}
          />
          <Input
            className="border-none bg-transparent p-0 text-sm text-muted-foreground focus-visible:ring-0"
            onChange={(e) => onCompanyEmailChange?.(e.target.value)}
            placeholder="Company Email"
            value={companyEmail}
          />
          <Input
            className="border-none bg-transparent p-0 text-sm text-muted-foreground focus-visible:ring-0"
            onChange={(e) => onCompanyPhoneChange?.(e.target.value)}
            placeholder="Company Phone"
            value={companyPhone}
          />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">To</p>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="w-full justify-start border-none bg-transparent p-0 font-medium shadow-none hover:bg-transparent"
                  variant="ghost"
                >
                  {selectedClient?.name || "Select customer"}
                  <CaretDown className="size-3" />
                </Button>
              }
            />
            <DropdownMenuContent>
              {clients.map((client) => (
                <DropdownMenuItem
                  key={client.id}
                  onClick={() => onClientChange?.(client.id)}
                >
                  {client.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 border-b pb-2 text-sm">
          <div className="text-muted-foreground font-medium">Description</div>
          <div className="text-right text-muted-foreground font-medium">
            Quantity
          </div>
          <div className="text-right text-muted-foreground font-medium">
            Price
          </div>
          <div className="text-right text-muted-foreground font-medium">
            Total
          </div>
        </div>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <Input
              className="border-none bg-transparent p-0 focus-visible:ring-0"
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
              placeholder="Item description"
              value={item.description}
            />
            <Input
              className="text-right border-none bg-transparent p-0 focus-visible:ring-0"
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
              placeholder="0"
              type="number"
              value={item.quantity || ""}
            />
            <Input
              className="text-right border-none bg-transparent p-0 focus-visible:ring-0"
              onChange={(e) =>
                handleItemChange(index, "price", e.target.value)
              }
              placeholder="0"
              type="number"
              value={item.price || ""}
            />
            <div className="flex items-center justify-end gap-2">
              <span className="font-medium">
                {formatCurrency(item.amount || 0, invoiceSettings.currency)}
              </span>
              <Button
                className="h-6 w-6"
                onClick={() => handleRemoveItem(index)}
                size="icon"
                variant="destructive"
              >
                <Trash className="size-3" weight="fill" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          className="w-fit"
          onClick={handleAddItem}
          size="sm"
          variant="ghost"
        >
          <Plus className="mr-2 size-3" weight="bold" />
          Add item
        </Button>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(subtotal, invoiceSettings.currency)}
            </span>
          </div>
          
          {/* Discount */}
          {invoiceSettings.discountEnabled && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Discount</span>
                <Input
                  className="h-6 w-7 border-none bg-transparent p-0 text-right text-muted-foreground focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&input[type=number]]:appearance-none"
                  onChange={(e) => {
                    const val = e.target.value;
                    setDiscountInput(val);
                    const numVal = val === "" ? 0 : Number(val);
                    if (!isNaN(numVal)) {
                      setDiscountAmount(numVal);
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    const numVal = val === "" ? 0 : Number(val) || 0;
                    setDiscountInput(numVal.toString());
                    setDiscountAmount(numVal);
                  }}
                  placeholder="0"
                  type="number"
                  value={discountInput}
                  style={{
                    MozAppearance: "textfield",
                  }}
                />
              </div>
              <span className="font-medium">
                {formatCurrency(discount, invoiceSettings.currency)}
              </span>
            </div>
          )}

          {/* Sales Tax */}
          {invoiceSettings.salesTaxEnabled && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Sales Tax</span>
                <div className="flex items-center">
                  <span className="text-muted-foreground">(</span>
                  <Input
                    className="h-6 border-none bg-transparent p-0 text-right text-muted-foreground focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&input[type=number]]:appearance-none"
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty string for clearing
                      if (val === "") {
                        setSalesTaxInput("");
                        return;
                      }
                      // Only allow digits
                      if (!/^\d+$/.test(val)) {
                        return;
                      }
                      const numVal = Number(val);
                      // Clamp between 0 and 100
                      const clampedVal = Math.min(Math.max(numVal, 0), 100);
                      setSalesTaxInput(clampedVal.toString());
                      onSettingsChange?.({
                        salesTaxPercent: clampedVal,
                      });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const numVal = val === "" ? 0 : Math.min(Math.max(Number(val) || 0, 0), 100);
                      setSalesTaxInput(numVal.toString());
                      onSettingsChange?.({
                        salesTaxPercent: numVal,
                      });
                    }}
                    placeholder="0"
                    type="number"
                    max={100}
                    min={0}
                    value={salesTaxInput}
                    style={{
                      MozAppearance: "textfield",
                      width: `${Math.max((vatInput.length || 1) * 0.3 + 0.5, 0.75)}rem`,
                      margin: 0,
                    }}
                  />
                  <span className="text-muted-foreground">%)</span>
                </div>
              </div>
              <span className="font-medium">
                {formatCurrency(salesTax, invoiceSettings.currency)}
              </span>
            </div>
          )}

          {/* VAT */}
          {invoiceSettings.vatEnabled && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">VAT</span>
                <div className="flex items-center">
                  <span className="text-muted-foreground">(</span>
                  <Input
                    className="h-6 border-none bg-transparent p-0 text-right text-muted-foreground focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&input[type=number]]:appearance-none"
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty string for clearing
                      if (val === "") {
                        setVatInput("");
                        return;
                      }
                      // Only allow digits
                      if (!/^\d+$/.test(val)) {
                        return;
                      }
                      const numVal = Number(val);
                      // Clamp between 0 and 100
                      const clampedVal = Math.min(Math.max(numVal, 0), 100);
                      setVatInput(clampedVal.toString());
                      onSettingsChange?.({
                        vatPercent: clampedVal,
                      });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const numVal = val === "" ? 0 : Math.min(Math.max(Number(val) || 0, 0), 100);
                      setVatInput(numVal.toString());
                      onSettingsChange?.({
                        vatPercent: numVal,
                      });
                    }}
                    placeholder="0"
                    type="number"
                    value={vatInput}
                    max={100}
                    min={0}
                    style={{
                      MozAppearance: "textfield",
                      width: `${Math.max((vatInput.length || 1) * 0.3 + 0.5, 0.75)}rem`,
                      margin: 0,
                    }}
                  />
                  <span className="text-muted-foreground">%)</span>
                </div>
              </div>
              <span className="font-medium">
                {formatCurrency(vat, invoiceSettings.currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total, invoiceSettings.currency)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8 border-t pt-4">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Payment Details</p>
          <Textarea
            className="min-h-16 border-none bg-transparent p-0 focus-visible:ring-0"
            onChange={(e) => onPaymentDetailsChange?.(e.target.value || undefined)}
            placeholder="Payment details..."
            value={paymentDetails || ""}
          />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Note</p>
          <Textarea
            className="min-h-16 border-none bg-transparent p-0 focus-visible:ring-0"
            onChange={(e) => onNotesChange?.(e.target.value)}
            placeholder="Additional notes..."
            value={notes}
          />
        </div>
      </div>

      {/* QR Code */}
      {invoiceSettings.showQrCode && (
        <div className="flex justify-center border-t pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-32 w-32 items-center justify-center rounded border bg-muted">
              <QrCode className="size-24 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs">QR Code</p>
          </div>
        </div>
      )}
    </div>
  );
}

