"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Contract, ContractTemplate, ContractSettings, PaymentPlan } from "./contract-utils";
import { generateContractNumber } from "./contract-utils";
import { calculateContractTotals, createDefaultContractSettings } from "./contract-settings";
import type { Invoice } from "./invoice-utils";
import { calculateInvoiceTotals, generateInvoiceNumber, generateShareToken } from "./invoice-utils";
import { generateInvoicesFromContract } from "./invoice-generation";
import type { Client, Payment } from "./payment-utils";
import {
  calculateClientStatus,
  calculatePaymentPlan,
  PAYMENT_PLAN_TEMPLATES,
} from "./payment-utils";

const STORAGE_KEY = "payment-tracker-clients";
const INVOICES_STORAGE_KEY = "payment-tracker-invoices";
const USER_CONTRACT_TEMPLATE_KEY = "payment-tracker-user-contract-template";
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
    // Migration: Set defaults for new fields
    contractId: invoice.contractId || undefined,
    paymentPlanItemId: invoice.paymentPlanItemId || undefined,
  }));
}

// Helper to serialize/deserialize user contract template
function serializeUserContractTemplate(template: ContractTemplate | null): string {
  if (!template) return "";
  return JSON.stringify(template, (_key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  });
}

function deserializeUserContractTemplate(json: string): ContractTemplate | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch {
    return null;
  }
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
    // Migrate old "draft" status to "created"
    status: contract.status === "draft" ? "created" : contract.status,
    // Migration: Set default for new field
    invoiceIds: contract.invoiceIds || [],
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
    contractId?: string;
    paymentPlanItemId?: string;
  }) => Invoice;
  getInvoice: (id: string) => Invoice | undefined;
  getInvoiceByToken: (token: string) => Invoice | undefined;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  userContractTemplate: ContractTemplate | null;
  setUserContractTemplate: (template: ContractTemplate | null) => void;
  contracts: Contract[];
  generateContract: (data: {
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
    settings?: ContractSettings;
    paymentPlan?: PaymentPlan;
  }) => Contract;
  getContract: (id: string) => Contract | undefined;
  getContractByToken: (token: string) => Contract | undefined;
  updateContract: (id: string, updates: Partial<Contract>) => void;
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

  // Load user contract template from localStorage on mount
  const [userContractTemplate, setUserContractTemplateState] = useState<
    ContractTemplate | null
  >(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const stored = localStorage.getItem(USER_CONTRACT_TEMPLATE_KEY);
      if (stored) {
        return deserializeUserContractTemplate(stored);
      }
    } catch (error) {
      console.error(
        "Failed to load user contract template from localStorage:",
        error
      );
    }
    return null;
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

  // Save user contract template to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (userContractTemplate) {
          localStorage.setItem(
            USER_CONTRACT_TEMPLATE_KEY,
            serializeUserContractTemplate(userContractTemplate)
          );
        } else {
          localStorage.removeItem(USER_CONTRACT_TEMPLATE_KEY);
        }
      } catch (error) {
        console.error(
          "Failed to save user contract template to localStorage:",
          error
        );
      }
    }
  }, [userContractTemplate]);

  const setUserContractTemplate = useCallback((template: ContractTemplate | null) => {
    setUserContractTemplateState(template);
  }, []);

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
      contractId?: string;
      paymentPlanItemId?: string;
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
        // Contract linking
        contractId: data.contractId,
        paymentPlanItemId: data.paymentPlanItemId,
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

  const generateContract = useCallback(
    (data: {
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
      settings?: ContractSettings;
      paymentPlan?: PaymentPlan;
    }): Contract => {
      // Use provided settings or create default
      const settings = data.settings || createDefaultContractSettings("USD");
      
      // Calculate discount and tax amounts
      const { discount, tax } = calculateContractTotals(
        data.projectCost || 0,
        settings
      );

      const contract: Contract = {
        id: `contract-${Date.now()}`,
        templateId: userContractTemplate?.id || "default", // Keep for backward compatibility
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
        status: "created",
        shareToken: generateShareToken(),
        // New fields
        settings,
        currency: settings.currency,
        paymentPlan: data.paymentPlan,
        discountAmount: discount > 0 ? discount : undefined,
        taxAmount: tax > 0 ? tax : undefined,
        invoiceIds: [], // Initialize empty array
      };
      
      setContracts((prev) => [...prev, contract]);
      
      // Auto-generate invoices if payment plan exists
      if (userContractTemplate && data.paymentPlan && contract.paymentPlan) {
        const client = clients.find((c) => c.id === data.clientId);
        if (client) {
          // Check if payment plan has items to generate invoices for
          const hasItems = 
            (contract.paymentPlan.structure === "installments" && contract.paymentPlan.installments && contract.paymentPlan.installments.length > 0) ||
            (contract.paymentPlan.structure === "milestones" && contract.paymentPlan.milestones && contract.paymentPlan.milestones.length > 0) ||
            (contract.paymentPlan.structure === "custom" && contract.paymentPlan.customPayments && contract.paymentPlan.customPayments.length > 0);
          
          // For installments/milestones, projectCost is required to calculate amounts
          if (hasItems) {
            // Check if projectCost is needed but missing
            const needsProjectCost = 
              (contract.paymentPlan.structure === "installments" || contract.paymentPlan.structure === "milestones") &&
              (!contract.projectCost || contract.projectCost <= 0);
            
            if (needsProjectCost) {
              console.warn(`Contract ${contract.contractNumber}: Cannot generate invoices - projectCost is required for ${contract.paymentPlan.structure} payment structure`);
            } else {
              const generatedInvoices = generateInvoicesFromContract(
                contract,
                client,
                userContractTemplate,
                generateInvoice
              );
              
              // Update contract with invoice IDs
              if (generatedInvoices.length > 0) {
                const invoiceIds = generatedInvoices.map((inv) => inv.id);
                setContracts((prev) =>
                  prev.map((c) =>
                    c.id === contract.id ? { ...c, invoiceIds } : c
                  )
                );
                console.log(`Generated ${generatedInvoices.length} invoice(s) for contract ${contract.contractNumber}`);
              } else {
                console.warn(`Contract ${contract.contractNumber}: No invoices generated - payment plan items may not have valid amounts`);
              }
            }
          }
        }
      }
      
      return contract;
    },
    [userContractTemplate, clients, generateInvoice]
  );

  const getContract = useCallback(
    (id: string) => {
      return contracts.find((c) => c.id === id);
    },
    [contracts]
  );

  const getContractByToken = useCallback(
    (token: string) => {
      return contracts.find((c) => c.shareToken === token);
    },
    [contracts]
  );

  const updateContract = useCallback((id: string, updates: Partial<Contract>) => {
    setContracts((prev) => {
      const contract = prev.find((c) => c.id === id);
      if (!contract) return prev;
      
      const updatedContract = { ...contract, ...updates };
      
      // Check if payment plan changed and needs invoice regeneration
      const paymentPlanChanged = 
        updates.paymentPlan !== undefined && 
        JSON.stringify(contract.paymentPlan) !== JSON.stringify(updates.paymentPlan);
      
      if (paymentPlanChanged && userContractTemplate && updatedContract.paymentPlan) {
        // Find and delete old invoices linked to this contract
        const oldInvoiceIds = contract.invoiceIds || [];
        setInvoices((prevInvoices) =>
          prevInvoices.filter((inv) => !oldInvoiceIds.includes(inv.id))
        );
        
        // Generate new invoices
        const client = clients.find((c) => c.id === updatedContract.clientId);
        if (client) {
          const hasItems = 
            (updatedContract.paymentPlan.structure === "installments" && updatedContract.paymentPlan.installments && updatedContract.paymentPlan.installments.length > 0) ||
            (updatedContract.paymentPlan.structure === "milestones" && updatedContract.paymentPlan.milestones && updatedContract.paymentPlan.milestones.length > 0) ||
            (updatedContract.paymentPlan.structure === "custom" && updatedContract.paymentPlan.customPayments && updatedContract.paymentPlan.customPayments.length > 0);
          
          if (hasItems) {
            const generatedInvoices = generateInvoicesFromContract(
              updatedContract,
              client,
              userContractTemplate,
              generateInvoice
            );
            
            // Update contract with new invoice IDs
            const newInvoiceIds = generatedInvoices.map((inv) => inv.id);
            updatedContract.invoiceIds = newInvoiceIds;
          } else {
            updatedContract.invoiceIds = [];
          }
        } else {
          updatedContract.invoiceIds = [];
        }
      }
      
      return prev.map((c) => (c.id === id ? updatedContract : c));
    });
  }, [userContractTemplate, clients, generateInvoice]);

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
        userContractTemplate,
        setUserContractTemplate,
        contracts,
        generateContract,
        getContract,
        getContractByToken,
        updateContract,
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
