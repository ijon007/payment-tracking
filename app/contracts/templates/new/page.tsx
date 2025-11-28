"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContractTemplateBuilder } from "@/components/contract-template-builder"
import { ContractTemplatePreview } from "@/components/contract-template-preview"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { ContractTemplate } from "@/lib/contract-utils"

export default function NewTemplatePage() {
  const [previewTemplate, setPreviewTemplate] = useState<Partial<ContractTemplate>>({})

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-xl font-bold">New Contract Template</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 -mt-2">
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractTemplateBuilder onChange={setPreviewTemplate} />
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
  )
}

