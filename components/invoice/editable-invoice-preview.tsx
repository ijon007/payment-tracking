"use client";

import { CaretDown, Plus, Trash, X } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useRef, useState } from "react";
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
import { formatCurrency } from "@/lib/payment-utils";
import { cn } from "@/lib/utils";

interface EditableInvoicePreviewProps {
  clients: Client[];
  selectedClientId?: string;
  invoiceNumber?: string;
  issueDate?: Date;
  dueDate?: Date;
  items?: InvoiceItem[];
  taxPercent?: number;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  logoUrl?: string;
  notes?: string;
  paymentDetails?: string;
  onClientChange?: (clientId: string | undefined) => void;
  onInvoiceNumberChange?: (invoiceNumber: string) => void;
  onIssueDateChange?: (date: Date | undefined) => void;
  onDueDateChange?: (date: Date | undefined) => void;
  onItemsChange?: (items: InvoiceItem[]) => void;
  onTaxPercentChange?: (tax: number) => void;
  onCompanyNameChange?: (value: string) => void;
  onCompanyAddressChange?: (value: string) => void;
  onCompanyEmailChange?: (value: string) => void;
  onCompanyPhoneChange?: (value: string) => void;
  onLogoUrlChange?: (value: string | undefined) => void;
  onNotesChange?: (value: string) => void;
  onPaymentDetailsChange?: (value: string | undefined) => void;
}

export function EditableInvoicePreview({
  clients,
  selectedClientId,
  invoiceNumber = "INV-0002",
  issueDate = new Date(),
  dueDate,
  items = [],
  taxPercent = 0,
  companyName = "",
  companyAddress = "",
  companyEmail = "",
  companyPhone = "",
  logoUrl,
  notes = "",
  paymentDetails,
  onClientChange,
  onInvoiceNumberChange,
  onIssueDateChange,
  onDueDateChange,
  onItemsChange,
  onTaxPercentChange,
  onCompanyNameChange,
  onCompanyAddressChange,
  onCompanyEmailChange,
  onCompanyPhoneChange,
  onLogoUrlChange,
  onNotesChange,
  onPaymentDetailsChange,
}: EditableInvoicePreviewProps) {
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : undefined;

  const { subtotal, tax, total } = calculateInvoiceTotals(items, taxPercent);

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
                      {format(issueDate, "dd/MM/yyyy")}
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
                      {format(defaultDueDate, "dd/MM/yyyy")}
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
                {formatCurrency(item.amount || 0)}
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
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tax</span>
              <Input
                className="h-6 w-16 border-none bg-transparent p-0 text-right focus-visible:ring-0"
                onChange={(e) =>
                  onTaxPercentChange?.(Number(e.target.value) || 0)
                }
                placeholder="0"
                type="number"
                value={taxPercent}
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
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
    </div>
  );
}

