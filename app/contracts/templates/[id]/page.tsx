"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ContractTemplateBuilder } from "@/components/contracts/contract-template-builder";
import { ContractTemplatePreview } from "@/components/contracts/contract-template-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { ContractTemplate } from "@/lib/contract-utils";
import { usePaymentStore } from "@/lib/store";

export default function EditTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;
  const { getContractTemplate } = usePaymentStore();
  const template = getContractTemplate(templateId);
  const [previewTemplate, setPreviewTemplate] = useState<
    Partial<ContractTemplate>
  >(
    template
      ? {
          name: template.name,
          companyName: template.companyName,
          companyAddress: template.companyAddress,
          companyEmail: template.companyEmail,
          companyPhone: template.companyPhone,
          logoUrl: template.logoUrl,
          terms: template.terms,
        }
      : {}
  );

  useEffect(() => {
    if (template) {
      setPreviewTemplate({
        name: template.name,
        companyName: template.companyName,
        companyAddress: template.companyAddress,
        companyEmail: template.companyEmail,
        companyPhone: template.companyPhone,
        logoUrl: template.logoUrl,
        terms: template.terms,
      });
    }
  }, [template]);

  if (!template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Template Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The template you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold">Edit Template</h1>
      </div>
      <div className="-mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractTemplateBuilder
              onChange={setPreviewTemplate}
              templateId={templateId}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractTemplatePreview template={previewTemplate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
