"use client";

import { FileText, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function InvoiceTemplatesEmpty() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <FileText
          className="mx-auto mb-4 size-12 text-muted-foreground"
          weight="fill"
        />
        <p className="mb-4 text-muted-foreground">
          No invoice templates yet. Create your first template to get started.
        </p>
        <Link href="/invoices/templates/new">
          <Button>
            <Plus className="mr-2 size-3" weight="bold" />
            Create Template
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
