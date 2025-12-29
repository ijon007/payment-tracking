"use client";

import {
  Calendar,
  CurrencyDollar,
  FileText,
  Gear,
  QrCode,
  Receipt,
  Tag,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Currency } from "@/lib/currency-utils";
import { CURRENCIES } from "@/lib/currency-utils";
import type { DateFormat } from "@/lib/settings-store";

export interface InvoiceSettings {
  dateFormat: DateFormat;
  invoiceSize: "A4" | "Letter" | "Legal";
  salesTaxEnabled: boolean;
  salesTaxPercent: number;
  vatEnabled: boolean;
  vatPercent: number;
  currency: Currency;
  discountEnabled: boolean;
  showQrCode: boolean;
}

interface InvoiceSettingsDropdownProps {
  settings: InvoiceSettings;
  onSettingsChange: (settings: Partial<InvoiceSettings>) => void;
}

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD" },
  { value: "dd.MM.yyyy", label: "dd.MM.yyyy" },
];

const INVOICE_SIZES: { value: "A4" | "Letter" | "Legal"; label: string }[] = [
  { value: "A4", label: "A4" },
  { value: "Letter", label: "Letter" },
  { value: "Legal", label: "Legal" },
];

export function InvoiceSettingsDropdown({
  settings,
  onSettingsChange,
}: InvoiceSettingsDropdownProps) {
  const handleDateFormatChange = (format: DateFormat) => {
    onSettingsChange({ dateFormat: format });
  };

  const handleInvoiceSizeChange = (size: "A4" | "Letter" | "Legal") => {
    onSettingsChange({ invoiceSize: size });
  };

  const handleSalesTaxToggle = (enabled: boolean) => {
    onSettingsChange({ 
      salesTaxEnabled: enabled,
      salesTaxPercent: enabled ? settings.salesTaxPercent || 0 : 0,
    });
  };

  const handleVATToggle = (enabled: boolean) => {
    onSettingsChange({ 
      vatEnabled: enabled,
      vatPercent: enabled ? settings.vatPercent || 0 : 0,
    });
  };

  const handleCurrencyChange = (currency: Currency) => {
    onSettingsChange({ currency });
  };

  const handleDiscountToggle = (enabled: boolean) => {
    onSettingsChange({ discountEnabled: enabled });
  };

  const handleQrCodeToggle = (enabled: boolean) => {
    onSettingsChange({ showQrCode: enabled });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="h-8 w-8"
            size="icon"
            variant="ghost"
          >
            <Gear className="size-4" weight="fill" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {/* Date Format */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calendar className="size-4" weight="fill" />
            <span>Date format</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.dateFormat}
              onValueChange={(value) => handleDateFormatChange(value as DateFormat)}
            >
              {DATE_FORMATS.map((format) => (
                <DropdownMenuRadioItem key={format.value} value={format.value}>
                  {format.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Invoice Size */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileText className="size-4" weight="fill" />
            <span>Invoice size</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.invoiceSize}
              onValueChange={(value) =>
                handleInvoiceSizeChange(value as "A4" | "Letter" | "Legal")
              }
            >
              {INVOICE_SIZES.map((size) => (
                <DropdownMenuRadioItem key={size.value} value={size.value}>
                  {size.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Sales Tax */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Receipt className="size-4" weight="fill" />
            <span>Add sales tax</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.salesTaxEnabled ? "yes" : "no"}
              onValueChange={(value) => handleSalesTaxToggle(value === "yes")}
            >
              <DropdownMenuRadioItem value="yes">Yes</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="no">No</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* VAT */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileText className="size-4" weight="fill" />
            <span>Add VAT</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.vatEnabled ? "yes" : "no"}
              onValueChange={(value) => handleVATToggle(value === "yes")}
            >
              <DropdownMenuRadioItem value="yes">Yes</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="no">No</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Currency */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CurrencyDollar className="size-4" weight="fill" />
            <span>Currency</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.currency}
              onValueChange={(value) => handleCurrencyChange(value as Currency)}
            >
              {CURRENCIES.map((curr) => (
                <DropdownMenuRadioItem key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Discount */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Tag className="size-4" weight="fill" />
            <span>Add discount</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.discountEnabled ? "yes" : "no"}
              onValueChange={(value) => handleDiscountToggle(value === "yes")}
            >
              <DropdownMenuRadioItem value="yes">Yes</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="no">No</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* QR Code */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <QrCode className="size-4" weight="fill" />
            <span>Add QR code</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.showQrCode ? "yes" : "no"}
              onValueChange={(value) => handleQrCodeToggle(value === "yes")}
            >
              <DropdownMenuRadioItem value="yes">Yes</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="no">No</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

