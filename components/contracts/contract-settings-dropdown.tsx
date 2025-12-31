"use client";

import {
  Calendar,
  CurrencyDollar,
  FileText,
  Gear,
  Receipt,
  Tag,
  CreditCard,
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
import type { ContractSettings, PaymentStructure } from "@/lib/contract-utils";

interface ContractSettingsDropdownProps {
  settings: ContractSettings;
  onSettingsChange: (settings: Partial<ContractSettings>) => void;
}

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD" },
  { value: "dd.MM.yyyy", label: "dd.MM.yyyy" },
];

const CONTRACT_SIZES: { value: "A4" | "Letter" | "Legal"; label: string }[] = [
  { value: "A4", label: "A4" },
  { value: "Letter", label: "Letter" },
  { value: "Legal", label: "Legal" },
];

const PAYMENT_STRUCTURES: { value: PaymentStructure; label: string }[] = [
  { value: "simple", label: "Simple (30%/70%)" },
  { value: "installments", label: "Installments" },
  { value: "milestones", label: "Milestones" },
  { value: "custom", label: "Custom" },
];

export function ContractSettingsDropdown({
  settings,
  onSettingsChange,
}: ContractSettingsDropdownProps) {
  const handleDateFormatChange = (format: DateFormat) => {
    onSettingsChange({ dateFormat: format });
  };

  const handleContractSizeChange = (size: "A4" | "Letter" | "Legal") => {
    onSettingsChange({ contractSize: size });
  };

  const handleCurrencyChange = (currency: Currency) => {
    onSettingsChange({ currency });
  };

  const handlePaymentStructureChange = (structure: PaymentStructure) => {
    onSettingsChange({ paymentStructure: structure });
  };

  const handleDiscountToggle = (enabled: boolean) => {
    onSettingsChange({ 
      discountEnabled: enabled,
      discountValue: enabled ? settings.discountValue || 0 : undefined,
    });
  };

  const handleTaxToggle = (enabled: boolean) => {
    onSettingsChange({ 
      taxEnabled: enabled,
      taxPercent: enabled ? settings.taxPercent || 0 : undefined,
    });
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
        {/* Currency - REQUIRED */}
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

        {/* Payment Structure */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CreditCard className="size-4" weight="fill" />
            <span>Payment structure</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.paymentStructure}
              onValueChange={(value) => handlePaymentStructureChange(value as PaymentStructure)}
            >
              {PAYMENT_STRUCTURES.map((structure) => (
                <DropdownMenuRadioItem key={structure.value} value={structure.value}>
                  {structure.label}
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

        {/* Tax */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Receipt className="size-4" weight="fill" />
            <span>Add tax</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.taxEnabled ? "yes" : "no"}
              onValueChange={(value) => handleTaxToggle(value === "yes")}
            >
              <DropdownMenuRadioItem value="yes">Yes</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="no">No</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

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

        {/* Contract Size */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileText className="size-4" weight="fill" />
            <span>Contract size</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.contractSize}
              onValueChange={(value) =>
                handleContractSizeChange(value as "A4" | "Letter" | "Legal")
              }
            >
              {CONTRACT_SIZES.map((size) => (
                <DropdownMenuRadioItem key={size.value} value={size.value}>
                  {size.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

