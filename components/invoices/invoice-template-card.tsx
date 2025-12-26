"use client";

import { FileText, PencilSimple, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InvoiceTemplate } from "@/lib/invoice-utils";

interface InvoiceTemplateCardProps {
  template: InvoiceTemplate;
  onDelete: (id: string) => void;
}

export function InvoiceTemplateCard({
  template,
  onDelete,
}: InvoiceTemplateCardProps) {
  return (
    <Card className="p-3 transition-all duration-200">
      <CardHeader className="p-0">
        <div className="flex items-start gap-3">
          <div className="mt-1 shrink-0">
            {template.logoUrl ? (
              <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/50">
                <img
                  alt={template.companyName}
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<svg class="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>';
                    }
                  }}
                  src={template.logoUrl}
                />
              </div>
            ) : (
              <div className="flex size-12 items-center justify-center rounded-md border border-border/60 bg-primary/10">
                <FileText className="size-6 text-primary/70" weight="fill" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-1 font-semibold text-base transition-colors group-hover:text-primary">
              {template.name}
            </CardTitle>
            <CardDescription className="mt-1.5 line-clamp-1">
              {template.companyName}
            </CardDescription>
            {template.companyEmail && (
              <p className="mt-1.5 line-clamp-1 text-muted-foreground text-xs">
                {template.companyEmail}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex w-full items-center gap-2">
          <Link className="w-1/2" href={`/invoices/templates/${template.id}`}>
            <Button
              className="w-full border-primary/50 text-primary transition-colors duration-200 hover:bg-white/5 hover:text-primary"
              size="sm"
              variant="outline"
            >
              <PencilSimple className="mr-2 size-3" weight="fill" />
              Edit
            </Button>
          </Link>
          <Button
            className="w-1/2 border-destructive/50 text-destructive transition-colors duration-200 hover:bg-white/5 hover:text-destructive"
            onClick={() => onDelete(template.id)}
            size="sm"
            variant="outline"
          >
            <Trash className="mr-2 size-3" weight="fill" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
