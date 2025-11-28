"use client"

import { usePaymentStore } from "@/lib/store"
import type { ContractTemplate, Contract } from "@/lib/contract-utils"
import type { Client } from "@/lib/payment-utils"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"

interface ContractPreviewProps {
  contractId?: string
  template?: ContractTemplate
  client?: Client
  startDate?: Date
  endDate?: Date
  terms?: string
}

export function ContractPreview({
  contractId,
  template,
  client,
  startDate,
  endDate,
  terms,
}: ContractPreviewProps) {
  const { getContract, getContractTemplate, getClient } = usePaymentStore()

  let contract: Contract | null = null
  let contractTemplate: ContractTemplate | null = null
  let contractClient: Client | null = null
  let contractStartDate: Date | null = null
  let contractEndDate: Date | null = null
  let contractTerms: string = ""

  if (contractId) {
    contract = getContract(contractId) || null
    if (contract) {
      contractTemplate = getContractTemplate(contract.templateId) || null
      contractClient = getClient(contract.clientId) || null
      contractStartDate = contract.startDate
      contractEndDate = contract.endDate
      contractTerms = contract.terms
    }
  } else if (template && client && startDate && endDate && terms) {
    contractTemplate = template
    contractClient = client
    contractStartDate = startDate
    contractEndDate = endDate
    contractTerms = terms
  }

  if (!contractTemplate || !contractClient) {
    return null
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
                  src={contractTemplate.logoUrl}
                  alt={contractTemplate.companyName}
                  className="h-12 mb-4"
                />
              )}
              <h2 className="text-2xl font-bold">{contractTemplate.companyName}</h2>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
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
              <h1 className="text-3xl font-bold mb-2">CONTRACT</h1>
              {contract && (
                <p className="text-sm text-muted-foreground">
                  Contract #: {contract.contractNumber}
                </p>
              )}
              {contract && (
                <p className="text-sm text-muted-foreground">
                  Issue Date: {format(contract.issueDate, "MMM dd, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Contract Parties */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Client:</h3>
              <p className="font-medium">{contractClient.name}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Contract Period:</h3>
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
            <h3 className="font-semibold mb-4">Terms & Conditions</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {contractTerms || contractTemplate.terms}
            </div>
          </div>

          {/* Signature Sections */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <h3 className="font-semibold mb-2">Client Signature</h3>
              <div className="border-t border-dashed pt-8 mt-2">
                {contract?.clientSignature ? (
                  <p className="text-sm">{contract.clientSignature}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Signature</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Company Signature</h3>
              <div className="border-t border-dashed pt-8 mt-2">
                {contract?.companySignature ? (
                  <p className="text-sm">{contract.companySignature}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Signature</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

