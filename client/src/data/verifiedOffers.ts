import type { Offer, Pharmacy } from "@/lib/optimizer";

export type VerifiedOfferSeed = Offer & {
  productId: string;
  exactProductTitle: string;
};

export const verifiedPharmacySeeds: Pharmacy[] = ([
  {
    id: "farmaglobo", name: "Farmaglobo", domain: "farmaglobo.it", siteUrl: "https://farmaglobo.it",
    shippingFeeCents: 490, freeThresholdCents: 5990, thresholdMode: "gt",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://farmaglobo.it/tachipirina-20cpr-500mg.html", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&lingua=italiano&id=4402&area=farmaci&menu=online&VOLID=F13572",
  },
  {
    id: "farmacia-del-sole", name: "La Farmacia del Sole", domain: "lafarmaciadelsole.it", siteUrl: "https://lafarmaciadelsole.it",
    shippingFeeCents: 499, freeThresholdCents: 6900, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://lafarmaciadelsole.it/spedizioni", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/portale/temi/ecommerce_farmaci_integrazione.jsp?VOLID=F17179",
  },
  {
    id: "farmasave", name: "Farmasave", domain: "www.farmasave.it", siteUrl: "https://www.farmasave.it",
    shippingFeeCents: 500, freeThresholdCents: 6900, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://www.farmasave.it/widgets/cms/018c39d14bed711a8ad7ec1013947010", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=C016479",
  },
  {
    id: "meafarma", name: "Meafarma", domain: "meafarma.it", siteUrl: "https://meafarma.it",
    shippingFeeCents: 590, freeThresholdCents: 7990, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://meafarma.it/informazioni-di-spedizione", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=C016080",
  },
  {
    id: "farmamia", name: "Farmamia", domain: "farmamia.net", siteUrl: "https://farmamia.net",
    shippingFeeCents: 499, freeThresholdCents: 4990, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://farmamia.net/spedizioni", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F11960",
  },
  {
    id: "openfarma", name: "Openfarma", domain: "openfarma.it", siteUrl: "https://openfarma.it",
    shippingFeeCents: 590, freeThresholdCents: 7990, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://openfarma.it/faq", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F11970",
  },
  {
    id: "farmaself", name: "Farmaself", domain: "www.farmaself.it", siteUrl: "https://www.farmaself.it",
    shippingFeeCents: 590, freeThresholdCents: 4500, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://www.farmaself.it/spedizione-e-pagamenti", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F7659",
  },
  {
    id: "farmacia-ferreri", name: "Farmacia Ferreri", domain: "www.farmaciaferreri.com", siteUrl: "https://www.farmaciaferreri.com",
    shippingFeeCents: null, freeThresholdCents: 5000, thresholdMode: "gte",
    shippingSource: "Tariffa standard non indicata il 20/10/2026", shippingSourceUrl: "", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F11371",
  },
  {
    id: "top-farmacia", name: "Top Farmacia", domain: "www.topfarmacia.it", siteUrl: "https://www.topfarmacia.it",
    shippingFeeCents: 490, freeThresholdCents: 1990, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://www.topfarmacia.it/page/6-spedizioni", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=C015399",
  },
  {
    id: "farma-it", name: "Farma.it", domain: "www.farma.it", siteUrl: "https://www.farma.it",
    shippingFeeCents: null, freeThresholdCents: 2490, minimumOrderCents: 2490, thresholdMode: "gte",
    shippingSource: "Ordine minimo 24,90 €; tariffa non applicabile sotto soglia", shippingSourceUrl: "https://www.farma.it/spedizioni", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=C016715",
  },
  {
    id: "pharmasantelena", name: "Pharmasantelena", domain: "pharmasantelena.it", siteUrl: "https://pharmasantelena.it",
    shippingFeeCents: 550, freeThresholdCents: 5990, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026", shippingSourceUrl: "https://pharmasantelena.it/spedizioni", shippingCheckedOn: "2026-10-20",
    authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F16607",
  },
  {
    id: "drmax", name: "Dr. Max", domain: "www.drmax.it", siteUrl: "https://www.drmax.it",
    shippingFeeCents: 399, freeThresholdCents: 1799, thresholdMode: "gte",
    shippingSource: "Verificato il 20/10/2026 · consegna a domicilio standard", shippingSourceUrl: "https://www.drmax.it/spedizioni-e-consegna", shippingCheckedOn: "2026-10-20",
  },
  {
    id: "farmacia-mato", name: "Farmacia Centrale Amato (FarmaMato)", domain: "www.farmaciamato.it", siteUrl: "https://www.farmaciamato.it",
    shippingFeeCents: 490, freeThresholdCents: 2900, thresholdMode: "gt",
    shippingSource: "Verificato il 20/10/2026 · gratuita oltre 29 €", shippingSourceUrl: "https://www.farmaciamato.it/content/1-spedizioni.html", shippingCheckedOn: "2026-10-20",
  },
  {
    id: "farmacia-pasquino", name: "Farmacia Pasquino", domain: "www.farmaciapasquino.it", siteUrl: "https://www.farmaciapasquino.it",
    shippingFeeCents: 490, freeThresholdCents: 3900, thresholdMode: "gt",
    shippingSource: "Verificato il 20/10/2026 · gratuita oltre 39 €", shippingSourceUrl: "https://www.farmaciapasquino.it/spedizioni.html", shippingCheckedOn: "2026-10-20",
  },
  {
    id: "marconi-farma", name: "MarconiFarma", domain: "www.marconifarma.it", siteUrl: "https://www.marconifarma.it",
    shippingFeeCents: 500, freeThresholdCents: 6990, thresholdMode: "gt",
    shippingSource: "Verificato il 20/10/2026 · gratuita oltre 69,90 €", shippingSourceUrl: "https://www.marconifarma.it/servizio-clienti/spedizioni", shippingCheckedOn: "2026-10-20",
  },
  {
    id: "amica-farmacia", name: "AmicaFarmacia", domain: "www.amicafarmacia.com", siteUrl: "https://www.amicafarmacia.com",
    shippingFeeCents: 499, freeThresholdCents: 4500, thresholdMode: "gt",
    shippingBands: [
      { maxSubtotalCents: 2990, feeCents: 499 },
      { maxSubtotalCents: 4500, feeCents: 299 },
      { maxSubtotalCents: null, feeCents: 0 },
    ],
    shippingSource: "Verificato il 20/10/2026 · 4,99 € fino a 29,90 €, 2,99 € fino a 45 €, gratuita oltre 45 €", shippingSourceUrl: "https://www.amicafarmacia.com/pages/spedizioni", shippingCheckedOn: "2026-10-20",
  },
] satisfies Pharmacy[]).map((pharmacy): Pharmacy => ({
  ...pharmacy,
  minimumOrderPolicy: pharmacy.minimumOrderCents !== undefined ? "minimum" : "unknown",
  minimumOrderPolicySource: pharmacy.minimumOrderCents !== undefined ? "verified" : "unknown",
}));

const comparisonSource = "https://www.trovaprezzi.it/farmaci-da-banco/prezzi-scheda-prodotto/tachipirina_20_compresse_500mg-v";

export const verifiedOfferSeeds: VerifiedOfferSeed[] = [
  { id: "verified-tachi-farmaglobo", productId: "tachipirina-500-20", pharmacyId: "farmaglobo", unitPriceCents: 469, availability: "available", priceSourceType: "verified", exactProductTitle: "TACHIPIRINA 500 MG 20 COMPRESSE PARACETAMOLO DOLORE FEBBRE", priceSourceUrl: "https://farmaglobo.it/tachipirina-20cpr-500mg.html", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&lingua=italiano&id=4402&area=farmaci&menu=online&VOLID=F13572", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Acquistabile; pagina con data di spedizione" },
  { id: "verified-tachi-farmacia-del-sole", productId: "tachipirina-500-20", pharmacyId: "farmacia-del-sole", unitPriceCents: 485, availability: "available", priceSourceType: "verified", exactProductTitle: "TACHIPIRINA*20CPR DIV 500MG", priceSourceUrl: "https://lafarmaciadelsole.it/tachipirina20cpr-500mg", authorizationEvidenceUrl: "https://www.salute.gov.it/portale/temi/ecommerce_farmaci_integrazione.jsp?VOLID=F17179", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Disponibile" },
  { id: "verified-tachi-farmasave", productId: "tachipirina-500-20", pharmacyId: "farmasave", unitPriceCents: 485, availability: "available", priceSourceType: "verified", exactProductTitle: "Tachipirina 500 mg - 20 Compresse", priceSourceUrl: "https://www.farmasave.it/tachipirina-500-mg-20-compresse.html", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=C016479", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Disponibile" },
  { id: "verified-tachi-meafarma", productId: "tachipirina-500-20", pharmacyId: "meafarma", unitPriceCents: 535, availability: "available", priceSourceType: "verified", exactProductTitle: "Tachipirina 500 mg, 20 compresse", priceSourceUrl: "https://meafarma.it/tachipirina20cpr-500mg", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=C016080", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Disponibile" },
  { id: "verified-tachi-farmamia", productId: "tachipirina-500-20", pharmacyId: "farmamia", unitPriceCents: 540, availability: "available", priceSourceType: "verified", exactProductTitle: "Tachipirina 500 mg 20 compresse", priceSourceUrl: "https://farmamia.net/tachipirina-500-mg-20-compresse", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F11960", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Disponibile" },
  { id: "verified-tachi-openfarma", productId: "tachipirina-500-20", pharmacyId: "openfarma", unitPriceCents: 557, availability: "available", priceSourceType: "verified", exactProductTitle: "Tachipirina 500 mg 20 compresse analgesico contro febbre, influenza e raffreddore", priceSourceUrl: "https://openfarma.it/tachipirina-500-mg-compresse-20-compresse", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F11970", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Disponibile" },
  { id: "verified-tachi-farmaself", productId: "tachipirina-500-20", pharmacyId: "farmaself", unitPriceCents: 558, availability: "available", priceSourceType: "verified", exactProductTitle: "Tachipirina 500mg 20cpr", priceSourceUrl: "https://www.farmaself.it/tachipirina-20cpr-div-500mg.html", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F7659", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Subito disponibile" },
  { id: "verified-tachi-farmacia-ferreri", productId: "tachipirina-500-20", pharmacyId: "farmacia-ferreri", unitPriceCents: 570, availability: "available", priceSourceType: "verified", exactProductTitle: "Tachipirina 20cpr div 500mg", priceSourceUrl: "https://www.farmaciaferreri.com/shop/tachipirina-500mg-20-cpr/", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F11371", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Disponibilità indicata: sì" },
  { id: "verified-tachi-top-farmacia", productId: "tachipirina-500-20", pharmacyId: "top-farmacia", unitPriceCents: 561, availability: "available", priceSourceType: "verified", exactProductTitle: "Tachipirina 500 Paracetamolo 20 Compresse", priceSourceUrl: "https://www.topfarmacia.it/p-tachipirina-500-paracetamolo-20-compresse", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=C015399", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "In stock" },
  { id: "verified-tachi-farma-it", productId: "tachipirina-500-20", pharmacyId: "farma-it", unitPriceCents: 568, availability: "available", priceSourceType: "verified", exactProductTitle: "Tachipirina 500mg 20 compresse per febbre e dolore", priceSourceUrl: "https://www.farma.it/tachipirina20cpr-500mg.html", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=C016715", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Disponibilità indicata: 10+" },
  { id: "verified-tachi-pharmasantelena", productId: "tachipirina-500-20", pharmacyId: "pharmasantelena", unitPriceCents: 568, availability: "available", priceSourceType: "verified", exactProductTitle: "TACHIPIRINA*20 cpr 500 mg", priceSourceUrl: "https://pharmasantelena.it/farmaci-da-banco/tachipirina20-cpr-500-mg", authorizationEvidenceUrl: "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm?useMode=getDettaglio&VOLID=F16607", comparisonSourceUrl: comparisonSource, checkedOn: "2026-10-20", availabilityText: "Disponibile" },
  { id: "verified-brufen-pasquino", productId: "brufen-200-12", pharmacyId: "farmacia-pasquino", unitPriceCents: 426, availability: "available", priceSourceType: "verified", exactProductTitle: "Brufen Analgesico contro dolori 200 mg 12 compresse", priceSourceUrl: "https://www.farmaciapasquino.it/farmaci-da-banco/farmaci-per-la-febbre/brufen-analgesico-200-mg-12-compresse-11748.html", checkedOn: "2026-10-20", availabilityText: "Disponibile; la pagina riporta AIC 042386058, ma non esplicita nel titolo la forma ‘rivestite’" },
  { id: "verified-brufen-farmaciamato", productId: "brufen-200-12", pharmacyId: "farmacia-mato", unitPriceCents: 710, availability: "unknown", priceSourceType: "verified", exactProductTitle: "Brufen analgesico 200 mg 12 compresse rivestite", priceSourceUrl: "https://www.farmaciamato.it/farmaci-antinfiammatori-e-antidolorifici/42386058-brufen-analgesico-200-mg-12-compresse-rivestite.html", checkedOn: "2026-10-20", availabilityText: "Prezzo e confezione rilevati; pagina senza indicatore di disponibilità magazzino" },
  { id: "verified-moment-marconi", productId: "moment-200-12", pharmacyId: "marconi-farma", unitPriceCents: 349, availability: "available", priceSourceType: "verified", exactProductTitle: "Moment 200 MG COMPRESSE RIVESTITE 12 COMPRESSE", priceSourceUrl: "https://www.marconifarma.it/vendita/moment-200-mg-compresse-rivestite-12-compresse", checkedOn: "2026-10-20", availabilityText: "Disponibile; il sito indica aggiornamento disponibilità al 20/10/2026" },
  { id: "verified-moment-drmax", productId: "moment-200-12", pharmacyId: "drmax", unitPriceCents: 529, availability: "available", priceSourceType: "verified", exactProductTitle: "Moment 200 Mg Ibuprofene 12 Compresse Rivestite", priceSourceUrl: "https://www.drmax.it/moment-12cpr-riv-200mg", checkedOn: "2026-10-20", availabilityText: "Disponibile; prezzo promozionale rilevato" },
  { id: "verified-moment-amica", productId: "moment-200-12", pharmacyId: "amica-farmacia", unitPriceCents: 610, availability: "available", priceSourceType: "verified", exactProductTitle: "Moment 12 compresse rivestite 200mg", priceSourceUrl: "https://www.amicafarmacia.com/products/moment-12-compresse-rivestite-200-mg", checkedOn: "2026-10-20", availabilityText: "Disponibile in magazzino" },
  { id: "verified-nurofen-openfarma", productId: "nurofen-200-12", pharmacyId: "openfarma", unitPriceCents: 341, availability: "unknown", priceSourceType: "verified", exactProductTitle: "Nurofen 200 Mg Compresse Rivestite 12 Compresse", priceSourceUrl: "https://openfarma.it/nurofen-200-mg-compresse-rivestite-12-compresse", checkedOn: "2026-10-20", availabilityText: "Prezzo e confezione rilevati; disponibilità non riportata nella verifica" },
  { id: "verified-nurofen-drmax", productId: "nurofen-200-12", pharmacyId: "drmax", unitPriceCents: 377, availability: "available", priceSourceType: "verified", exactProductTitle: "Nurofen 200 mg Ibuprofene 12 Compresse Rivestite Antinfiammatorio", priceSourceUrl: "https://www.drmax.it/nurofen-12cpr-riv-200mg", checkedOn: "2026-10-20", availabilityText: "Disponibile" },
  { id: "verified-voltaren-drmax", productId: "voltaren-1-60g", pharmacyId: "drmax", unitPriceCents: 839, availability: "available", priceSourceType: "verified", exactProductTitle: "Voltaren Emulgel Gel 60 g 1%", priceSourceUrl: "https://www.drmax.it/voltaren-emulgel-gel-60-g-1", checkedOn: "2026-10-20", availabilityText: "Disponibile; prezzo promozionale rilevato" },
  { id: "verified-voltaren-farmaciamato", productId: "voltaren-1-60g", pharmacyId: "farmacia-mato", unitPriceCents: 1050, availability: "unknown", priceSourceType: "verified", exactProductTitle: "Voltaren Emulgel 1% gel in tubo da 60 g", priceSourceUrl: "https://www.farmaciamato.it/farmaci-antinfiammatori-e-antidolorifici/34548040-voltaren-emulgel-1-gel-in-tubo-da-60-g.html", checkedOn: "2026-10-20", availabilityText: "La disponibilità visualizzata non è garantita e viene riconfermata dopo l’ordine" },
];
