"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { InlineEditableField } from "./inline-editable-field";
import { ContractSection } from "./contract-section";
import { ContractPaymentPlanSection } from "./contract-payment-plan-section";
import { formatCurrencyDisplay, getCurrencyDisplayName } from "./contract-utils";
import { formatCurrency } from "@/lib/currency-utils";
import type { ContractSettings, PaymentPlan } from "@/lib/contract-utils";
import type { Currency } from "@/lib/currency-utils";

interface ContractPricingSectionProps {
  projectCost?: number;
  projectCostInput: string;
  onProjectCostChange?: (value: number | undefined) => void;
  onProjectCostInputChange: (value: string) => void;
  onProjectCostBlur: () => void;
  paymentMethod?: string;
  onPaymentMethodChange?: (value: string) => void;
  settings?: ContractSettings;
  paymentPlan?: PaymentPlan;
  discountInput: string;
  taxInput: string;
  discount: number;
  tax: number;
  total: number;
  onDiscountInputChange: (value: string) => void;
  onTaxInputChange: (value: string) => void;
  onDiscountBlur: () => void;
  onTaxBlur: () => void;
  onSettingsChange?: (settings: Partial<ContractSettings>) => void;
  onPaymentPlanChange?: (plan: PaymentPlan) => void;
}

export function ContractPricingSection({
  projectCost,
  projectCostInput,
  onProjectCostChange,
  onProjectCostInputChange,
  onProjectCostBlur,
  paymentMethod,
  onPaymentMethodChange,
  settings,
  paymentPlan,
  discountInput,
  taxInput,
  discount,
  tax,
  total,
  onDiscountInputChange,
  onTaxInputChange,
  onDiscountBlur,
  onTaxBlur,
  onSettingsChange,
  onPaymentPlanChange,
}: ContractPricingSectionProps) {
  const currency = settings?.currency || "USD";

  return (
    <ContractSection title="5. Çmimi dhe mënyra e pagesës">
      <div className="space-y-2">
        <p>
          - {(settings?.discountEnabled || settings?.taxEnabled) ? "Nëntotali" : "Totali"} i kostos së projektit është{" "}
          <InlineEditableField
            className="w-32 font-medium"
            onBlur={onProjectCostBlur}
            onChange={onProjectCostInputChange}
            placeholder="amount"
            type="text"
            value={projectCostInput}
          />{" "}
          {currency === "ALL" ? "lekë" : getCurrencyDisplayName(currency)}.
        </p>

        {settings?.discountEnabled && (
          <p>
            - U aplikua zbritje prej{" "}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    className="inline h-auto border-b border-dashed border-foreground bg-transparent p-0 font-normal text-foreground hover:bg-transparent hover:text-foreground"
                    variant="ghost"
                  >
                    {settings.discountType === "percentage" ? "%" : currency === "ALL" ? "lekë" : getCurrencyDisplayName(currency)}
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() =>
                    onSettingsChange?.({ discountType: "percentage" })
                  }
                >
                  Përqindje (%)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onSettingsChange?.({ discountType: "fixed" })
                  }
                >
                  Shumë fikse ({currency === "ALL" ? "lekë" : getCurrencyDisplayName(currency)})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>{" "}
            <InlineEditableField
              className="w-24"
              onBlur={onDiscountBlur}
              onChange={onDiscountInputChange}
              placeholder="0"
              type="text"
              value={discountInput}
            />
            {discount > 0 && (
              <>
                {" "}
                (në shumë: {formatCurrencyDisplay(discount, currency)}).
              </>
            )}
          </p>
        )}

        {settings?.taxEnabled && (
          <p>
            - U aplikua {settings.taxType === "vat" ? "TVSH" : "tatimi mbi shitjet"} prej{" "}
            <InlineEditableField
              className="w-20"
              onBlur={onTaxBlur}
              onChange={onTaxInputChange}
              placeholder="0"
              type="text"
              value={taxInput}
            />
            %{tax > 0 && (
              <>
                {" "}
                (në shumë: {formatCurrencyDisplay(tax, currency)}).
              </>
            )}
          </p>
        )}

        {(settings?.discountEnabled || settings?.taxEnabled) && (
          <p>
            - Totali i përgjithshëm i kontratës është{" "}
            <span className="font-semibold">{formatCurrencyDisplay(total, currency)}</span>.
          </p>
        )}

        <ContractPaymentPlanSection
          currency={currency}
          paymentPlan={paymentPlan}
          projectCost={projectCost}
          settings={settings}
          onPaymentPlanChange={onPaymentPlanChange}
        />
        <p>
          - Pagesat do të kryhen nëpërmjet{" "}
          <InlineEditableField
            className="w-48"
            onChange={(value) => onPaymentMethodChange?.(value)}
            placeholder="payment method"
            value={paymentMethod || ""}
          />
          .
        </p>
      </div>
    </ContractSection>
  );
}

