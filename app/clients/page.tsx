"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { ClientDialog } from "@/components/client-dialog";
import { ClientTableRow } from "@/components/clients/client-table-row";
import { ContractGenerator } from "@/components/contracts/contract-generator";
import { EmailDialog } from "@/components/email/email-dialog";
import { InvoiceGenerator } from "@/components/invoice/invoice-generator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { usePaymentStore } from "@/lib/store";

export default function ClientsPage() {
  const { clients } = usePaymentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [invoiceDialogClientId, setInvoiceDialogClientId] = useState<
    string | null
  >(null);
  const [contractDialogClientId, setContractDialogClientId] = useState<
    string | null
  >(null);
  const [emailDialogClientId, setEmailDialogClientId] = useState<string | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.notionPageLink.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEmail = (client: (typeof clients)[0]) => {
    setEmailDialogClientId(client.id);
  };

  const handleSendInvoice = (client: (typeof clients)[0]) => {
    setInvoiceDialogClientId(client.id);
  };

  const handleGenerateContract = (client: (typeof clients)[0]) => {
    setContractDialogClientId(client.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Clients</h1>
        </div>
        <ClientDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Client List</CardTitle>
              <CardDescription className="sr-only">
                Searchable and filterable client directory
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <MagnifyingGlass
                  className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  weight="fill"
                />
                <Input
                  className="w-full pl-8"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  value={searchQuery}
                />
              </div>
              <Select
                onValueChange={(value) =>
                  setStatusFilter(value || "All Status")
                }
                value={statusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-muted-foreground" />
                      <span>All Status</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Paid">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-primary" />
                      <span>Paid</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Pending">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-secondary" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Overdue">
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
          {mounted ? (
            filteredClients.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
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
                    <ClientTableRow
                      client={client}
                      key={client.id}
                      onEmail={handleEmail}
                      onGenerateContract={handleGenerateContract}
                      onSendInvoice={handleSendInvoice}
                    />
                  ))}
                </TableBody>
              </Table>
            )
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>
          )}
        </CardContent>
      </Card>

      {invoiceDialogClientId && (
        <InvoiceGenerator
          clientId={invoiceDialogClientId}
          onOpenChange={(open) => !open && setInvoiceDialogClientId(null)}
          open={invoiceDialogClientId !== null}
        />
      )}

      {contractDialogClientId && (
        <ContractGenerator
          clientId={contractDialogClientId}
          onOpenChange={(open) => !open && setContractDialogClientId(null)}
          open={contractDialogClientId !== null}
        />
      )}

      {emailDialogClientId && (
        <EmailDialog
          clientId={emailDialogClientId}
          onOpenChange={(open) => !open && setEmailDialogClientId(null)}
          open={emailDialogClientId !== null}
        />
      )}
    </div>
  );
}
