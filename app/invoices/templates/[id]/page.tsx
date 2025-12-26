"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceTemplateBuilder } from "@/components/invoice/invoice-template-builder"
import { TemplatePreview } from "@/components/invoice/template-preview"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePaymentStore } from "@/lib/store"
import type { InvoiceTemplate } from "@/lib/invoice-utils"

export default function EditTemplatePage() {
  const params = useParams()
  const templateId = params.id as string
  const { getInvoiceTemplate } = usePaymentStore()
  const template = getInvoiceTemplate(templateId)
  const [previewTemplate, setPreviewTemplate] = useState<Partial<InvoiceTemplate>>(
    template ? {
      name: template.name,
      companyName: template.companyName,
      companyAddress: template.companyAddress,
      companyEmail: template.companyEmail,
      companyPhone: template.companyPhone,
      logoUrl: template.logoUrl,
      notes: template.notes,
    } : {}
  )

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
      })
    }
  }, [template])

  if (!template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Template Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The template you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold">Edit Template</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 -mt-2"> 
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceTemplateBuilder
              templateId={templateId}
              onChange={setPreviewTemplate}
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
  )
}

