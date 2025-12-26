"use client";

import {
  ArrowSquareOut,
  FloppyDisk,
  PencilSimple,
  X,
} from "@phosphor-icons/react";
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
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/lib/payment-utils";
import { PAYMENT_PLAN_TEMPLATES } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";

interface ClientDealInfoProps {
  client: Client;
}

export function ClientDealInfo({ client }: ClientDealInfoProps) {
  const { updateClient } = usePaymentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: client.serviceType || "",
    retainerDetails: client.retainerDetails || "",
    initialRequests: client.initialRequests || "",
  });

  const paymentPlan = PAYMENT_PLAN_TEMPLATES.find(
    (p) => p.id === client.paymentPlanId
  );

  const handleSave = () => {
    updateClient(client.id, {
      serviceType: formData.serviceType || undefined,
      retainerDetails: formData.retainerDetails || undefined,
      initialRequests: formData.initialRequests || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      serviceType: client.serviceType || "",
      retainerDetails: client.retainerDetails || "",
      initialRequests: client.initialRequests || "",
    });
    setIsEditing(false);
  };

  return (
    <Card id="deal-info">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deal Information</CardTitle>
            <CardDescription>
              Service details and project information
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
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service Type</Label>
          {isEditing ? (
            <Input
              id="serviceType"
              onChange={(e) =>
                setFormData({ ...formData, serviceType: e.target.value })
              }
              placeholder="e.g., Web Development, Design, Consulting"
              value={formData.serviceType}
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
              onChange={(e) =>
                setFormData({ ...formData, retainerDetails: e.target.value })
              }
              placeholder="Retainer payment details and terms"
              rows={3}
              value={formData.retainerDetails}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm">
              {client.retainerDetails || "—"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialRequests">Initial Client Requests</Label>
          {isEditing ? (
            <Textarea
              id="initialRequests"
              onChange={(e) =>
                setFormData({ ...formData, initialRequests: e.target.value })
              }
              placeholder="Initial project requirements and client requests"
              rows={4}
              value={formData.initialRequests}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm">
              {client.initialRequests || "—"}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label>Payment Plan</Label>
          <p className="font-medium text-sm">{paymentPlan?.name || "—"}</p>
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label>Notion Project Page</Label>
          <a
            className="flex items-center gap-2 text-primary text-sm hover:underline"
            href={client.notionPageLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            {client.notionPageLink}
            <ArrowSquareOut className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
