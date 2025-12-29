---
name: Remove Invoice Templates and Link to Clients
overview: Completely remove the invoice template system. Invoices will store company information directly and be created through a centralized InvoiceSheet component. Link invoice creation to clients so invoices can be created from both the invoices page and individual client pages.
todos:
  - id: remove-template-interface
    content: Remove InvoiceTemplate interface from lib/invoice-utils.ts
    status: pending
  - id: update-invoice-interface
    content: Update Invoice interface to include company fields directly (remove templateId, add companyName, companyAddress, companyEmail, etc.)
    status: pending
    dependencies:
      - remove-template-interface
  - id: delete-template-pages
    content: Delete app/invoices/templates/new/page.tsx and app/invoices/templates/[id]/page.tsx
    status: pending
  - id: delete-template-components
    content: Delete invoice-generator.tsx, invoice-template-builder.tsx, invoice-template-card.tsx, invoice-templates-empty.tsx, template-preview.tsx
    status: pending
  - id: remove-template-store-functions
    content: Remove invoiceTemplates state, addInvoiceTemplate, updateInvoiceTemplate, deleteInvoiceTemplate, getInvoiceTemplate from lib/store.tsx
    status: pending
  - id: update-generate-invoice-function
    content: Update generateInvoice function to accept company info directly instead of templateId
    status: pending
    dependencies:
      - update-invoice-interface
  - id: rename-invoice-sheet-component
    content: Rename InvoiceTemplateSheet to InvoiceSheet and remove all template-related logic
    status: pending
    dependencies:
      - remove-template-store-functions
      - update-generate-invoice-function
  - id: update-editable-preview
    content: Update EditableInvoicePreview to work without templates, use individual company info props
    status: pending
    dependencies:
      - update-invoice-interface
  - id: update-invoice-preview-components
    content: Update InvoicePreview and InvoicePDF to read company info from invoice instead of template
    status: pending
    dependencies:
      - update-invoice-interface
  - id: clean-clients-page
    content: Remove InvoiceGenerator usage from app/clients/page.tsx, add InvoiceSheet with client pre-selection
    status: pending
    dependencies:
      - rename-invoice-sheet-component
  - id: clean-client-detail-page
    content: Remove InvoiceGenerator usage from app/clients/[slug]/page.tsx, update invoice button to open InvoiceSheet
    status: pending
    dependencies:
      - rename-invoice-sheet-component
  - id: clean-client-table-row
    content: Update ClientTableRow to open InvoiceSheet instead of InvoiceGenerator
    status: pending
    dependencies:
      - rename-invoice-sheet-component
  - id: clean-invoices-page
    content: Update app/invoices/page.tsx - change button text to Create Invoice, remove template-related code
    status: pending
    dependencies:
      - rename-invoice-sheet-component
  - id: update-email-dialog
    content: Remove getInvoiceTemplate usage from EmailDialog component
    status: pending
    dependencies:
      - remove-template-store-functions
  - id: verify-client-invoices-display
    content: Verify ClientInvoices component properly displays invoices (should already work via clientId filter)
    status: pending
  - id: update-invoice-stats
    content: Verify InvoiceStats works without templates (should already work as it only uses invoices)
    status: pending
  - id: check-navigation-links
    content: Verify and remove any navigation links to deleted template routes
    status: pending
    dependencies:
      - delete-template-pages
---

# Remove Invoice Templates and Link to Clients

## Overview

Remove ALL template-related code. Invoices will store company information directly and be created through a centralized `InvoiceSheet` component. The invoice creation flow will be linked to clients, allowing invoices to be created from both the invoices page and individual client pages.

## Major Changes

### 1. Remove Template System Completely

**Delete Files:**

- `app/invoices/templates/new/page.tsx` - Template creation page
- `app/invoices/templates/[id]/page.tsx` - Template editing page  
- `components/invoice/invoice-generator.tsx` - Old invoice generator
- `components/invoice/invoice-template-builder.tsx` - Template builder form
- `components/invoice/template-preview.tsx` - Template preview component
- `components/invoices/invoice-template-card.tsx` - Template card component
- `components/invoices/invoice-templates-empty.tsx` - Empty state component

**Remove from `lib/invoice-utils.ts`:**

- `InvoiceTemplate` interface (entire interface)

**Update `Invoice` interface in `lib/invoice-utils.ts`:**

- Remove `templateId: string`
- Add company fields directly:
- `companyName: string`
- `companyAddress?: string`
- `companyEmail: string`
- `companyPhone?: string`
- `logoUrl?: string`
- `notes?: string`
- `paymentDetails?: string`

### 2. Update Store (`lib/store.tsx`)

**Remove:**

- `invoiceTemplates` state array
- `addInvoiceTemplate` function
- `updateInvoiceTemplate` function
- `deleteInvoiceTemplate` function
- `getInvoiceTemplate` function
- `INVOICE_TEMPLATES_STORAGE_KEY` constant
- Template serialization/deserialization functions
- Template-related context properties

**Update `generateInvoice` function:**

- Change signature from `{ templateId, clientId, items, dueDate, tax? }` 
- To: `{ clientId, items, dueDate, tax?, companyName, companyAddress?, companyEmail, companyPhone?, logoUrl?, notes?, paymentDetails? }`
- Remove template lookup, store company info directly in invoice

### 3. Rename and Refactor Invoice Sheet Component

**Rename:**

- `components/invoices/invoice-template-sheet.tsx` → `components/invoices/invoice-sheet.tsx`
- Component name: `InvoiceTemplateSheet` → `InvoiceSheet`

**Update Component:**

- Remove all template-related state and logic
- Remove `templateId` prop from interface
- Remove `getInvoiceTemplate`, `addInvoiceTemplate`, `updateInvoiceTemplate` from store usage
- Update to store company info directly in invoice when creating
- Remove "Save Template" functionality (only "Create Invoice" button)
- Update props to accept optional `clientId` to pre-select client
- Update component to initialize with empty company info (not from template)

### 4. Update Editable Invoice Preview (`components/invoice/editable-invoice-preview.tsx`)

- Remove `template` prop, replace with direct company info props:
- `companyName`, `companyAddress`, `companyEmail`, `companyPhone`, `logoUrl`, `notes`, `paymentDetails`
- Update callbacks to pass company info directly instead of template object:
- `onTemplateChange` → `onCompanyInfoChange` with individual fields
- Update component to work with individual company fields

### 5. Update Invoice Preview Components

**`components/invoice/invoice-preview.tsx`:**

- Remove `template` prop and `getInvoiceTemplate` usage
- Read company info directly from invoice object
- Update to display company info from invoice
- Remove template-related imports

**`components/invoice/invoice-pdf.tsx`:**

- Remove `template` prop from interface
- Read company info directly from invoice object
- Update PDF generation to use invoice company fields

### 6. Update Client Pages

**`app/clients/page.tsx`:**

- Remove `InvoiceGenerator` import and usage
- Remove `invoiceDialogClientId` state
- Remove `handleSendInvoice` function
- Add state for `invoiceSheetOpen` and `selectedClientIdForInvoice`
- Import `InvoiceSheet` component
- Update "Send Invoice" button in `ClientTableRow` to open invoice sheet with client pre-selected
- Add `InvoiceSheet` component at bottom with `clientId` prop

**`app/clients/[slug]/page.tsx`:**

- Remove `InvoiceGenerator` import and usage
- Remove `invoiceDialogOpen` state
- Update invoice button (FileText icon) to open `InvoiceSheet` with `clientId` prop
- Import and use `InvoiceSheet` component
- Add state for `invoiceSheetOpen`

**`components/clients/client-table-row.tsx`:**

- Keep `onSendInvoice` prop but update handler to open invoice sheet
- Or update to accept callback that opens sheet with client ID

### 7. Update Invoices Page (`app/invoices/page.tsx`)

- Change button text from "New Template" to "Create Invoice"
- Remove unused `deleteInvoiceTemplate` from store destructuring
- Remove `deleteDialogOpen` state and `AlertDialog` for template deletion
- Remove unused `Trash` icon import
- Update `InvoiceTemplateSheet` import to `InvoiceSheet`
- Update component usage to `InvoiceSheet`

### 8. Update Email Dialog (`components/email/email-dialog.tsx`)

- Remove `getInvoiceTemplate` from store usage
- Invoices already have all needed info, no template lookup needed
- Remove template-related imports

### 9. Verify Existing Functionality

**`components/clients/client-invoices.tsx`:**

- Already filters by `clientId`, should work without changes
- Verify it displays correctly (no template dependencies)

**`components/invoices/invoice-stats.tsx`:**

- Already uses invoices directly, should work without changes
- Verify calculations are correct

**`components/invoices/invoice-list.tsx`:**

- Verify it works without template dependencies

### 10. Navigation Cleanup

- Check `components/app-sidebar.tsx` for any template links
- Remove any links to `/invoices/templates/*` routes

### 11. Update Store Context Interface

**`lib/store.tsx` - `PaymentStoreContextType`:**

- Remove `invoiceTemplates: InvoiceTemplate[]`
- Remove `addInvoiceTemplate`, `updateInvoiceTemplate`, `deleteInvoiceTemplate`, `getInvoiceTemplate` from interface
- Update `generateInvoice` signature in interface

## Implementation Notes

- **New Workflow:**

1. From `/invoices` page: Click "Create Invoice" → Sheet opens → Select client → Fill invoice with company info → Create
2. From `/clients` page: Click "Send Invoice" on client row → Sheet opens with client pre-selected → Fill invoice with company info → Create
3. From `/clients/[slug]` page: Click invoice button → Sheet opens with client pre-selected → Fill invoice with company info → Create

- **Data Migration:** Existing invoices with `templateId` will need to be handled. Consider:
- Adding migration logic to copy template data to invoice
- Or handling missing company info gracefully (show placeholder/error)
- **Company Info:** Company information will be entered each time an invoice is created. Could be enhanced later to:
- Store default company info in settings
- Remember last used company info
- Auto-fill from previous invoices
- **Invoice Sheet Component:** Should accept optional `clientId` prop to pre-select the client when opened from client pages.