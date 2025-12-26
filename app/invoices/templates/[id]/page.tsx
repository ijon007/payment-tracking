"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InvoiceTemplateBuilder } from "@/components/invoice/invoice-template-builder";
import { TemplatePreview } from "@/components/invoice/template-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { InvoiceTemplate } from "@/lib/invoice-utils";
import { usePaymentStore } from "@/lib/store";

export default function EditTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;
  const { getInvoiceTemplate } = usePaymentStore();
  const template = getInvoiceTemplate(templateId);
  const [previewTemplate, setPreviewTemplate] = useState<
    Partial<InvoiceTemplate>
  >(
    template
      ? {
          name: template.name,
          companyName: template.companyName,
          companyAddress: template.companyAddress,
          companyEmail: template.companyEmail,
          companyPhone: template.companyPhone,
          logoUrl: template.logoUrl,
          notes: template.notes,
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
        notes: template.notes,
      });
    }
  }, [template]);

  if (!template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-bold text-xl">Template Not Found</h1>
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
            <InvoiceTemplateBuilder
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
            <TemplatePreview template={previewTemplate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
