"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/lib/store"
import type { Client } from "@/lib/payment-utils"
import { Edit2, Save, X } from "lucide-react"

interface ClientGeneralInfoProps {
  client: Client
}

export function ClientGeneralInfo({ client }: ClientGeneralInfoProps) {
  const { updateClient } = usePaymentStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email || "",
    phone: client.phone || "",
    address: client.address || "",
  })

  const handleSave = () => {
    updateClient(client.id, {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
    })
    setIsEditing(false)
  }

  return (
    <Card id="general-info">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Client contact and address details</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Client name"
              />
            ) : (
              <p className="text-sm font-medium">{client.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
              />
            ) : (
              <p className="text-sm">{client.email || "—"}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            {isEditing ? (
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            ) : (
              <p className="text-sm">{client.phone || "—"}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            {isEditing ? (
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, City, Country"
              />
            ) : (
              <p className="text-sm">{client.address || "—"}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

