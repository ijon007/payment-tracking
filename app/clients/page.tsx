"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Mail, FileText, FileSignature } from "lucide-react"
import Link from "next/link"
import { usePaymentStore } from "@/lib/store"
import { ClientDialog } from "@/components/client-dialog"
import { InvoiceGenerator } from "@/components/invoice/invoice-generator"
import { ContractGenerator } from "@/components/contracts/contract-generator"
import { EmailDialog } from "@/components/email/email-dialog"
import { formatCurrency } from "@/lib/payment-utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ClientsPage() {
  const { clients } = usePaymentStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [invoiceDialogClientId, setInvoiceDialogClientId] = useState<string | null>(null)
  const [contractDialogClientId, setContractDialogClientId] = useState<string | null>(null)
  const [emailDialogClientId, setEmailDialogClientId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.notionPageLink.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleEmail = (client: typeof clients[0]) => {
    setEmailDialogClientId(client.id)
  }

  const handleSendInvoice = (client: typeof clients[0]) => {
    setInvoiceDialogClientId(client.id)
  }

  const handleGenerateContract = (client: typeof clients[0]) => {
    setContractDialogClientId(client.id)
  }

  const getStatusBadgeVariant = (
    status: "paid" | "pending" | "overdue"
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Clients</h1>
        </div>
        <ClientDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Client List</CardTitle>
              <CardDescription>
                Searchable and filterable client directory
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-muted-foreground" />
                      <span>All Status</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="paid">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-primary" />
                      <span>Paid</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-secondary" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-destructive" />
                      <span>Overdue</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!mounted ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {clients.length === 0
                ? "No clients found. Add your first client to get started."
                : "No clients match your search criteria."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Notion Link</TableHead>
                  <TableHead>Agreed Price</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-primary hover:underline"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <a
                        href={client.notionPageLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {client.notionPageLink}
                      </a>
                    </TableCell>
                    <TableCell>{formatCurrency(client.agreedPrice)}</TableCell>
                    <TableCell>{formatCurrency(client.amountPaid)}</TableCell>
                    <TableCell>{formatCurrency(client.amountDue)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(client.status)}>
                        {client.status.charAt(0).toUpperCase() +
                          client.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="default"
                              size="icon"
                              onClick={() => handleEmail(client)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="">
                            <p>Email</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => handleSendInvoice(client)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Send Invoice</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => handleGenerateContract(client)}
                            >
                              <FileSignature className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Generate Contract</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {invoiceDialogClientId && (
        <InvoiceGenerator
          clientId={invoiceDialogClientId}
          open={invoiceDialogClientId !== null}
          onOpenChange={(open) => !open && setInvoiceDialogClientId(null)}
        />
      )}

      {contractDialogClientId && (
        <ContractGenerator
          clientId={contractDialogClientId}
          open={contractDialogClientId !== null}
          onOpenChange={(open) => !open && setContractDialogClientId(null)}
        />
      )}

      {emailDialogClientId && (
        <EmailDialog
          clientId={emailDialogClientId}
          open={emailDialogClientId !== null}
          onOpenChange={(open) => !open && setEmailDialogClientId(null)}
        />
      )}
    </div>
  )
}
