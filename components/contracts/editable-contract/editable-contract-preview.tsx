"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { ContractTemplate, ContractSettings, PaymentPlan } from "@/lib/contract-utils";
import type { Client } from "@/lib/payment-utils";
import { calculateContractTotals } from "@/lib/contract-settings";
import { ContractPartiesSection } from "./contract-parties-section";
import { ContractObjectSection, ContractServiceDescriptionSection, ContractIntellectualPropertySection, ContractChangesSection, ContractTerminationSection, ContractConfidentialitySection, ContractForceMajeureSection, ContractClosingStatement } from "./contract-static-sections";
import { ContractPricingSection } from "./contract-pricing-section";
import { ContractTimelineSection } from "./contract-timeline-section";
import { ContractMaintenanceSection } from "./contract-maintenance-section";
import { ContractSignaturesSection } from "./contract-signatures-section";

interface EditableContractPreviewProps {
  clients: Client[];
  selectedClientId?: string;
  template: ContractTemplate;
  startDate?: Date;
  endDate?: Date;
  projectCost?: number;
  paymentMethod?: string;
  projectDuration?: string;
  maintenanceCost?: number;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  companyRepresentatives?: string;
  terms?: string;
  settings?: ContractSettings;
  paymentPlan?: PaymentPlan;
  onClientChange?: (clientId: string | undefined) => void;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  onProjectCostChange?: (value: number | undefined) => void;
  onPaymentMethodChange?: (value: string) => void;
  onProjectDurationChange?: (value: string) => void;
  onMaintenanceCostChange?: (value: number | undefined) => void;
  onClientAddressChange?: (value: string) => void;
  onClientEmailChange?: (value: string) => void;
  onClientPhoneChange?: (value: string) => void;
  onCompanyRepresentativesChange?: (value: string) => void;
  onTermsChange?: (value: string) => void;
  onSettingsChange?: (settings: Partial<ContractSettings>) => void;
  onPaymentPlanChange?: (plan: PaymentPlan) => void;
}

export function EditableContractPreview({
  clients,
  selectedClientId,
  template,
  startDate,
  endDate,
  projectCost,
  paymentMethod,
  projectDuration,
  maintenanceCost,
  clientAddress,
  clientEmail,
  clientPhone,
  companyRepresentatives,
  terms,
  settings,
  paymentPlan,
  onClientChange,
  onStartDateChange,
  onEndDateChange,
  onProjectCostChange,
  onPaymentMethodChange,
  onProjectDurationChange,
  onMaintenanceCostChange,
  onClientAddressChange,
  onClientEmailChange,
  onClientPhoneChange,
  onCompanyRepresentativesChange,
  onTermsChange,
  onSettingsChange,
  onPaymentPlanChange,
}: EditableContractPreviewProps) {
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : undefined;

  const [projectCostInput, setProjectCostInput] = useState<string>("");
  const [maintenanceCostInput, setMaintenanceCostInput] = useState<string>("");
  const [discountInput, setDiscountInput] = useState<string>("");
  const [taxInput, setTaxInput] = useState<string>("");

  const currency = settings?.currency || "USD";

  // Calculate totals
  const { subtotal, discount, tax, total } = calculateContractTotals(
    projectCost || 0,
    settings
  );

  useEffect(() => {
    setProjectCostInput(projectCost?.toString() || "");
  }, [projectCost]);

  useEffect(() => {
    setMaintenanceCostInput(maintenanceCost?.toString() || "");
  }, [maintenanceCost]);

  useEffect(() => {
    if (settings?.discountEnabled && settings.discountValue !== undefined) {
      setDiscountInput(settings.discountValue.toString());
    } else {
      setDiscountInput("");
    }
  }, [settings?.discountEnabled, settings?.discountValue]);

  useEffect(() => {
    if (settings?.taxEnabled && settings.taxPercent !== undefined) {
      setTaxInput(settings.taxPercent.toString());
    } else {
      setTaxInput("");
    }
  }, [settings?.taxEnabled, settings?.taxPercent]);

  const handleProjectCostBlur = () => {
    const value = projectCostInput.replace(/,/g, "");
    const numValue = value ? Number.parseFloat(value) : undefined;
    onProjectCostChange?.(numValue);
  };

  const handleMaintenanceCostBlur = () => {
    const value = maintenanceCostInput.replace(/,/g, "");
    const numValue = value ? Number.parseFloat(value) : undefined;
    onMaintenanceCostChange?.(numValue);
  };

  const handleDiscountBlur = () => {
    const value = discountInput.replace(/,/g, "");
    const numValue = value ? Number.parseFloat(value) : undefined;
    if (numValue !== undefined && numValue >= 0) {
      onSettingsChange?.({ discountValue: numValue });
    }
  };

  const handleTaxBlur = () => {
    const value = taxInput.replace(/,/g, "");
    const numValue = value ? Number.parseFloat(value) : undefined;
    if (numValue !== undefined && numValue >= 0) {
      onSettingsChange?.({ taxPercent: numValue });
    }
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
        // Handle logo upload if needed
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="bg-card text-foreground">
      <CardContent className="p-8">
        <div className="space-y-6 text-sm leading-relaxed">
          {/* Title */}
          <h1 className="text-center text-xl font-bold uppercase mb-8">
            KONTRATË BASHKËPUNIMI PËR ZHVILLIM WEBSITE
          </h1>

          <ContractPartiesSection
            clients={clients}
            companyRepresentatives={companyRepresentatives}
            selectedClientId={selectedClientId}
            template={template}
            clientAddress={clientAddress}
            clientEmail={clientEmail}
            clientPhone={clientPhone}
            onClientChange={onClientChange}
            onCompanyRepresentativesChange={onCompanyRepresentativesChange}
            onClientAddressChange={onClientAddressChange}
            onClientEmailChange={onClientEmailChange}
            onClientPhoneChange={onClientPhoneChange}
          />

          <ContractObjectSection />

          <ContractServiceDescriptionSection />

          <ContractPricingSection
            discount={discount}
            discountInput={discountInput}
            onDiscountBlur={handleDiscountBlur}
            onDiscountInputChange={setDiscountInput}
            onPaymentMethodChange={onPaymentMethodChange}
            onPaymentPlanChange={onPaymentPlanChange}
            onProjectCostBlur={handleProjectCostBlur}
            onProjectCostInputChange={setProjectCostInput}
            onSettingsChange={onSettingsChange}
            onTaxBlur={handleTaxBlur}
            onTaxInputChange={setTaxInput}
            paymentMethod={paymentMethod}
            paymentPlan={paymentPlan}
            projectCost={projectCost}
            projectCostInput={projectCostInput}
            settings={settings}
            tax={tax}
            taxInput={taxInput}
            total={total}
          />

          <ContractTimelineSection
            dateFormat={settings?.dateFormat}
            onProjectDurationChange={onProjectDurationChange}
            onStartDateChange={onStartDateChange}
            projectDuration={projectDuration}
            startDate={startDate}
          />

          <ContractMaintenanceSection
            currency={currency}
            maintenanceCostInput={maintenanceCostInput}
            onMaintenanceCostBlur={handleMaintenanceCostBlur}
            onMaintenanceCostInputChange={setMaintenanceCostInput}
          />

          <ContractIntellectualPropertySection />

          <ContractChangesSection />

          <ContractTerminationSection />

          <ContractConfidentialitySection />

          <ContractForceMajeureSection />

          <ContractClosingStatement />

          <ContractSignaturesSection
            dateFormat={settings?.dateFormat}
            onStartDateChange={onStartDateChange}
            selectedClient={selectedClient}
            startDate={startDate}
          />
        </div>
      </CardContent>
      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />
    </Card>
  );
}
