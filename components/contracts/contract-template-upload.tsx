"use client";

import { Upload } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePaymentStore } from "@/lib/store";
import type { ContractTemplate } from "@/lib/contract-utils";

export function ContractTemplateUpload() {
  const { userContractTemplate, setUserContractTemplate } = usePaymentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUseDummyTemplate = () => {
    // Create a default template using the dummy PDF
    const now = new Date();
    const defaultTemplate: ContractTemplate = {
      id: "default-template",
      name: "Default Contract Template",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      logoUrl: undefined,
      terms: "",
      createdAt: now,
      updatedAt: now,
      pdfPath: "/contracts/CorePoint-Kontrat.pdf", // Reference to dummy PDF
    };
    setUserContractTemplate(defaultTemplate);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    try {
      // For now, we'll store the file as base64 or reference
      // In the future, we can parse the PDF to extract placeholders
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const now = new Date();
        const template: ContractTemplate = {
          id: `template-${Date.now()}`,
          name: file.name,
          companyName: "",
          companyAddress: "",
          companyEmail: "",
          companyPhone: "",
          logoUrl: undefined,
          terms: "",
          createdAt: now,
          updatedAt: now,
          pdfData: base64String, // Store base64 for now
        };
        setUserContractTemplate(template);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert("Failed to read file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (userContractTemplate) {
    return null; // Don't show upload if template exists
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" weight="bold" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Upload a Contract Format</h3>
            <p className="text-muted-foreground text-sm">
              Upload your custom contract template that you use for all contracts.
              We'll parse it and use it as your template for future contracts.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="default"
            >
              <Upload className="mr-2 h-4 w-4" weight="bold" />
              {isUploading ? "Uploading..." : "Upload Contract Template"}
            </Button>
            <Button
              onClick={handleUseDummyTemplate}
              disabled={isUploading}
              variant="outline"
            >
              Use Default Template
            </Button>
          </div>
          <input
            ref={fileInputRef}
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
            type="file"
          />
        </div>
      </CardContent>
    </Card>
  );
}

