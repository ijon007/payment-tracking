"use client";

import { InlineEditableField } from "./inline-editable-field";
import { ContractSection } from "./contract-section";
import { getCurrencyDisplayName } from "./contract-utils";
import type { Currency } from "@/lib/currency-utils";

interface ContractMaintenanceSectionProps {
  maintenanceCostInput: string;
  currency: Currency;
  onMaintenanceCostInputChange: (value: string) => void;
  onMaintenanceCostBlur: () => void;
}

export function ContractMaintenanceSection({
  maintenanceCostInput,
  currency,
  onMaintenanceCostInputChange,
  onMaintenanceCostBlur,
}: ContractMaintenanceSectionProps) {
  return (
    <ContractSection title="7. Mirëmbajtja dhe Hosting">
      <div className="space-y-2">
        <p>- Pas dorëzimit të website-it, Klienti vazhdon me sherbimet e mirëmbajtjes dhe hostingut nga Zhvilluesi.</p>
        <p>- Kostot mujore për këto shërbime janë:</p>
        <p>
          - Kostoja e mirëmbajtjes:{" "}
          <InlineEditableField
            className="w-32"
            onBlur={onMaintenanceCostBlur}
            onChange={onMaintenanceCostInputChange}
            placeholder="amount"
            type="text"
            value={maintenanceCostInput}
          />{" "}
          {currency === "ALL" ? "lekë" : getCurrencyDisplayName(currency)}/muaj
        </p>
        <p className="text-xs italic">(Përfshin hosting, përditësime sigurie, ndihmë teknike, përmirësime të faqes etj.)</p>
      </div>
    </ContractSection>
  );
}

