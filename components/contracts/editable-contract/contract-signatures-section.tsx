"use client";

import { InlineDatePicker } from "./inline-date-picker";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/payment-utils";
import type { DateFormat } from "@/lib/settings-store";

interface ContractSignaturesSectionProps {
  startDate?: Date;
  selectedClient?: Client;
  onStartDateChange?: (date: Date | undefined) => void;
  dateFormat?: DateFormat;
}

export function ContractSignaturesSection({
  startDate,
  selectedClient,
  onStartDateChange,
  dateFormat,
}: ContractSignaturesSectionProps) {
  return (
    <div className="mt-12 grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <p>
            Data{" "}
            <InlineDatePicker
              date={startDate}
              dateFormat={dateFormat}
              onSelect={onStartDateChange}
            />
          </p>
          <p className="mt-8 font-bold">Core Point</p>
          <p>Johan GJINKO</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p>
            Data{" "}
            <InlineDatePicker
              date={startDate}
              dateFormat={dateFormat}
              onSelect={onStartDateChange}
            />
          </p>
          <p className="mt-8 font-bold">Klienti</p>
          <p className={cn(
            "border-b pb-1",
            selectedClient?.name
              ? "border-foreground"
              : "border-dashed border-muted text-muted-foreground"
          )}>
            {selectedClient?.name || "Emri Klientit"}
          </p>
          <p className={cn(
            "mt-2 border-b pb-1",
            (selectedClient as any)?.companyName
              ? "border-foreground"
              : "border-dashed border-muted text-muted-foreground"
          )}>
            {(selectedClient as any)?.companyName || "Firma"}
          </p>
          <p className="mt-8">Ijon KUSHTA</p>
          <p className="mt-4 border-b border-foreground pb-1 w-24"></p>
        </div>
      </div>
    </div>
  );
}

