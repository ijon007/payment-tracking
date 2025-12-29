"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Contract, ContractTemplate } from "./contract-utils";
import { generateContractNumber } from "./contract-utils";
import type { Invoice } from "./invoice-utils";
import { calculateInvoiceTotals, generateInvoiceNumber, generateShareToken } from "./invoice-utils";
import type { Client, Payment } from "./payment-utils";
import {
  calculateClientStatus,
  calculatePaymentPlan,
  PAYMENT_PLAN_TEMPLATES,
} from "./payment-utils";

const STORAGE_KEY = "payment-tracker-clients";
const INVOICES_STORAGE_KEY = "payment-tracker-invoices";
const CONTRACT_TEMPLATES_STORAGE_KEY = "payment-tracker-contract-templates";
const CONTRACTS_STORAGE_KEY = "payment-tracker-contracts";

// Helper to serialize/deserialize dates
function serializeClients(clients: Client[]): string {
  return JSON.stringify(clients, (_key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  });
}

function deserializeClients(json: string): Client[] {
  const parsed = JSON.parse(json);
  return parsed.map((client: any) => ({
    ...client,
    payments: client.payments.map((payment: any) => ({
      ...payment,
      dueDate: new Date(payment.dueDate),
      paidDate: payment.paidDate ? new Date(payment.paidDate) : null,
    })),
  }));
}

// Helper to serialize/deserialize invoices
function serializeInvoices(invoices: Invoice[]): string {
  return JSON.stringify(invoices, (_key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  });
}

function deserializeInvoices(json: string): Invoice[] {
  const parsed = JSON.parse(json);
  return parsed.map((invoice: any) => ({
    ...invoice,
    issueDate: new Date(invoice.issueDate),
    dueDate: new Date(invoice.dueDate),
  }));
}

// Helper to serialize/deserialize contract templates
function serializeContractTemplates(templates: ContractTemplate[]): string {
  return JSON.stringify(templates, (_key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  });
}

function deserializeContractTemplates(json: string): ContractTemplate[] {
  const parsed = JSON.parse(json);
  return parsed.map((template: any) => ({
    ...template,
    createdAt: new Date(template.createdAt),
    updatedAt: new Date(template.updatedAt),
  }));
}

// Helper to serialize/deserialize contracts
function serializeContracts(contracts: Contract[]): string {
  return JSON.stringify(contracts, (_key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  });
}

function deserializeContracts(json: string): Contract[] {
  const parsed = JSON.parse(json);
  return parsed.map((contract: any) => ({
    ...contract,
    issueDate: new Date(contract.issueDate),
    startDate: new Date(contract.startDate),
    endDate: new Date(contract.endDate),
    projectCompletionDate: contract.projectCompletionDate
      ? new Date(contract.projectCompletionDate)
      : undefined,
  }));
}

interface PaymentStoreContextType {
  clients: Client[];
  addClient: (
    client: Omit<
      Client,
      "id" | "status" | "amountPaid" | "amountDue" | "payments"
    > & { paymentPlanId: string }
  ) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addPayment: (clientId: string, paymentId: string, paidDate: Date) => void;
  getClient: (id: string) => Client | undefined;
  getClientContracts: (clientId: string) => Contract[];
  getClientInvoices: (clientId: string) => Invoice[];
  invoices: Invoice[];
  generateInvoice: (data: {
    clientId: string;
    items: Invoice["items"];
    dueDate: Date;
    companyName: string;
    companyAddress?: string;
    companyEmail: string;
    companyPhone?: string;
    logoUrl?: string;
    notes?: string;
    paymentDetails?: string;
    dateFormat?: Invoice["dateFormat"];
    invoiceSize?: Invoice["invoiceSize"];
    salesTaxEnabled?: boolean;
    salesTaxPercent?: number;
    vatEnabled?: boolean;
    vatPercent?: number;
    currency?: Invoice["currency"];
    discountEnabled?: boolean;
    showQrCode?: boolean;
  }) => Invoice;
  getInvoice: (id: string) => Invoice | undefined;
  getInvoiceByToken: (token: string) => Invoice | undefined;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  contractTemplates: ContractTemplate[];
  contracts: Contract[];
  addContractTemplate: (
    template: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateContractTemplate: (
    id: string,
    updates: Partial<ContractTemplate>
  ) => void;
  deleteContractTemplate: (id: string) => void;
  getContractTemplate: (id: string) => ContractTemplate | undefined;
  generateContract: (data: {
    templateId: string;
    clientId: string;
    startDate: Date;
    endDate: Date;
    terms: string;
    projectCost?: number;
    paymentMethod?: string;
    projectDuration?: string;
    maintenanceCost?: number;
    clientAddress?: string;
    clientEmail?: string;
    clientPhone?: string;
    companyRepresentatives?: string;
  }) => Contract;
  getContract: (id: string) => Contract | undefined;
}

const PaymentStoreContext = createContext<PaymentStoreContextType | undefined>(
  undefined
);

export function PaymentStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load clients from localStorage on mount
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return deserializeClients(stored);
      }
    } catch (error) {
      console.error("Failed to load clients from localStorage:", error);
    }
    return [];
  });

  // Load invoices from localStorage on mount
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (stored) {
        return deserializeInvoices(stored);
      }
    } catch (error) {
      console.error("Failed to load invoices from localStorage:", error);
    }
    return [];
  });

  // Load contract templates from localStorage on mount
  const [contractTemplates, setContractTemplates] = useState<
    ContractTemplate[]
  >(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(CONTRACT_TEMPLATES_STORAGE_KEY);
      if (stored) {
        return deserializeContractTemplates(stored);
      }
    } catch (error) {
      console.error(
        "Failed to load contract templates from localStorage:",
        error
      );
    }
    return [];
  });

  // Load contracts from localStorage on mount
  const [contracts, setContracts] = useState<Contract[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(CONTRACTS_STORAGE_KEY);
      if (stored) {
        return deserializeContracts(stored);
      }
    } catch (error) {
      console.error("Failed to load contracts from localStorage:", error);
    }
    return [];
  });

  // Save clients to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, serializeClients(clients));
      } catch (error) {
        console.error("Failed to save clients to localStorage:", error);
      }
    }
  }, [clients]);

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(INVOICES_STORAGE_KEY, serializeInvoices(invoices));
      } catch (error) {
        console.error("Failed to save invoices to localStorage:", error);
      }
    }
  }, [invoices]);

  // Save contract templates to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          CONTRACT_TEMPLATES_STORAGE_KEY,
          serializeContractTemplates(contractTemplates)
        );
      } catch (error) {
        console.error(
          "Failed to save contract templates to localStorage:",
          error
        );
      }
    }
  }, [contractTemplates]);

  // Save contracts to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          CONTRACTS_STORAGE_KEY,
          serializeContracts(contracts)
        );
      } catch (error) {
        console.error("Failed to save contracts to localStorage:", error);
      }
    }
  }, [contracts]);

  const addClient = useCallback(
    (
      clientData: Omit<
        Client,
        "id" | "status" | "amountPaid" | "amountDue" | "payments"
      > & { paymentPlanId: string }
    ) => {
      const template = PAYMENT_PLAN_TEMPLATES.find(
        (t) => t.id === clientData.paymentPlanId
      );

      if (!template) {
        throw new Error("Payment plan template not found");
      }

      // Generate client ID first
      const clientId = `client-${Date.now()}`;

      // Generate payment installments
      const paymentData = calculatePaymentPlan(
        clientData.agreedPrice,
        template
      );

      // Create payment objects with IDs
      const payments: Payment[] = paymentData.map((p, index) => ({
        ...p,
        id: `payment-${clientId}-${index}`,
        clientId,
        paidDate: null,
      }));

      // Calculate initial amounts
      const amountPaid = 0;
      const amountDue = clientData.agreedPrice;

      // Create client
      const client: Client = {
        ...clientData,
        id: clientId,
        amountPaid,
        amountDue,
        status: "pending",
        payments,
        currency: clientData.currency || "USD",
      };

      // Recalculate status
      client.status = calculateClientStatus(client);

      setClients((prev) => [...prev, client]);
    },
    []
  );

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id === id) {
          const updated = { ...client, ...updates };
          // Recalculate status and amounts
          updated.status = calculateClientStatus(updated);
          updated.amountPaid = updated.payments
            .filter((p) => p.paidDate)
            .reduce((sum, p) => sum + p.amount, 0);
          updated.amountDue = updated.agreedPrice - updated.amountPaid;
          return updated;
        }
        return client;
      })
    );
  }, []);

  const addPayment = useCallback(
    (clientId: string, paymentId: string, paidDate: Date) => {
      setClients((prev) =>
        prev.map((client) => {
          if (client.id === clientId) {
            const updatedPayments = client.payments.map((payment) => {
              if (payment.id === paymentId) {
                return { ...payment, paidDate };
              }
              return payment;
            });

            const updatedClient = {
              ...client,
              payments: updatedPayments,
            };

            // Recalculate amounts
            updatedClient.amountPaid = updatedPayments
              .filter((p) => p.paidDate)
              .reduce((sum, p) => sum + p.amount, 0);
            updatedClient.amountDue =
              updatedClient.agreedPrice - updatedClient.amountPaid;

            // Recalculate status
            updatedClient.status = calculateClientStatus(updatedClient);

            return updatedClient;
          }
          return client;
        })
      );
    },
    []
  );

  const getClient = useCallback(
    (id: string) => {
      return clients.find((c) => c.id === id);
    },
    [clients]
  );

  const getClientContracts = useCallback(
    (clientId: string) => {
      return contracts.filter((c) => c.clientId === clientId);
    },
    [contracts]
  );

  const getClientInvoices = useCallback(
    (clientId: string) => {
      return invoices.filter((i) => i.clientId === clientId);
    },
    [invoices]
  );

  const generateInvoice = useCallback(
    (data: {
      clientId: string;
      items: Invoice["items"];
      dueDate: Date;
      companyName: string;
      companyAddress?: string;
      companyEmail: string;
      companyPhone?: string;
      logoUrl?: string;
      notes?: string;
      paymentDetails?: string;
      dateFormat?: Invoice["dateFormat"];
      invoiceSize?: Invoice["invoiceSize"];
      salesTaxEnabled?: boolean;
      salesTaxPercent?: number;
      vatEnabled?: boolean;
      vatPercent?: number;
      currency?: Invoice["currency"];
      discountEnabled?: boolean;
      showQrCode?: boolean;
    }): Invoice => {
      const { subtotal, salesTax, vat, total } = calculateInvoiceTotals(
        data.items,
        {
          salesTaxPercent: data.salesTaxEnabled ? data.salesTaxPercent : undefined,
          vatPercent: data.vatEnabled ? data.vatPercent : undefined,
        }
      );
      const invoice: Invoice = {
        id: `invoice-${Date.now()}`,
        clientId: data.clientId,
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date(),
        dueDate: data.dueDate,
        items: data.items,
        subtotal,
        total,
        status: "draft",
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyEmail: data.companyEmail,
        companyPhone: data.companyPhone,
        logoUrl: data.logoUrl,
        notes: data.notes,
        paymentDetails: data.paymentDetails,
        shareToken: generateShareToken(),
        // Invoice settings
        dateFormat: data.dateFormat,
        invoiceSize: data.invoiceSize,
        salesTaxEnabled: data.salesTaxEnabled,
        salesTaxPercent: data.salesTaxEnabled ? data.salesTaxPercent : undefined,
        vatEnabled: data.vatEnabled,
        vatPercent: data.vatEnabled ? data.vatPercent : undefined,
        currency: data.currency,
        discountEnabled: data.discountEnabled,
        showQrCode: data.showQrCode,
      };
      setInvoices((prev) => [...prev, invoice]);
      return invoice;
    },
    []
  );

  const getInvoice = useCallback(
    (id: string) => {
      return invoices.find((i) => i.id === id);
    },
    [invoices]
  );

  const getInvoiceByToken = useCallback(
    (token: string) => {
      return invoices.find((i) => i.shareToken === token);
    },
    [invoices]
  );

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      )
    );
  }, []);

  const addContractTemplate = useCallback(
    (
      templateData: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">
    ) => {
      const now = new Date();
      const template: ContractTemplate = {
        ...templateData,
        id: `contract-template-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setContractTemplates((prev) => [...prev, template]);
    },
    []
  );

  const updateContractTemplate = useCallback(
    (id: string, updates: Partial<ContractTemplate>) => {
      setContractTemplates((prev) =>
        prev.map((template) =>
          template.id === id
            ? { ...template, ...updates, updatedAt: new Date() }
            : template
        )
      );
    },
    []
  );

  const deleteContractTemplate = useCallback((id: string) => {
    setContractTemplates((prev) =>
      prev.filter((template) => template.id !== id)
    );
  }, []);

  const getContractTemplate = useCallback(
    (id: string) => {
      return contractTemplates.find((t) => t.id === id);
    },
    [contractTemplates]
  );

  const generateContract = useCallback(
    (data: {
      templateId: string;
      clientId: string;
      startDate: Date;
      endDate: Date;
      terms: string;
      projectCost?: number;
      paymentMethod?: string;
      projectDuration?: string;
      maintenanceCost?: number;
      clientAddress?: string;
      clientEmail?: string;
      clientPhone?: string;
      companyRepresentatives?: string;
    }): Contract => {
      const contract: Contract = {
        id: `contract-${Date.now()}`,
        templateId: data.templateId,
        clientId: data.clientId,
        contractNumber: generateContractNumber(),
        issueDate: new Date(),
        startDate: data.startDate,
        endDate: data.endDate,
        terms: data.terms,
        projectCost: data.projectCost,
        paymentMethod: data.paymentMethod,
        projectDuration: data.projectDuration,
        maintenanceCost: data.maintenanceCost,
        clientAddress: data.clientAddress,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        companyRepresentatives: data.companyRepresentatives,
        status: "draft",
      };
      setContracts((prev) => [...prev, contract]);
      return contract;
    },
    []
  );

  const getContract = useCallback(
    (id: string) => {
      return contracts.find((c) => c.id === id);
    },
    [contracts]
  );

  return (
    <PaymentStoreContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        addPayment,
        getClient,
        getClientContracts,
        getClientInvoices,
        invoices,
        generateInvoice,
        getInvoice,
        getInvoiceByToken,
        updateInvoice,
        contractTemplates,
        contracts,
        addContractTemplate,
        updateContractTemplate,
        deleteContractTemplate,
        getContractTemplate,
        generateContract,
        getContract,
      }}
    >
      {children}
    </PaymentStoreContext.Provider>
  );
}

export function usePaymentStore() {
  const context = useContext(PaymentStoreContext);
  if (context === undefined) {
    throw new Error("usePaymentStore must be used within PaymentStoreProvider");
  }
  return context;
}
