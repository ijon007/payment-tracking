"use client";

import { ContractSection } from "./contract-section";

export function ContractObjectSection() {
  return (
    <ContractSection title="2. Objekti i kontratës">
      <p>
        - Objekti i kësaj kontrate është zhvillimi, krijimi dhe dorëzimi i një website-i për Klientin sipas kërkesave të tij të përcaktuara gjatë fazës së diskutimit paraprak, si dhe ofrimi i mirëmbajtjes dhe hosting-ut sipas marrëveshjes.
      </p>
    </ContractSection>
  );
}

export function ContractServiceDescriptionSection() {
  return (
    <ContractSection title="3. Përshkrimi i shërbimit">
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
    </ContractSection>
  );
}

export function ContractIntellectualPropertySection() {
  return (
    <ContractSection title="8. Pronësia intelektuale">
      <div className="space-y-2">
        <p>- E drejta e përdorimit dhe pronësisë së website-it i kalon Klientit vetëm pasi projekti të jetë paguar plotësisht.</p>
        <p>- Para këtij momenti, çdo kod, dizajn apo përmbajtje mbetet pronë e Zhvilluesit.</p>
      </div>
    </ContractSection>
  );
}

export function ContractChangesSection() {
  return (
    <ContractSection title="9. Ndryshime dhe kërkesa shtesë">
      <p>- Çdo kërkesë shtesë përtej specifikimeve fillestare do të konsiderohet shërbim i ri dhe do të ketë kosto shtesë të përcaktuar me shkrim.</p>
    </ContractSection>
  );
}

export function ContractTerminationSection() {
  return (
    <ContractSection title="10. Përfundimi ose ndërprerja e kontratës">
      <div className="space-y-2">
        <p>- Çdo palë mund të ndërpresë kontratën me njoftim me shkrim nëse pala tjetër nuk respekton detyrimet.</p>
        <p>- Në rast ndërprerjeje nga Klienti pas fillimit të punës, parapagimi 30% nuk rimbursohet.</p>
      </div>
    </ContractSection>
  );
}

export function ContractConfidentialitySection() {
  return (
    <ContractSection title="11. Konfidencialiteti">
      <p>- Palët angazhohen të ruajnë konfidencialitetin e çdo informacioni teknik, tregtar apo profesional që bëhet i njohur gjatë bashkëpunimit.</p>
    </ContractSection>
  );
}

export function ContractForceMajeureSection() {
  return (
    <ContractSection title="12. Forca madhore">
      <p>- Asnjëra palë nuk mban përgjegjësi për mosrealizim detyrimesh për shkak të forcës madhore (fatkeqësi natyrore, ndërprerje energjie, konflikte të jashtme etj.)</p>
    </ContractSection>
  );
}

export function ContractClosingStatement() {
  return (
    <div className="space-y-3 mt-8">
      <p>
        Me nënshkrimin e kësaj kontrate, palët pranojnë dhe bien dakord për të gjitha kushtet, detyrimet dhe marrëveshjet e përcaktuara më sipër.
      </p>
      <p>
        Kjo kontratë hyn në fuqi në <strong>Datën e Fillimit të Punës</strong> të përcaktuar në pikën 6 të saj.
      </p>
    </div>
  );
}

