"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { ContractTemplate } from "@/lib/contract-utils";

interface ContractTemplatePreviewProps {
  template: Partial<ContractTemplate>;
}

export function ContractTemplatePreview({
  template,
}: ContractTemplatePreviewProps) {
  // Sample data for preview
  const sampleClient = {
    name: "John Doe",
    email: "john@example.com",
  };

  const sampleStartDate = new Date();
  const sampleEndDate = new Date();
  sampleEndDate.setMonth(sampleEndDate.getMonth() + 12);

  // Don't show preview if required fields are missing
  if (!(template.companyName && template.companyEmail)) {
    return (
      <Card className="bg-card">
        <CardContent className="p-8">
          <div className="py-12 text-center text-muted-foreground">
            <p>Fill in the required fields to see a preview</p>
          </div>
        </CardContent>
      </Card>
    );
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
                  alt={template.companyName}
                  className="mb-4 h-12"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  src={template.logoUrl}
                />
              )}
              <h2 className="font-bold text-2xl">{template.companyName}</h2>
              <div className="mt-2 space-y-1 text-muted-foreground text-sm">
                {template.companyAddress && <p>{template.companyAddress}</p>}
                <p>{template.companyEmail}</p>
                {template.companyPhone && <p>{template.companyPhone}</p>}
              </div>
            </div>
            <div className="text-right">
              <h1 className="mb-2 font-bold text-3xl">CONTRACT</h1>
              <p className="text-muted-foreground text-sm">
                Contract #: CNT-2024-001
              </p>
              <p className="text-muted-foreground text-sm">
                Issue Date: {format(new Date(), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Contract Parties */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="mb-2 font-semibold">Client:</h3>
              <p className="font-medium">{sampleClient.name}</p>
            </div>
            <div className="text-right">
              <h3 className="mb-2 font-semibold">Contract Period:</h3>
              <p>Start: {format(sampleStartDate, "MMM dd, yyyy")}</p>
              <p>End: {format(sampleEndDate, "MMM dd, yyyy")}</p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-b pt-4 pb-4">
            <h3 className="mb-4 font-semibold">Terms & Conditions</h3>
            <div className="whitespace-pre-line text-muted-foreground text-sm">
              {template.terms || "No terms specified yet."}
            </div>
          </div>

          {/* Signature Sections */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <h3 className="mb-2 font-semibold">Client Signature</h3>
              <div className="mt-2 border-t border-dashed pt-8">
                <p className="text-muted-foreground text-sm">Signature</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Company Signature</h3>
              <div className="mt-2 border-t border-dashed pt-8">
                <p className="text-muted-foreground text-sm">Signature</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
