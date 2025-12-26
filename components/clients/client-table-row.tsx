"use client";

import { Envelope, FileText, Signature } from "@phosphor-icons/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Client, formatCurrency } from "@/lib/payment-utils";

interface ClientTableRowProps {
  client: Client;
  onEmail: (client: Client) => void;
  onSendInvoice: (client: Client) => void;
  onGenerateContract: (client: Client) => void;
}

function getStatusBadgeVariant(
  status: "paid" | "pending" | "overdue"
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "overdue":
      return "destructive";
  }
}

export function ClientTableRow({
  client,
  onEmail,
  onSendInvoice,
  onGenerateContract,
}: ClientTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          className="text-primary hover:underline"
          href={`/clients/${client.id}`}
        >
          {client.name}
        </Link>
      </TableCell>
      <TableCell>
        <a
          className="text-primary hover:underline"
          href={client.notionPageLink}
          rel="noopener noreferrer"
          target="_blank"
        >
          {client.notionPageLink}
        </a>
      </TableCell>
      <TableCell>{formatCurrency(client.agreedPrice)}</TableCell>
      <TableCell>{formatCurrency(client.amountPaid)}</TableCell>
      <TableCell>{formatCurrency(client.amountDue)}</TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(client.status)}>
          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => onEmail(client)}
                  size="icon"
                  variant="default"
                >
                  <Envelope className="h-4 w-4" weight="fill" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              <p>Email</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  className="bg-green-900 text-white hover:bg-green-900/90"
                  onClick={() => onSendInvoice(client)}
                  size="icon"
                  variant="secondary"
                >
                  <FileText className="h-4 w-4" weight="fill" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              <p>Send Invoice</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => onGenerateContract(client)}
                  size="icon"
                  variant="secondary"
                >
                  <Signature className="h-4 w-4" weight="fill" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              <p>Generate Contract</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
