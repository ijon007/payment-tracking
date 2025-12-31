"use client";

import { useEffect, useState } from "react";
import { EditableContractPreview } from "@/components/contracts/editable-contract-preview";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePaymentStore } from "@/lib/store";

interface ContractSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  onContractCreated?: (contractId: string) => void;
}

export function ContractSheet({
  open,
  onOpenChange,
  clientId,
  onContractCreated,
}: ContractSheetProps) {
  const { clients, userContractTemplate, generateContract } = usePaymentStore();

  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(clientId);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [projectCost, setProjectCost] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [projectDuration, setProjectDuration] = useState<string>("");
  const [maintenanceCost, setMaintenanceCost] = useState<number | undefined>(undefined);
  const [clientAddress, setClientAddress] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [companyRepresentatives, setCompanyRepresentatives] = useState<string>(
    "Johan Gjinko dhe Ijon Kushta"
  );
  const [terms, setTerms] = useState<string>("");

  useEffect(() => {
    if (clientId) {
      setSelectedClientId(clientId);
    }
  }, [clientId]);

  useEffect(() => {
    if (!startDate) {
      setStartDate(new Date());
    }
  }, [startDate]);

  useEffect(() => {
    if (!endDate && startDate) {
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
      setEndDate(defaultEndDate);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (userContractTemplate) {
      setTerms(userContractTemplate.terms);
    }
  }, [userContractTemplate]);

  const handleCreateContract = () => {
    if (!(selectedClientId && startDate && endDate && userContractTemplate)) {
      return;
    }

    // Calculate project duration in days
    const durationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const durationText =
      durationDays < 30
        ? `${durationDays} ditë`
        : durationDays < 365
          ? `${Math.round(durationDays / 30)} muaj`
          : `${Math.round(durationDays / 365)} vite`;

    const contract = generateContract({
      clientId: selectedClientId,
      startDate,
      endDate,
      terms: terms || userContractTemplate.terms,
      projectCost,
      paymentMethod: paymentMethod || undefined,
      projectDuration: projectDuration || durationText,
      maintenanceCost,
      clientAddress: clientAddress || undefined,
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
      companyRepresentatives: companyRepresentatives || undefined,
    });

    handleClose();
    onContractCreated?.(contract.id);
  };

  const handleClose = () => {
    setSelectedClientId(clientId);
    setStartDate(undefined);
    setEndDate(undefined);
    setProjectCost(undefined);
    setPaymentMethod("");
    setProjectDuration("");
    setMaintenanceCost(undefined);
    setClientAddress("");
    setClientEmail("");
    setClientPhone("");
    setCompanyRepresentatives("Johan Gjinko dhe Ijon Kushta");
    setTerms(userContractTemplate?.terms || "");
    onOpenChange(false);
  };

  const canCreate = !!(
    selectedClientId &&
    startDate &&
    endDate &&
    userContractTemplate
  );

  return (
    <Sheet onOpenChange={handleClose} open={open}>
      <SheetContent
        className="right-0! top-0! bottom-0! h-screen! w-full overflow-y-auto rounded-none shadow-2xl sm:right-4! sm:top-4! sm:bottom-4! sm:h-[calc(100vh-2rem)]! sm:rounded sm:max-w-4xl p-0"
        side="right"
        showCloseButton={false}
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Create Contract</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {!userContractTemplate ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Please upload a contract template first.
                </p>
              </div>
            ) : (
              <EditableContractPreview
                clients={clients}
                selectedClientId={selectedClientId}
                template={userContractTemplate}
                startDate={startDate}
                endDate={endDate}
                projectCost={projectCost}
                paymentMethod={paymentMethod}
                projectDuration={projectDuration}
                maintenanceCost={maintenanceCost}
                clientAddress={clientAddress}
                clientEmail={clientEmail}
                clientPhone={clientPhone}
                companyRepresentatives={companyRepresentatives}
                terms={terms}
                onClientChange={setSelectedClientId}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onProjectCostChange={setProjectCost}
                onPaymentMethodChange={setPaymentMethod}
                onProjectDurationChange={setProjectDuration}
                onMaintenanceCostChange={setMaintenanceCost}
                onClientAddressChange={setClientAddress}
                onClientEmailChange={setClientEmail}
                onClientPhoneChange={setClientPhone}
                onCompanyRepresentativesChange={setCompanyRepresentatives}
                onTermsChange={setTerms}
              />
            )}
          </div>

          <div className="border-t p-3 sm:p-6">
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <Button onClick={handleClose} variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                disabled={!canCreate}
                onClick={handleCreateContract}
                className="w-full sm:w-auto"
              >
                Create Contract
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
