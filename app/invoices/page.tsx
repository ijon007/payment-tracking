"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/lib/store"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus, FileText, Edit, Trash } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InvoicePreview } from "@/components/invoice/invoice-preview"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/payment-utils"

export default function InvoicesPage() {
  const router = useRouter()
  const {
    invoiceTemplates,
    invoices,
    deleteInvoiceTemplate,
  } = usePaymentStore()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    deleteInvoiceTemplate(id)
    setDeleteDialogOpen(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Invoices</h1>
        </div>
        <Link href="/invoices/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Invoice Templates</h2>
          {invoiceTemplates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No invoice templates yet. Create your first template to get started.
                </p>
                <Link href="/invoices/templates/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {invoiceTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className="transition-all duration-200 p-3"
                >
                  <CardHeader className="p-0">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-1">
                        {template.logoUrl ? (
                          <div className="size-12 rounded-md overflow-hidden border border-border/60 bg-muted/50 flex items-center justify-center">
                            <img
                              src={template.logoUrl}
                              alt={template.companyName}
                              className="size-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                  parent.innerHTML = '<svg class="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="size-12 rounded-md border border-border/60 bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary/70" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="mt-1.5 line-clamp-1">
                          {template.companyName}
                        </CardDescription>
                        {template.companyEmail && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                            {template.companyEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 w-full">
                      <Link href={`/invoices/templates/${template.id}`} className="w-1/2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-primary/50 text-primary hover:text-primary transition-colors hover:bg-white/5 duration-200"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(template.id)}
                        className="w-1/2 border-destructive/50 text-destructive hover:text-destructive transition-colors hover:bg-white/5 duration-200"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Generated Invoices</h2>
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No invoices generated yet. Generate invoices from the Clients page.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="py-2">
              <CardContent className="p-0">
                <div className="divide-y">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="p-4 flex items-center justify-between hover:bg-white/10 rounded-md mx-2 cursor-pointer transition-colors"
                      onClick={() => setSelectedInvoiceId(invoice.id)}
                    >
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(invoice.total)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog
        open={deleteDialogOpen !== null}
        onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialogOpen && handleDelete(deleteDialogOpen)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={selectedInvoiceId !== null}
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoiceId && (
            <InvoicePreview invoiceId={selectedInvoiceId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


