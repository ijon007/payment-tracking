"use client";

import { FloppyDisk, PencilSimple, X } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Client } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";

interface ClientGeneralInfoProps {
  client: Client;
}

export function ClientGeneralInfo({ client }: ClientGeneralInfoProps) {
  const { updateClient } = usePaymentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email || "",
    phone: client.phone || "",
    address: client.address || "",
  });

  const handleSave = () => {
    updateClient(client.id, {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
    });
    setIsEditing(false);
  };

  return (
    <Card id="general-info">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Client contact and address details
            </CardDescription>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleCancel} size="sm" variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" variant="default">
                <FloppyDisk className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
            >
              <PencilSimple className="mr-2 h-4 w-4" />
              Edit
            </Button>
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Client name"
                value={formData.name}
              />
            ) : (
              <p className="font-medium text-sm">{client.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="client@example.com"
                type="email"
                value={formData.email}
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
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                type="tel"
                value={formData.phone}
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
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Street address, City, Country"
                value={formData.address}
              />
            ) : (
              <p className="text-sm">{client.address || "—"}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
