"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceTemplateBuilder } from "@/components/invoice-template-builder"
import { TemplatePreview } from "@/components/template-preview"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { InvoiceTemplate } from "@/lib/invoice-utils"

export default function NewTemplatePage() {
  const [previewTemplate, setPreviewTemplate] = useState<Partial<InvoiceTemplate>>({})

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-xl font-bold">New Invoice Template</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceTemplateBuilder onChange={setPreviewTemplate} />
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

