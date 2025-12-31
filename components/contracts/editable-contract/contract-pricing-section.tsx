"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { InlineEditableField } from "./inline-editable-field";
import { ContractSection } from "./contract-section";
import { ContractPaymentPlanSection } from "./contract-payment-plan-section";
import { formatCurrencyDisplay, getCurrencyDisplayName } from "./contract-utils";
import type { ContractSettings, PaymentPlan } from "@/lib/contract-utils";
import { cn } from "@/lib/utils";

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
          - {settings?.discountEnabled ? "Nëntotali" : "Totali"} i kostos së projektit është{" "}
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
            - U aplikua zbritje prej:{" "}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    className="inline border-b border-foreground/20 font-normal text-foreground hover:bg-transparent hover:text-foreground focus-visible:border-foreground"
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

        {settings?.discountEnabled && (
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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className={cn(
                    "inline border-b font-normal text-foreground hover:bg-transparent hover:text-foreground focus-visible:border-foreground",
                    paymentMethod
                      ? "border-solid border-foreground/50"
                      : "border-dashed border-muted text-muted-foreground"
                  )}
                  variant="ghost"
                >
                  {paymentMethod || "Payment method"}
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-fit">
              <DropdownMenuItem
                onClick={() => onPaymentMethodChange?.("Cash")}
              >
                Cash
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onPaymentMethodChange?.("Bank Transfer")}
              >
                Bank transfer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onPaymentMethodChange?.("online payment processor")}
              >
                Online payment processor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          .
        </p>
      </div>
    </ContractSection>
  );
}

