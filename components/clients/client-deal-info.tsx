"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/lib/store"
import type { Client } from "@/lib/payment-utils"
import { PAYMENT_PLAN_TEMPLATES } from "@/lib/payment-utils"
import { PencilSimple, FloppyDisk, X, ArrowSquareOut } from "@phosphor-icons/react"

interface ClientDealInfoProps {
  client: Client
}

export function ClientDealInfo({ client }: ClientDealInfoProps) {
  const { updateClient } = usePaymentStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    serviceType: client.serviceType || "",
    retainerDetails: client.retainerDetails || "",
    initialRequests: client.initialRequests || "",
  })

  const paymentPlan = PAYMENT_PLAN_TEMPLATES.find((p) => p.id === client.paymentPlanId)

  const handleSave = () => {
    updateClient(client.id, {
      serviceType: formData.serviceType || undefined,
      retainerDetails: formData.retainerDetails || undefined,
      initialRequests: formData.initialRequests || undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      serviceType: client.serviceType || "",
      retainerDetails: client.retainerDetails || "",
      initialRequests: client.initialRequests || "",
    })
    setIsEditing(false)
  }

  return (
    <Card id="deal-info">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deal Information</CardTitle>
            <CardDescription>Service details and project information</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <PencilSimple className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <FloppyDisk className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service Type</Label>
          {isEditing ? (
            <Input
              id="serviceType"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              placeholder="e.g., Web Development, Design, Consulting"
            />
          ) : (
            <p className="text-sm">{client.serviceType || "—"}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="retainerDetails">Retainer Details</Label>
          {isEditing ? (
            <Textarea
              id="retainerDetails"
              value={formData.retainerDetails}
              onChange={(e) =>
                setFormData({ ...formData, retainerDetails: e.target.value })
              }
              placeholder="Retainer payment details and terms"
              rows={3}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{client.retainerDetails || "—"}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialRequests">Initial Client Requests</Label>
          {isEditing ? (
            <Textarea
              id="initialRequests"
              value={formData.initialRequests}
              onChange={(e) =>
                setFormData({ ...formData, initialRequests: e.target.value })
              }
              placeholder="Initial project requirements and client requests"
              rows={4}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{client.initialRequests || "—"}</p>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label>Payment Plan</Label>
          <p className="text-sm font-medium">{paymentPlan?.name || "—"}</p>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label>Notion Project Page</Label>
          <a
            href={client.notionPageLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {client.notionPageLink}
            <ArrowSquareOut className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

