"use client"

import type { ContractTemplate } from "@/lib/contract-utils"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

interface ContractTemplatePreviewProps {
  template: Partial<ContractTemplate>
}

export function ContractTemplatePreview({ template }: ContractTemplatePreviewProps) {
  // Sample data for preview
  const sampleClient = {
    name: "John Doe",
    email: "john@example.com",
  }

  const sampleStartDate = new Date()
  const sampleEndDate = new Date()
  sampleEndDate.setMonth(sampleEndDate.getMonth() + 12)

  // Don't show preview if required fields are missing
  if (!template.companyName || !template.companyEmail) {
    return (
      <Card className="bg-card">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground py-12">
            <p>Fill in the required fields to see a preview</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              {template.logoUrl && (
                <img
                  src={template.logoUrl}
                  alt={template.companyName}
                  className="h-12 mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
              <h2 className="text-2xl font-bold">{template.companyName}</h2>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                {template.companyAddress && (
                  <p>{template.companyAddress}</p>
                )}
                <p>{template.companyEmail}</p>
                {template.companyPhone && (
                  <p>{template.companyPhone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold mb-2">CONTRACT</h1>
              <p className="text-sm text-muted-foreground">
                Contract #: CNT-2024-001
              </p>
              <p className="text-sm text-muted-foreground">
                Issue Date: {format(new Date(), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Contract Parties */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Client:</h3>
              <p className="font-medium">{sampleClient.name}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Contract Period:</h3>
              <p>Start: {format(sampleStartDate, "MMM dd, yyyy")}</p>
              <p>End: {format(sampleEndDate, "MMM dd, yyyy")}</p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-b pt-4 pb-4">
            <h3 className="font-semibold mb-4">Terms & Conditions</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {template.terms || "No terms specified yet."}
            </div>
          </div>

          {/* Signature Sections */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <h3 className="font-semibold mb-2">Client Signature</h3>
              <div className="border-t border-dashed pt-8 mt-2">
                <p className="text-sm text-muted-foreground">Signature</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Company Signature</h3>
              <div className="border-t border-dashed pt-8 mt-2">
                <p className="text-sm text-muted-foreground">Signature</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

