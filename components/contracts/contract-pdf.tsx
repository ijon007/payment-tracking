"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Contract, ContractTemplate } from "@/lib/contract-utils";
import type { Client } from "@/lib/payment-utils";
import { calculateContractTotals, formatContractCurrency } from "@/lib/contract-settings";

// Define styles matching the Albanian contract template
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 15,
  },
  sectionNumber: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
    textAlign: "justify",
  },
  bulletPoint: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 5,
    marginLeft: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  contactInfo: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 5,
  },
  signatureTable: {
    marginTop: 30,
    width: "100%",
  },
  signatureRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  signatureCell: {
    flex: 1,
    padding: 5,
  },
  signatureLine: {
    borderTop: "1px solid #000000",
    marginTop: 40,
    paddingTop: 5,
  },
  signatureText: {
    fontSize: 9,
    marginTop: 3,
  },
  divider: {
    borderTop: "1px solid #cccccc",
    marginTop: 15,
    marginBottom: 15,
  },
  companyInfo: {
    marginBottom: 15,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

interface ContractPDFProps {
  contract: Contract;
  template: ContractTemplate;
  client: Client;
}

export function ContractPDF({ contract, template, client }: ContractPDFProps) {
  // Format dates in Albanian format (DD/MM/YYYY)
  const formatDateAlbanian = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const _startDateFormatted = formatDateAlbanian(contract.startDate);
  const _issueDateFormatted = formatDateAlbanian(contract.issueDate);

  // Extract day, month, year for signature dates
  const startDay = contract.startDate.getDate().toString().padStart(2, "0");
  const startMonth = (contract.startDate.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const startYear = contract.startDate.getFullYear();

  // Get settings and currency
  const settings = contract.settings;
  const currency = contract.currency || settings?.currency || "USD";
  const paymentPlan = contract.paymentPlan;

  // Calculate totals
  const { subtotal, discount, tax, total } = calculateContractTotals(
    contract.projectCost || 0,
    settings
  );

  // Format currency for display
  const formatCurrencyDisplay = (amount: number) => {
    return formatContractCurrency(amount, currency);
  };

  // Render payment plan breakdown
  const renderPaymentPlanPDF = () => {
    if (!paymentPlan || !contract.projectCost) {
      // Default simple structure
      return (
        <>
          <Text style={styles.paragraph}>- Pagesa do të kryhet në dy faza:</Text>
          <Text style={styles.bulletPoint}>
            - 30% parapagim në momentin e nënshkrimit të kontratës (nisja e punës).
          </Text>
          <Text style={styles.bulletPoint}>
            - 70% pagesë përfundimtare pas dorëzimit të website-it.
          </Text>
        </>
      );
    }

    if (paymentPlan.structure === "simple") {
      return (
        <>
          <Text style={styles.paragraph}>- Pagesa do të kryhet në dy faza:</Text>
          <Text style={styles.bulletPoint}>
            - 30% parapagim në momentin e nënshkrimit të kontratës (nisja e punës).
          </Text>
          <Text style={styles.bulletPoint}>
            - 70% pagesë përfundimtare pas dorëzimit të website-it.
          </Text>
        </>
      );
    }

    if (paymentPlan.structure === "installments" && paymentPlan.installments) {
      return (
        <>
          <Text style={styles.paragraph}>
            - Pagesa do të kryhet në {paymentPlan.installments.length} faza:
          </Text>
          {paymentPlan.installments.map((inst, index) => (
            <Text key={inst.id} style={styles.bulletPoint}>
              - {inst.percentage}% ({formatCurrencyDisplay(inst.amount || 0)})
              {inst.description && ` - ${inst.description}`}
              {inst.dueDate && ` - Afati: ${formatDateAlbanian(inst.dueDate)}`}
              {index === 0 && " parapagim në momentin e nënshkrimit të kontratës"}
              {index === paymentPlan.installments!.length - 1 && " pagesë përfundimtare"}
            </Text>
          ))}
        </>
      );
    }

    if (paymentPlan.structure === "milestones" && paymentPlan.milestones) {
      return (
        <>
          <Text style={styles.paragraph}>
            - Pagesa do të kryhet sipas arritjes së milestone-ave:
          </Text>
          {paymentPlan.milestones.map((milestone) => (
            <Text key={milestone.id} style={styles.bulletPoint}>
              - <Text style={styles.boldText}>{milestone.name}</Text>: {milestone.percentage}% (
              {formatCurrencyDisplay(milestone.amount || 0)}) - {milestone.description}
              {milestone.dueDate && ` (Afati: ${formatDateAlbanian(milestone.dueDate)})`}
            </Text>
          ))}
        </>
      );
    }

    if (paymentPlan.structure === "custom" && paymentPlan.customPayments) {
      return (
        <>
          <Text style={styles.paragraph}>- Pagesat e personalizuara:</Text>
          {paymentPlan.customPayments.map((payment) => (
            <Text key={payment.id} style={styles.bulletPoint}>
              - {formatCurrencyDisplay(payment.amount)} - {payment.description}
              {payment.dueDate && ` (Afati: ${formatDateAlbanian(payment.dueDate)})`}
            </Text>
          ))}
        </>
      );
    }

    return null;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>
          KONTRATË BASHKËPUNIMI PËR ZHVILLIM WEBSITE
        </Text>

        {/* Section 1: Contract Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>1. Palët e kontratës</Text>

          <View style={styles.companyInfo}>
            <Text style={styles.paragraph}>
              - {template.companyName} -{" "}
              {template.companyName.includes("Core Point")
                ? "Agjenci për zhvillim website-esh"
                : "Kompani"}
              , përfaqësuar nga{" "}
              {contract.companyRepresentatives || "përfaqësuesit e kompanisë"},
              në vijim do të quhet "Zhvilluesi".
            </Text>

            <Text style={styles.sectionTitle}>
              Të dhënat e kontaktit të Zhvilluesit:
            </Text>
            <Text style={styles.contactInfo}>
              Email: {template.companyEmail}
            </Text>
            <Text style={styles.contactInfo}>
              Telefon: {template.companyPhone}
            </Text>
          </View>

          <View style={styles.companyInfo}>
            <Text style={styles.paragraph}>
              - {client.name}
              {contract.clientAddress
                ? `, me adresë në ${contract.clientAddress}`
                : ""}
              , në vijim do të quhet "Klienti".
            </Text>

            <Text style={styles.sectionTitle}>
              Të dhënat e kontaktit të Klientit:
            </Text>
            {contract.clientEmail && (
              <Text style={styles.contactInfo}>
                Email: {contract.clientEmail}
              </Text>
            )}
            {contract.clientPhone && (
              <Text style={styles.contactInfo}>
                Telefon: {contract.clientPhone}
              </Text>
            )}
          </View>
        </View>

        {/* Section 2: Object of Contract */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>2. Objekti i kontratës</Text>
          <Text style={styles.paragraph}>
            - Objekti i kësaj kontrate është zhvillimi, krijimi dhe dorëzimi i
            një website-i për Klientin sipas kërkesave të tij të përcaktuara
            gjatë fazës së diskutimit paraprak, si dhe ofrimi i mirëmbajtjes dhe
            hosting-ut sipas marrëveshjes.
          </Text>
        </View>

        {/* Section 3: Service Description */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>3. Përshkrimi i shërbimit</Text>

          <Text style={styles.sectionTitle}>Zhvilluesi angazhohet të:</Text>
          <Text style={styles.bulletPoint}>
            - Krijojë dhe zhvillojë website-in në përputhje me kërkesat e
            klientit;
          </Text>
          <Text style={styles.bulletPoint}>
            - Përditësojë klientin në mënyrë të vazhdueshme mbi ecurinë e punës;
          </Text>
          <Text style={styles.bulletPoint}>
            - Dorëzojë website-in në afatin e përcaktuar në kontratë;
          </Text>
          <Text style={styles.bulletPoint}>
            - Sigurojë mirëmbajtje teknike dhe hosting.
          </Text>

          <Text style={styles.sectionTitle}>Klienti angazhohet të:</Text>
          <Text style={styles.bulletPoint}>
            - Japë të gjitha informacionet e nevojshme (tekste, imazhe, logo,
            etj.) në kohë;
          </Text>
          <Text style={styles.bulletPoint}>
            - Bëjë pagesat sipas kushteve të përcaktuara;
          </Text>
          <Text style={styles.bulletPoint}>
            - Mos kërkojë ndryshime të mëdha jashtë objektit pa rënë dakord për
            kosto shtesë.
          </Text>
        </View>

        {/* Section 5: Price and Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>
            5. Çmimi dhe mënyra e pagesës
          </Text>
          {contract.projectCost ? (
            <>
              <Text style={styles.paragraph}>
                - Totali i kostos së projektit është{" "}
                {formatCurrencyDisplay(contract.projectCost)}.
              </Text>
              {renderPaymentPlanPDF()}
              {contract.paymentMethod && (
                <Text style={styles.paragraph}>
                  - Pagesat do të kryhen nëpërmjet {contract.paymentMethod}.
                </Text>
              )}

              {/* Discount Section */}
              {settings?.discountEnabled && discount > 0 && (
                <>
                  <Text style={styles.paragraph}>
                    - Zbritje:{" "}
                    {settings.discountType === "percentage"
                      ? `${settings.discountValue}%`
                      : formatCurrencyDisplay(settings.discountValue || 0)}{" "}
                    = -{formatCurrencyDisplay(discount)}
                  </Text>
                </>
              )}

              {/* Tax Section */}
              {settings?.taxEnabled && tax > 0 && (
                <>
                  <Text style={styles.paragraph}>
                    - {settings.taxType === "vat" ? "TVSH" : "Tatimi mbi shitjet"}:{" "}
                    {settings.taxPercent}% = +{formatCurrencyDisplay(tax)}
                  </Text>
                </>
              )}

              {/* Totals Summary */}
              {(settings?.discountEnabled || settings?.taxEnabled) && (
                <>
                  <View style={{ marginTop: 10, padding: 10, border: "1px solid #000" }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                      <Text style={styles.paragraph}>Nëntotali:</Text>
                      <Text style={styles.paragraph}>{formatCurrencyDisplay(subtotal)}</Text>
                    </View>
                    {settings.discountEnabled && discount > 0 && (
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                        <Text style={styles.paragraph}>Zbritje:</Text>
                        <Text style={styles.paragraph}>-{formatCurrencyDisplay(discount)}</Text>
                      </View>
                    )}
                    {settings.taxEnabled && tax > 0 && (
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                        <Text style={styles.paragraph}>
                          {settings.taxType === "vat" ? "TVSH" : "Tatimi"}:
                        </Text>
                        <Text style={styles.paragraph}>+{formatCurrencyDisplay(tax)}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", borderTop: "1px solid #000", paddingTop: 5, marginTop: 5 }}>
                      <Text style={[styles.paragraph, styles.boldText]}>Totali:</Text>
                      <Text style={[styles.paragraph, styles.boldText]}>{formatCurrencyDisplay(total)}</Text>
                    </View>
                  </View>
                </>
              )}
            </>
          ) : (
            <Text style={styles.paragraph}>
              - Totali i kostos së projektit dhe mënyra e pagesës do të
              përcaktohen sipas marrëveshjes.
            </Text>
          )}
        </View>

        {/* Section 6: Timelines */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>6. Afatet kohore</Text>
          <Text style={styles.paragraph}>
            - Data e Fillimit të Punës do të jetë më {startDay} / {startMonth} /{" "}
            {startYear}, pas kryerjes së parapagimit prej 30% të pagës totale të
            website-it nga ana e Klientit.
          </Text>
          {contract.projectDuration ? (
            <Text style={styles.paragraph}>
              - Zhvilluesi angazhohet ta përfundojë projektin brenda{" "}
              {contract.projectDuration} nga Data e Fillimit të Punës.
            </Text>
          ) : (
            <Text style={styles.paragraph}>
              - Zhvilluesi angazhohet ta përfundojë projektin brenda afatit të
              përcaktuar nga Data e Fillimit të Punës.
            </Text>
          )}
          <Text style={styles.paragraph}>
            - Në rast vonese të pagesës së parapagimit ose të materialeve nga
            Klienti, afati i dorëzimit do të shtyhet në mënyrë proporcionale.
          </Text>
        </View>

        {/* Section 7: Maintenance and Hosting */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>7. Mirëmbajtja dhe Hosting</Text>
          <Text style={styles.paragraph}>
            - Pas dorëzimit të website-it, Klienti vazhdon me sherbimet e
            mirëmbajtjes dhe hostingut nga Zhvilluesi.
          </Text>
          {contract.maintenanceCost ? (
            <>
              <Text style={styles.paragraph}>
                - Kostot mujore për këto shërbime janë:
              </Text>
              <Text style={styles.bulletPoint}>
                - Kostoja e mirëmbajtjes:{" "}
                {contract.maintenanceCost ? formatCurrencyDisplay(contract.maintenanceCost) : "shuma"}/muaj
              </Text>
              <Text style={styles.paragraph}>
                (Përfshin hosting, përditësime sigurie, ndihmë teknike,
                përmirësime të faqes etj.)
              </Text>
            </>
          ) : (
            <Text style={styles.paragraph}>
              - Kostot mujore për mirëmbajtje dhe hosting do të përcaktohen
              sipas marrëveshjes.
            </Text>
          )}
        </View>

        {/* Section 8: Intellectual Property */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>8. Pronësia intelektuale</Text>
          <Text style={styles.paragraph}>
            - E drejta e përdorimit dhe pronësisë së website-it i kalon Klientit
            vetëm pasi projekti të jetë paguar plotësisht.
          </Text>
          <Text style={styles.paragraph}>
            - Para këtij momenti, çdo kod, dizajn apo përmbajtje mbetet pronë e
            Zhvilluesit.
          </Text>
        </View>

        {/* Section 9: Changes and Additional Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>
            9. Ndryshime dhe kërkesa shtesë
          </Text>
          <Text style={styles.paragraph}>
            - Çdo kërkesë shtesë përtej specifikimeve fillestare do të
            konsiderohet shërbim i ri dhe do të ketë kosto shtesë të përcaktuar
            me shkrim.
          </Text>
        </View>

        {/* Section 10: Termination */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>
            10. Përfundimi ose ndërprerja e kontratës
          </Text>
          <Text style={styles.paragraph}>
            - Çdo palë mund të ndërpresë kontratën me njoftim me shkrim nëse
            pala tjetër nuk respekton detyrimet.
          </Text>
          <Text style={styles.paragraph}>
            - Në rast ndërprerjeje nga Klienti pas fillimit të punës, parapagimi
            30% nuk rimbursohet.
          </Text>
        </View>

        {/* Section 11: Confidentiality */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>11. Konfidencialiteti</Text>
          <Text style={styles.paragraph}>
            - Palët angazhohen të ruajnë konfidencialitetin e çdo informacioni
            teknik, tregtar apo profesional që bëhet i njohur gjatë
            bashkëpunimit.
          </Text>
        </View>

        {/* Section 12: Force Majeure */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>12. Forca madhore</Text>
          <Text style={styles.paragraph}>
            - Asnjëra palë nuk mban përgjegjësi për mosrealizim detyrimesh për
            shkak të forcës madhore (fatkeqësi natyrore, ndërprerje energjie,
            konflikte të jashtme etj.)
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Closing Statement */}
        <Text style={styles.paragraph}>
          Me nënshkrimin e kësaj kontrate, palët pranojnë dhe bien dakord për të
          gjitha kushtet, detyrimet dhe marrëveshjet e përcaktuara më sipër.
        </Text>
        <Text style={styles.paragraph}>
          Kjo kontratë hyn në fuqi në Datën e Fillimit të Punës të përcaktuar në
          pikën 6 të saj.
        </Text>

        {/* Signature Table */}
        <View style={styles.signatureTable}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureCell}>
              <Text style={styles.paragraph}>Data ___ / ___ /</Text>
            </View>
            <View style={styles.signatureCell}>
              <Text style={styles.paragraph}>Data ___ / ___ /</Text>
            </View>
          </View>
          <View style={styles.signatureRow}>
            <View style={styles.signatureCell}>
              <Text style={styles.boldText}>{template.companyName}</Text>
              {contract.companyRepresentatives && (
                <>
                  <View style={styles.signatureLine}>
                    {contract.companySignature ? (
                      <Text style={styles.signatureText}>
                        {contract.companySignature}
                      </Text>
                    ) : (
                      <Text style={styles.signatureText}>
                        {contract.companyRepresentatives.split(" dhe ")[0]}
                      </Text>
                    )}
                  </View>
                  {contract.companyRepresentatives.includes(" dhe ") && (
                    <View style={styles.signatureLine}>
                      <Text style={styles.signatureText}>
                        {contract.companyRepresentatives.split(" dhe ")[1]}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
            <View style={styles.signatureCell}>
              <Text style={styles.boldText}>Klienti</Text>
              <View style={styles.signatureLine}>
                {contract.clientSignature ? (
                  <Text style={styles.signatureText}>
                    {contract.clientSignature}
                  </Text>
                ) : (
                  <Text style={styles.signatureText}>(Emri Klientit)</Text>
                )}
              </View>
              <Text style={styles.signatureText}>(Firma)</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
