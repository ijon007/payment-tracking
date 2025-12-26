"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContractTemplate } from "@/lib/contract-utils";
import { usePaymentStore } from "@/lib/store";

interface ContractTemplateBuilderProps {
  templateId?: string;
  onSave?: () => void;
  onChange?: (template: Partial<ContractTemplate>) => void;
}

export function ContractTemplateBuilder({
  templateId,
  onSave,
  onChange,
}: ContractTemplateBuilderProps) {
  const router = useRouter();
  const { getContractTemplate, addContractTemplate, updateContractTemplate } =
    usePaymentStore();

  const existingTemplate = templateId ? getContractTemplate(templateId) : null;

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setCompanyName(existingTemplate.companyName);
      setCompanyAddress(existingTemplate.companyAddress);
      setCompanyEmail(existingTemplate.companyEmail);
      setCompanyPhone(existingTemplate.companyPhone);
      setLogoUrl(existingTemplate.logoUrl || "");
      setTerms(existingTemplate.terms);
    }
  }, [existingTemplate]);

  // Notify parent of changes for live preview
  useEffect(() => {
    if (onChange) {
      onChange({
        name,
        companyName,
        companyAddress,
        companyEmail,
        companyPhone,
        logoUrl: logoUrl || undefined,
        terms,
      });
    }
  }, [
    name,
    companyName,
    companyAddress,
    companyEmail,
    companyPhone,
    logoUrl,
    terms,
    onChange,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!(name && companyName && companyEmail)) {
      return;
    }

    const templateData = {
      name,
      companyName,
      companyAddress,
      companyEmail,
      companyPhone,
      logoUrl: logoUrl || undefined,
      terms,
    };

    if (templateId && existingTemplate) {
      updateContractTemplate(templateId, templateData);
    } else {
      addContractTemplate(templateData);
    }

    if (onSave) {
      onSave();
    } else {
      router.push("/contracts");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Default Contract Template"
            required
            value={name}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your Company Name"
            required
            value={companyName}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyAddress">Company Address</Label>
          <Textarea
            id="companyAddress"
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="123 Street, City, State, ZIP"
            rows={3}
            value={companyAddress}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyEmail">Company Email</Label>
          <Input
            id="companyEmail"
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="billing@company.com"
            required
            type="email"
            value={companyEmail}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyPhone">Company Phone</Label>
          <Input
            id="companyPhone"
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            type="tel"
            value={companyPhone}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <Input
            id="logoUrl"
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            type="url"
            value={logoUrl}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Enter contract terms and conditions..."
            rows={8}
            value={terms}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          {existingTemplate ? "Update Template" : "Create Template"}
        </Button>
        <Button
          onClick={() => {
            if (onSave) {
              onSave();
            } else {
              router.push("/contracts");
            }
          }}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
