"use client";

import { InlineDatePicker } from "./inline-date-picker";
import { InlineEditableField } from "./inline-editable-field";
import { ContractSection } from "./contract-section";
import type { DateFormat } from "@/lib/settings-store";

interface ContractTimelineSectionProps {
  startDate?: Date;
  projectDuration?: string;
  onStartDateChange?: (date: Date | undefined) => void;
  onProjectDurationChange?: (value: string) => void;
  dateFormat?: DateFormat;
}

export function ContractTimelineSection({
  startDate,
  projectDuration,
  onStartDateChange,
  onProjectDurationChange,
  dateFormat,
}: ContractTimelineSectionProps) {
  return (
    <ContractSection title="6. Afatet kohore">
      <div className="space-y-2">
        <p>
          - Data e Fillimit të Punës do të jetë më{" "}
          <InlineDatePicker
            date={startDate}
            dateFormat={dateFormat}
            onSelect={onStartDateChange}
            placeholder="___ / ___ / 2025"
          />
          , pas kryerjes së parapagimit prej 30% të pagës totale të website-it nga ana e Klientit.
        </p>
        <p>
          - Zhvilluesi angazhohet ta përfundojë projektin brenda{" "}
          <InlineEditableField
            className="w-48"
            onChange={(value) => onProjectDurationChange?.(value)}
            placeholder="duration"
            value={projectDuration || ""}
          />{" "}
          nga Data e Fillimit të Punës.
        </p>
        <p>- Në rast vonese të pagesës së parapagimit ose të materialeve nga Klienti, afati i dorëzimit do të shtyhet në mënyrë proporcionale.</p>
      </div>
    </ContractSection>
  );
}

