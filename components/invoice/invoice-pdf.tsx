"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Invoice, InvoiceTemplate } from "@/lib/invoice-utils";
import type { Client } from "@/lib/payment-utils";
import { formatCurrency } from "@/lib/payment-utils";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
  },
  companyInfo: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 10,
    color: "#666666",
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 10,
    textAlign: "right",
    color: "#666666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  billTo: {
    flex: 1,
  },
  dueDate: {
    flex: 1,
    textAlign: "right",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "2px solid #000000",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #cccccc",
    paddingBottom: 8,
    paddingTop: 8,
  },
  colDescription: {
    width: "40%",
  },
  colQuantity: {
    width: "15%",
    textAlign: "right",
  },
  colRate: {
    width: "20%",
    textAlign: "right",
  },
  colAmount: {
    width: "25%",
    textAlign: "right",
  },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    color: "#666666",
  },
  totalValue: {
    fontWeight: "bold",
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: "bold",
    borderTop: "2px solid #000000",
    paddingTop: 5,
    marginTop: 5,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1px solid #cccccc",
    fontSize: 9,
    color: "#666666",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  template: InvoiceTemplate;
  client: Client;
}

export function InvoicePDF({ invoice, template, client }: InvoicePDFProps) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const tax = invoice.tax || 0;
  const total = invoice.total;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.row}>
            <View style={styles.companyInfo}>
              {template.logoUrl && (
                <Image src={template.logoUrl} style={styles.logo} />
              )}
              <Text style={styles.companyName}>{template.companyName}</Text>
              <View style={styles.companyDetails}>
                {template.companyAddress && (
                  <Text>{template.companyAddress}</Text>
                )}
                <Text>{template.companyEmail}</Text>
                {template.companyPhone && <Text>{template.companyPhone}</Text>}
              </View>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>
                Invoice #: {invoice.invoiceNumber}
              </Text>
              <Text style={styles.invoiceNumber}>
                Issue Date: {format(invoice.issueDate, "MMM dd, yyyy")}
              </Text>
            </View>
          </View>
        </View>

        {/* Bill To and Due Date */}
        <View style={styles.row}>
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text>{client.name}</Text>
          </View>
          <View style={styles.dueDate}>
            <Text style={styles.sectionTitle}>Due Date:</Text>
            <Text>{format(invoice.dueDate, "MMM dd, yyyy")}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQuantity}>Quantity</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colRate}>{formatCurrency(item.rate)}</Text>
              <Text style={styles.colAmount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total:</Text>
            <Text>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Footer Notes */}
        {template.notes && (
          <View style={styles.footer}>
            <Text>{template.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
