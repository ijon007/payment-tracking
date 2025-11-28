"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceTemplateBuilder } from "@/components/invoice-template-builder"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-xl font-bold">New Invoice Template</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create Template</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTemplateBuilder />
        </CardContent>
      </Card>
    </div>
  )
}

