"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceTemplateBuilder } from "@/components/invoice-template-builder"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePaymentStore } from "@/lib/store"

export default function EditTemplatePage() {
  const params = useParams()
  const templateId = params.id as string
  const { getInvoiceTemplate } = usePaymentStore()
  const template = getInvoiceTemplate(templateId)

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
        <h1 className="text-xl font-bold">Edit Template</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTemplateBuilder templateId={templateId} />
        </CardContent>
      </Card>
    </div>
  )
}

