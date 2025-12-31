"use client";

import { Download, Link, Check } from "@phosphor-icons/react";
import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Contract, ContractTemplate } from "@/lib/contract-utils";
import type { Client } from "@/lib/payment-utils";
import { generateShareToken } from "@/lib/invoice-utils";
import { ContractPDF } from "@/components/contracts/contract-pdf";
import { usePaymentStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  calculateContractTotals,
  formatContractCurrency,
} from "@/lib/contract-settings";
import { formatCurrency } from "@/lib/currency-utils";

interface ContractPreviewProps {
  contractId?: string;
  template?: ContractTemplate;
  client?: Client;
  startDate?: Date;
  endDate?: Date;
  terms?: string;
  showActions?: boolean;
  showShareButton?: boolean;
  onShareLinkClick?: () => void;
  onDownloadPDFClick?: () => void;
}

export function ContractPreview({
  contractId,
  template,
  client,
  startDate,
  endDate,
  terms,
  showActions = true,
  showShareButton = true,
  onShareLinkClick,
  onDownloadPDFClick,
}: ContractPreviewProps) {
  const { getContract, userContractTemplate, getClient, updateContract } = usePaymentStore();
  const [linkCopied, setLinkCopied] = useState(false);

  let contract: Contract | null = null;
  let contractTemplate: ContractTemplate | null = null;
  let contractClient: Client | null = null;
  let contractStartDate: Date | null = null;
  let contractEndDate: Date | null = null;
  let contractTerms = "";

  let contractProjectCost: number | undefined;
  let contractPaymentMethod: string | undefined;
  let contractProjectDuration: string | undefined;
  let contractMaintenanceCost: number | undefined;
  let contractClientAddress: string | undefined;
  let contractClientEmail: string | undefined;
  let contractClientPhone: string | undefined;
  let contractCompanyRepresentatives: string | undefined;
  let contractSettings;
  let contractPaymentPlan;
  let contractCurrency = "USD";

  if (contractId) {
    contract = getContract(contractId) || null;
    if (contract) {
      // Use user template (single template system)
      contractTemplate = userContractTemplate || null;
      contractClient = getClient(contract.clientId) || null;
      contractStartDate = contract.startDate;
      contractEndDate = contract.endDate;
      contractTerms = contract.terms;
      // Get all contract data
      contractProjectCost = contract.projectCost;
      contractPaymentMethod = contract.paymentMethod;
      contractProjectDuration = contract.projectDuration;
      contractMaintenanceCost = contract.maintenanceCost;
      contractClientAddress = contract.clientAddress;
      contractClientEmail = contract.clientEmail;
      contractClientPhone = contract.clientPhone;
      contractCompanyRepresentatives = contract.companyRepresentatives;
      contractSettings = contract.settings;
      contractPaymentPlan = contract.paymentPlan;
      contractCurrency = contract.currency || contract.settings?.currency || "USD";
    }
  } else if (template && client && startDate && endDate && terms) {
    contractSettings = undefined;
    contractPaymentPlan = undefined;
    contractCurrency = "USD";
    contractTemplate = template;
    contractClient = client;
    contractStartDate = startDate;
    contractEndDate = endDate;
    contractTerms = terms;
  }

  if (!(contractTemplate && contractClient)) {
    return null;
  }

  // Format date for display (DD / MM / YYYY)
  const formatDateForContract = (date: Date | null | undefined) => {
    if (!date) return "___ / ___ / ___";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  // Calculate totals
  const { subtotal, discount, tax, total } = calculateContractTotals(
    contractProjectCost || 0,
    contractSettings
  );

  // Format currency for display
  const formatCurrencyDisplay = (amount: number) => {
    return formatContractCurrency(amount, contractCurrency);
  };

  // Render payment plan breakdown
  const renderPaymentPlan = () => {
    if (!contractPaymentPlan || !contractProjectCost) {
      // Default simple structure
      return (
        <>
          <p>- Pagesa do të kryhet në dy faza:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              30% parapagim në momentin e nënshkrimit të kontratës (nisja e punës).
            </li>
            <li>70% pagesë përfundimtare pas dorëzimit të website-it.</li>
          </ul>
        </>
      );
    }

    if (contractPaymentPlan.structure === "simple") {
      return (
        <>
          <p>- Pagesa do të kryhet në dy faza:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              30% parapagim në momentin e nënshkrimit të kontratës (nisja e punës).
            </li>
            <li>70% pagesë përfundimtare pas dorëzimit të website-it.</li>
          </ul>
        </>
      );
    }

    if (contractPaymentPlan.structure === "installments" && contractPaymentPlan.installments) {
      return (
        <>
          <p>- Pagesa do të kryhet në {contractPaymentPlan.installments.length} faza:</p>
          <ul className="ml-6 list-disc space-y-1">
            {contractPaymentPlan.installments.map((inst, index) => (
              <li key={inst.id}>
                {inst.percentage}% ({formatCurrencyDisplay(inst.amount || 0)})
                {inst.description && ` - ${inst.description}`}
                {inst.dueDate && ` - Afati: ${formatDateForContract(inst.dueDate)}`}
                {index === 0 && " parapagim në momentin e nënshkrimit të kontratës"}
                {index === contractPaymentPlan.installments!.length - 1 && " pagesë përfundimtare"}
              </li>
            ))}
          </ul>
        </>
      );
    }

    if (contractPaymentPlan.structure === "milestones" && contractPaymentPlan.milestones) {
      return (
        <>
          <p>- Pagesa do të kryhet sipas arritjes së milestone-ave:</p>
          <ul className="ml-6 list-disc space-y-1">
            {contractPaymentPlan.milestones.map((milestone) => (
              <li key={milestone.id}>
                <strong>{milestone.name}</strong>: {milestone.percentage}% (
                {formatCurrencyDisplay(milestone.amount || 0)}) - {milestone.description}
                {milestone.dueDate && ` (Afati: ${formatDateForContract(milestone.dueDate)})`}
              </li>
            ))}
          </ul>
        </>
      );
    }

    if (contractPaymentPlan.structure === "custom" && contractPaymentPlan.customPayments) {
      return (
        <>
          <p>- Pagesat e personalizuara:</p>
          <ul className="ml-6 list-disc space-y-1">
            {contractPaymentPlan.customPayments.map((payment) => (
              <li key={payment.id}>
                {formatCurrencyDisplay(payment.amount)} - {payment.description}
                {payment.dueDate && ` (Afati: ${formatDateForContract(payment.dueDate)})`}
              </li>
            ))}
          </ul>
        </>
      );
    }

    return null;
  };

  const handleDownloadPDF = async () => {
    if (!contract || !contractTemplate || !contractClient) return;

    try {
      const blob = await pdf(
        <ContractPDF contract={contract} template={contractTemplate} client={contractClient} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contract.contractNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleCopyShareLink = async () => {
    if (!contract) return;

    // Get or create share token
    let shareToken = contract.shareToken;
    if (!shareToken) {
      shareToken = generateShareToken();
      // Update contract with new token
      updateContract(contract.id, { shareToken });
    }

    const shareUrl = `${window.location.origin}/contract/${shareToken}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div>
      <Card className="bg-white text-black">
        <CardContent className="p-8 font-serif">
        <div className="space-y-6 text-sm leading-relaxed">
          {/* Title */}
          <h1 className="text-center text-xl font-bold uppercase mb-8">
            KONTRATË BASHKËPUNIMI PËR ZHVILLIM WEBSITE
          </h1>

          {/* Section 1: Palët e kontratës */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">1. Palët e kontratës</h2>
            <div className="space-y-2">
              <p>
                - <strong>Core Point</strong> – Agjenci për zhvillim website-esh, përfaqësuar nga{" "}
                <span className={cn(
                  "font-medium",
                  !contractCompanyRepresentatives && "text-gray-500"
                )}>
                  {contractCompanyRepresentatives || "Johan Gjinko dhe Ijon Kushta"}
                </span>
                , në vijim do të quhet "Zhvilluesi".
              </p>
              <div className="ml-4 space-y-1">
                <p className="font-semibold">Të dhënat e kontaktit të Zhvilluesit:</p>
                <p>Email: {contractTemplate.companyEmail || "dev.corepoint@gmail.com"}</p>
                <p>Telefon: {contractTemplate.companyPhone || "+355 69 267 5398"}</p>
              </div>
              <p>
                - <span className="font-medium">{contractClient.name}</span>, me adresë në{" "}
                <span className={cn(
                  "font-medium",
                  !contractClientAddress && "text-gray-500"
                )}>
                  {contractClientAddress || "adresa"}
                </span>
                , në vijim do të quhet "Klienti".
              </p>
              <div className="ml-4 space-y-1">
                <p className="font-semibold">Të dhënat e kontaktit të Klientit:</p>
                <p>
                  Email:{" "}
                  <span className={cn(
                    "font-medium",
                    !contractClientEmail && "text-gray-500"
                  )}>
                    {contractClientEmail || "email"}
                  </span>
                </p>
                <p>
                  Telefon:{" "}
                  <span className={cn(
                    "font-medium",
                    !contractClientPhone && "text-gray-500"
                  )}>
                    {contractClientPhone || "telefon"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Objekti i kontratës */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">2. Objekti i kontratës</h2>
            <p>
              - Objekti i kësaj kontrate është zhvillimi, krijimi dhe dorëzimi i një website-i për Klientin sipas kërkesave të tij të përcaktuara gjatë fazës së diskutimit paraprak, si dhe ofrimi i mirëmbajtjes dhe hosting-ut sipas marrëveshjes.
            </p>
          </div>

          {/* Section 3: Përshkrimi i shërbimit */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">3. Përshkrimi i shërbimit</h2>
            <div className="space-y-2">
              <p className="font-semibold">Zhvilluesi angazhohet të:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Krijojë dhe zhvillojë website-in në përputhje me kërkesat e klientit;</li>
                <li>Përditësojë klientin në mënyrë të vazhdueshme mbi ecurinë e punës;</li>
                <li>Dorëzojë website-in në afatin e përcaktuar në kontratë;</li>
                <li>Sigurojë mirëmbajtje teknike dhe hosting.</li>
              </ul>
              <p className="font-semibold">Klienti angazhohet të:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Japë të gjitha informacionet e nevojshme (tekste, imazhe, logo, etj.) në kohë;</li>
                <li>Bëjë pagesat sipas kushteve të përcaktuara;</li>
                <li>Mos kërkojë ndryshime të mëdha jashtë objektit pa rënë dakord për kosto shtesë.</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Çmimi dhe mënyra e pagesës */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">5. Çmimi dhe mënyra e pagesës</h2>
            <div className="space-y-2">
              <p>
                - Totali i kostos së projektit është{" "}
                <span className={cn(
                  "font-medium",
                  !contractProjectCost && "text-gray-500"
                )}>
                  {contractProjectCost
                    ? `${formatCurrencyDisplay(contractProjectCost)}`
                    : `shuma ${contractCurrency === "ALL" ? "lekë" : formatCurrency(1, contractCurrency).replace("1.00", "").trim()}`}
                </span>
                .
              </p>
              {renderPaymentPlan()}
              <p>
                - Pagesat do të kryhen nëpërmjet{" "}
                <span className={cn(
                  "font-medium",
                  !contractPaymentMethod && "text-gray-500"
                )}>
                  {contractPaymentMethod || "mënyra e pagesës"}
                </span>
                .
              </p>

              {/* Discount Section */}
              {contractSettings?.discountEnabled && discount > 0 && (
                <div className="mt-4 space-y-1 rounded-lg border p-3">
                  <p className="font-semibold">Zbritje:</p>
                  <div className="flex justify-between text-sm">
                    <span>
                      {contractSettings.discountType === "percentage"
                        ? `${contractSettings.discountValue}%`
                        : formatCurrencyDisplay(contractSettings.discountValue || 0)}
                    </span>
                    <span className="font-medium">-{formatCurrencyDisplay(discount)}</span>
                  </div>
                </div>
              )}

              {/* Tax Section */}
              {contractSettings?.taxEnabled && tax > 0 && (
                <div className="mt-4 space-y-1 rounded-lg border p-3">
                  <p className="font-semibold">
                    {contractSettings.taxType === "vat" ? "TVSH" : "Tatimi mbi shitjet"}:
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{contractSettings.taxPercent}%</span>
                    <span className="font-medium">+{formatCurrencyDisplay(tax)}</span>
                  </div>
                </div>
              )}

              {/* Totals Summary */}
              {(contractSettings?.discountEnabled || contractSettings?.taxEnabled) && (
                <div className="mt-4 space-y-1 rounded-lg border p-3">
                  <div className="flex justify-between text-sm">
                    <span>Nëntotali:</span>
                    <span className="font-medium">{formatCurrencyDisplay(subtotal)}</span>
                  </div>
                  {contractSettings.discountEnabled && discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Zbritje:</span>
                      <span className="font-medium">-{formatCurrencyDisplay(discount)}</span>
                    </div>
                  )}
                  {contractSettings.taxEnabled && tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{contractSettings.taxType === "vat" ? "TVSH" : "Tatimi"}:</span>
                      <span className="font-medium">+{formatCurrencyDisplay(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>Totali:</span>
                    <span>{formatCurrencyDisplay(total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Afatet kohore */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">6. Afatet kohore</h2>
            <div className="space-y-2">
              <p>
                - Data e Fillimit të Punës do të jetë më{" "}
                <span className={cn(
                  "font-medium",
                  !contractStartDate && "text-gray-500"
                )}>
                  {contractStartDate ? formatDateForContract(contractStartDate) : "___ / ___ / 2025"}
                </span>
                , pas kryerjes së parapagimit prej 30% të pagës totale të website-it nga ana e Klientit.
              </p>
              <p>
                - Zhvilluesi angazhohet ta përfundojë projektin brenda{" "}
                <span className={cn(
                  "font-medium",
                  !contractProjectDuration && "text-gray-500"
                )}>
                  {contractProjectDuration || "afati"}
                </span>{" "}
                nga Data e Fillimit të Punës.
              </p>
              <p>- Në rast vonese të pagesës së parapagimit ose të materialeve nga Klienti, afati i dorëzimit do të shtyhet në mënyrë proporcionale.</p>
            </div>
          </div>

          {/* Section 7: Mirëmbajtja dhe Hosting */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">7. Mirëmbajtja dhe Hosting</h2>
            <div className="space-y-2">
              <p>- Pas dorëzimit të website-it, Klienti vazhdon me sherbimet e mirëmbajtjes dhe hostingut nga Zhvilluesi.</p>
              <p>- Kostot mujore për këto shërbime janë:</p>
              <p>
                - Kostoja e mirëmbajtjes:{" "}
                <span className={cn(
                  "font-medium",
                  !contractMaintenanceCost && "text-gray-500"
                )}>
                  {contractMaintenanceCost
                    ? `${formatCurrencyDisplay(contractMaintenanceCost)}/${contractCurrency === "ALL" ? "muaj" : "month"}`
                    : `shuma ${contractCurrency === "ALL" ? "lekë" : formatCurrency(1, contractCurrency).replace("1.00", "").trim()}/muaj`}
                </span>
              </p>
              <p className="text-xs italic">(Përfshin hosting, përditësime sigurie, ndihmë teknike, përmirësime të faqes etj.)</p>
            </div>
          </div>

          {/* Section 8: Pronësia intelektuale */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">8. Pronësia intelektuale</h2>
            <div className="space-y-2">
              <p>- E drejta e përdorimit dhe pronësisë së website-it i kalon Klientit vetëm pasi projekti të jetë paguar plotësisht.</p>
              <p>- Para këtij momenti, çdo kod, dizajn apo përmbajtje mbetet pronë e Zhvilluesit.</p>
            </div>
          </div>

          {/* Section 9: Ndryshime dhe kërkesa shtesë */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">9. Ndryshime dhe kërkesa shtesë</h2>
            <p>- Çdo kërkesë shtesë përtej specifikimeve fillestare do të konsiderohet shërbim i ri dhe do të ketë kosto shtesë të përcaktuar me shkrim.</p>
          </div>

          {/* Section 10: Përfundimi ose ndërprerja e kontratës */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">10. Përfundimi ose ndërprerja e kontratës</h2>
            <div className="space-y-2">
              <p>- Çdo palë mund të ndërpresë kontratën me njoftim me shkrim nëse pala tjetër nuk respekton detyrimet.</p>
              <p>- Në rast ndërprerjeje nga Klienti pas fillimit të punës, parapagimi 30% nuk rimbursohet.</p>
            </div>
          </div>

          {/* Section 11: Konfidencialiteti */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">11. Konfidencialiteti</h2>
            <p>- Palët angazhohen të ruajnë konfidencialitetin e çdo informacioni teknik, tregtar apo profesional që bëhet i njohur gjatë bashkëpunimit.</p>
          </div>

          {/* Section 12: Forca madhore */}
          <div className="space-y-3">
            <h2 className="font-bold text-base">12. Forca madhore</h2>
            <p>- Asnjëra palë nuk mban përgjegjësi për mosrealizim detyrimesh për shkak të forcës madhore (fatkeqësi natyrore, ndërprerje energjie, konflikte të jashtme etj.)</p>
          </div>

          {/* Closing statement */}
          <div className="space-y-3 mt-8">
            <p>
              Me nënshkrimin e kësaj kontrate, palët pranojnë dhe bien dakord për të gjitha kushtet, detyrimet dhe marrëveshjet e përcaktuara më sipër.
            </p>
            <p>
              Kjo kontratë hyn në fuqi në <strong>Datën e Fillimit të Punës</strong> të përcaktuar në pikën 6 të saj.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p>
                  Data{" "}
                  <span className={cn(
                    contract?.issueDate ? "" : "text-gray-500"
                  )}>
                    {contract?.issueDate ? formatDateForContract(contract.issueDate) : "___ / ___ / ___"}
                  </span>
                </p>
                <p className="mt-8 font-bold">Core Point</p>
                <p>Johan GJINKO</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p>
                  Data{" "}
                  <span className={cn(
                    contract?.issueDate ? "" : "text-gray-500"
                  )}>
                    {contract?.issueDate ? formatDateForContract(contract.issueDate) : "___ / ___ / ___"}
                  </span>
                </p>
                <p className="mt-8 font-bold">Klienti</p>
                <p className={cn(
                  "border-b pb-1",
                  contractClient.name
                    ? "border-black"
                    : "border-dashed border-gray-400 text-gray-500"
                )}>
                  {contractClient.name || "Emri Klientit"}
                </p>
                <p className={cn(
                  "mt-2 border-b pb-1",
                  (contractClient as any)?.companyName
                    ? "border-black"
                    : "border-dashed border-gray-400 text-gray-500"
                )}>
                  {(contractClient as any)?.companyName || "Firma"}
                </p>
                <p className="mt-8">Ijon KUSHTA</p>
                <p className="mt-4 border-b border-black pb-1 w-24"></p>
              </div>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {contract && showActions && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {showShareButton && (
            <Button onClick={onShareLinkClick || handleCopyShareLink}>
              {linkCopied ? (
                <>
                  <Check className="size-4" weight="bold" />
                  Link Copied
                </>
              ) : (
                <>
                  <Link className="size-4" weight="bold" />
                  Copy Share Link
                </>
              )}
            </Button>
          )}
          <Button onClick={onDownloadPDFClick || handleDownloadPDF} variant="outline">
            <Download className="size-4" weight="fill" />
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
}

// Component for action buttons that can be used in sticky footer
export function ContractPreviewActions({ contractId }: { contractId: string }) {
  const { getContract, getClient, userContractTemplate, updateContract } = usePaymentStore();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleDownloadPDF = async () => {
    const contract = getContract(contractId);
    if (!contract) return;
    const contractTemplate = userContractTemplate;
    const contractClient = getClient(contract.clientId);
    if (!contractTemplate || !contractClient) return;

    try {
      const blob = await pdf(
        <ContractPDF contract={contract} template={contractTemplate} client={contractClient} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contract.contractNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleCopyShareLink = async () => {
    const contract = getContract(contractId);
    if (!contract) return;

    // Get or create share token
    let shareToken = contract.shareToken;
    if (!shareToken) {
      shareToken = generateShareToken();
      // Update contract with new token
      updateContract(contract.id, { shareToken });
    }

    const shareUrl = `${window.location.origin}/contract/${shareToken}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button onClick={handleCopyShareLink}>
        {linkCopied ? (
          <>
            <Check className="size-4" weight="bold" />
            Link Copied
          </>
        ) : (
          <>
            <Link className="size-4" weight="bold" />
            Copy Share Link
          </>
        )}
      </Button>
      <Button onClick={handleDownloadPDF} variant="outline">
        <Download className="size-4" weight="fill" />
        Download PDF
      </Button>
    </div>
  );
}
