"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { InlineEditableField } from "./inline-editable-field";
import { ContractSection } from "./contract-section";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/payment-utils";
import type { ContractTemplate } from "@/lib/contract-utils";

interface ContractPartiesSectionProps {
  template: ContractTemplate;
  clients: Client[];
  selectedClientId?: string;
  companyRepresentatives?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  onClientChange?: (clientId: string | undefined) => void;
  onCompanyRepresentativesChange?: (value: string) => void;
  onClientAddressChange?: (value: string) => void;
  onClientEmailChange?: (value: string) => void;
  onClientPhoneChange?: (value: string) => void;
}

export function ContractPartiesSection({
  template,
  clients,
  selectedClientId,
  companyRepresentatives,
  clientAddress,
  clientEmail,
  clientPhone,
  onClientChange,
  onCompanyRepresentativesChange,
  onClientAddressChange,
  onClientEmailChange,
  onClientPhoneChange,
}: ContractPartiesSectionProps) {
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : undefined;

  return (
    <ContractSection title="1. Palët e kontratës">
      <div className="space-y-2">
        <p>
          - <strong>Core Point</strong> – Agjenci për zhvillim website-esh, përfaqësuar nga{" "}
          <InlineEditableField
            className="w-64"
            onChange={(value) => onCompanyRepresentativesChange?.(value)}
            placeholder="Company representatives"
            value={companyRepresentatives || ""}
          />
          , në vijim do të quhet "Zhvilluesi".
        </p>
        <div className="ml-4 space-y-1">
          <p className="font-semibold">Të dhënat e kontaktit të Zhvilluesit:</p>
          <p>Email: {template.companyEmail || "dev.corepoint@gmail.com"}</p>
          <p>Telefon: {template.companyPhone || "+355 69 267 5398"}</p>
        </div>
        <p>
          -{" "}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className={cn(
                    "inline-block h-auto border-b bg-transparent px-1 py-0.5 text-center focus-visible:ring-0 transition-colors hover:bg-transparent focus-visible:border-foreground",
                    selectedClient?.name
                      ? "border-solid border-foreground/50 text-foreground hover:text-foreground"
                      : "border-dashed border-muted text-muted-foreground hover:text-muted-foreground"
                  )}
                  variant="ghost"
                >
                  {selectedClient?.name || "Select client"}
                </Button>
              }
            />
            <DropdownMenuContent align="start">
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
          , me adresë në{" "}
          <InlineEditableField
            className="w-48"
            onChange={(value) => onClientAddressChange?.(value)}
            placeholder="address"
            value={clientAddress || ""}
          />
          , në vijim do të quhet "Klienti".
        </p>
        <div className="ml-4 space-y-1">
          <p className="font-semibold">Të dhënat e kontaktit të Klientit:</p>
          <p>
            Email:{" "}
            <InlineEditableField
              className="w-48"
              onChange={(value) => onClientEmailChange?.(value)}
              placeholder="email address"
              value={clientEmail || ""}
            />
          </p>
          <p>
            Telefon:{" "}
            <InlineEditableField
              className="w-48"
              onChange={(value) => onClientPhoneChange?.(value)}
              placeholder="phone number"
              value={clientPhone || ""}
            />
          </p>
        </div>
      </div>
    </ContractSection>
  );
}

