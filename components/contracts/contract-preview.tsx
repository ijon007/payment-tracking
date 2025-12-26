"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { Contract, ContractTemplate } from "@/lib/contract-utils";
import type { Client } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";

interface ContractPreviewProps {
  contractId?: string;
  template?: ContractTemplate;
  client?: Client;
  startDate?: Date;
  endDate?: Date;
  terms?: string;
}

export function ContractPreview({
  contractId,
  template,
  client,
  startDate,
  endDate,
  terms,
}: ContractPreviewProps) {
  const { getContract, getContractTemplate, getClient } = usePaymentStore();

  let contract: Contract | null = null;
  let contractTemplate: ContractTemplate | null = null;
  let contractClient: Client | null = null;
  let contractStartDate: Date | null = null;
  let contractEndDate: Date | null = null;
  let contractTerms = "";

  if (contractId) {
    contract = getContract(contractId) || null;
    if (contract) {
      contractTemplate = getContractTemplate(contract.templateId) || null;
      contractClient = getClient(contract.clientId) || null;
      contractStartDate = contract.startDate;
      contractEndDate = contract.endDate;
      contractTerms = contract.terms;
    }
  } else if (template && client && startDate && endDate && terms) {
    contractTemplate = template;
    contractClient = client;
    contractStartDate = startDate;
    contractEndDate = endDate;
    contractTerms = terms;
  }

  if (!(contractTemplate && contractClient)) {
    return null;
  }

  return (
    <Card className="bg-white text-black">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              {contractTemplate.logoUrl && (
                <img
                  alt={contractTemplate.companyName}
                  className="mb-4 h-12"
                  src={contractTemplate.logoUrl}
                />
              )}
              <h2 className="font-bold text-2xl">
                {contractTemplate.companyName}
              </h2>
              <div className="mt-2 space-y-1 text-muted-foreground text-sm">
                {contractTemplate.companyAddress && (
                  <p>{contractTemplate.companyAddress}</p>
                )}
                <p>{contractTemplate.companyEmail}</p>
                {contractTemplate.companyPhone && (
                  <p>{contractTemplate.companyPhone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h1 className="mb-2 font-bold text-3xl">CONTRACT</h1>
              {contract && (
                <p className="text-muted-foreground text-sm">
                  Contract #: {contract.contractNumber}
                </p>
              )}
              {contract && (
                <p className="text-muted-foreground text-sm">
                  Issue Date: {format(contract.issueDate, "MMM dd, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Contract Parties */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="mb-2 font-semibold">Client:</h3>
              <p className="font-medium">{contractClient.name}</p>
            </div>
            <div className="text-right">
              <h3 className="mb-2 font-semibold">Contract Period:</h3>
              {contractStartDate && (
                <p>Start: {format(contractStartDate, "MMM dd, yyyy")}</p>
              )}
              {contractEndDate && (
                <p>End: {format(contractEndDate, "MMM dd, yyyy")}</p>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-b pt-4 pb-4">
            <h3 className="mb-4 font-semibold">Terms & Conditions</h3>
            <div className="whitespace-pre-line text-muted-foreground text-sm">
              {contractTerms || contractTemplate.terms}
            </div>
          </div>

          {/* Signature Sections */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <h3 className="mb-2 font-semibold">Client Signature</h3>
              <div className="mt-2 border-t border-dashed pt-8">
                {contract?.clientSignature ? (
                  <p className="text-sm">{contract.clientSignature}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">Signature</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Company Signature</h3>
              <div className="mt-2 border-t border-dashed pt-8">
                {contract?.companySignature ? (
                  <p className="text-sm">{contract.companySignature}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">Signature</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
