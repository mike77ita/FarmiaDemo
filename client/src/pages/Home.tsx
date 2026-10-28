import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Info,
  PackageCheck,
  Pill,
  Plus,
  RotateCcw,
  ShoppingBasket,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import {
  centsToInput,
  formatEuro,
  optimizeCart,
  parseEuroInput,
  type Availability,
  type Basket,
  type MinimumOrderPolicy,
  type Offer,
  type Pharmacy,
  type Product,
  type ThresholdMode,
} from "@/lib/optimizer";
import { verifiedOfferSeeds, verifiedPharmacySeeds } from "@/data/verifiedOffers";
import comparisonCandidates from "@/data/trovaprezziCandidates.json";

const STORAGE_KEY = "farmia-demo-state-v1";

type DemoState = {
  products: Product[];
  pharmacies: Pharmacy[];
  seedVersion?: string;
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const demoShippingDefaults: Record<string, { fee: number | null; threshold: number | null; mode: ThresholdMode }> = {
  drmax: { fee: 399, threshold: 1799, mode: "gte" },
  farmaglobo: { fee: 490, threshold: 5990, mode: "gt" },
  farmamia: { fee: 499, threshold: 5990, mode: "gt" },
  openfarma: { fee: 590, threshold: 7990, mode: "gt" },
};

const comparisonPharmacySeeds = comparisonCandidates.pharmacies as Pharmacy[];
const comparisonOfferSeeds = comparisonCandidates.offers as Array<Offer & { productId: string }>;
const expectedSeedProductNames: Record<string, string> = {
  "tachipirina-500-20": "Tachipirina 500 mg · 20 compresse",
  "brufen-200-12": "Brufen Analgesico 200 mg · 12 compresse",
  "moment-200-12": "Moment 200 mg · 12 compresse rivestite",
  "nurofen-200-12": "Nurofen 200 mg · 12 compresse rivestite",
  "voltaren-1-60g": "Voltaren Emulgel 1% · tubo da 60 g",
};
const previousMinimumSeedVersion = "five-products-prices-and-candidates-2026-10-20-v4-min-order-policy";
const verifiedSeedVersion = "five-products-prices-and-candidates-2026-10-20-v5-minimum-policy-source";

function mergeVerifiedData(state: DemoState): DemoState {
  if (state.seedVersion === verifiedSeedVersion) return state;
  const pharmacies: Pharmacy[] = state.pharmacies.map((pharmacy) => {
    const resetInferredNone = state.seedVersion === previousMinimumSeedVersion && pharmacy.minimumOrderPolicy === "none" && pharmacy.minimumOrderCents === undefined;
    return {
      ...pharmacy,
      minimumOrderPolicy: resetInferredNone ? "unknown" : pharmacy.minimumOrderPolicy ?? (pharmacy.minimumOrderCents !== undefined ? "minimum" : "unknown"),
      minimumOrderPolicySource: pharmacy.minimumOrderPolicySource ?? (
        resetInferredNone ? "unknown" : pharmacy.minimumOrderCents !== undefined ? "verified" : "unknown"
      ),
    };
  });
  const pharmacyIdMap = new Map<string, string>();

  for (const seed of verifiedPharmacySeeds) {
    const index = pharmacies.findIndex((pharmacy) =>
      pharmacy.id === seed.id || pharmacy.name.trim().toLocaleLowerCase("it-IT") === seed.name.trim().toLocaleLowerCase("it-IT"),
    );
    if (index < 0) {
      pharmacies.push({ ...seed });
      pharmacyIdMap.set(seed.id, seed.id);
      continue;
    }

    const existing = pharmacies[index];
    const defaults = demoShippingDefaults[seed.id];
    const unchangedDemoRules = existing.shippingSource === "Esempio demo" && defaults &&
      existing.shippingFeeCents === defaults.fee && existing.freeThresholdCents === defaults.threshold && existing.thresholdMode === defaults.mode;
    pharmacyIdMap.set(seed.id, existing.id);
    pharmacies[index] = unchangedDemoRules
      ? { ...existing, ...seed, id: existing.id, name: existing.name }
      : {
          ...existing,
          domain: existing.domain ?? seed.domain,
          siteUrl: existing.siteUrl ?? seed.siteUrl,
          authorizationEvidenceUrl: existing.authorizationEvidenceUrl ?? seed.authorizationEvidenceUrl,
          minimumOrderPolicy: existing.minimumOrderPolicy ?? seed.minimumOrderPolicy ?? "unknown",
          ...(existing.shippingSource === "Esempio demo" ? { shippingSource: "Modificato manualmente", shippingSourceUrl: undefined, shippingCheckedOn: undefined } : {}),
    };
  }

  for (const seed of comparisonPharmacySeeds) {
    const index = pharmacies.findIndex((pharmacy) =>
      pharmacy.id === seed.id ||
      pharmacy.directorySourceUrl === seed.directorySourceUrl ||
      pharmacy.name.trim().toLocaleLowerCase("it-IT") === seed.name.trim().toLocaleLowerCase("it-IT"),
    );
    if (index < 0) {
      pharmacies.push({ ...seed, minimumOrderPolicy: seed.minimumOrderPolicy ?? "unknown" });
      pharmacyIdMap.set(seed.id, seed.id);
    } else {
      const existing = pharmacies[index];
      pharmacies[index] = {
        ...existing,
        directorySourceUrl: existing.directorySourceUrl ?? seed.directorySourceUrl,
        minimumOrderPolicy: existing.minimumOrderPolicy ?? seed.minimumOrderPolicy ?? "unknown",
      };
      pharmacyIdMap.set(seed.id, existing.id);
    }
  }

  const products = state.products.map((product) => ({
    ...product,
    offers: product.offers.map((offer) => ({
      ...offer,
      priceSourceType: offer.priceSourceType ?? (offer.id.startsWith("off-") ? "demo" : "manual"),
    })),
  }));

  for (const seed of verifiedOfferSeeds) {
    const product = products.find((item) => item.id === seed.productId && item.name === expectedSeedProductNames[seed.productId]);
    if (!product) continue;
    const pharmacyId = pharmacyIdMap.get(seed.pharmacyId) ?? seed.pharmacyId;
    if (product.offers.some((offer) => offer.id === seed.id)) continue;
    const matchingDemo = product.offers.find((offer) => offer.pharmacyId === pharmacyId && offer.priceSourceType === "demo");
    if (matchingDemo) {
      product.offers = product.offers.map((offer) => offer.id === matchingDemo.id ? { ...offer, ...seed, priceSourceType: "verified", id: offer.id, pharmacyId } : offer);
    } else {
      product.offers.push({ ...seed, priceSourceType: "verified", pharmacyId });
    }
  }

  for (const seed of comparisonOfferSeeds) {
    const product = products.find((item) => item.id === seed.productId && item.name === expectedSeedProductNames[seed.productId]);
    if (!product) continue;
    const pharmacyId = pharmacyIdMap.get(seed.pharmacyId) ?? seed.pharmacyId;
    if (product.offers.some((offer) => offer.id === seed.id)) continue;
    const matchingDemo = product.offers.find((offer) => offer.pharmacyId === pharmacyId && offer.priceSourceType === "demo");
    if (matchingDemo) {
      const { productId: _productId, ...offer } = seed;
      product.offers = product.offers.map((item) => item.id === matchingDemo.id
        ? { ...offer, id: item.id, pharmacyId, priceSourceType: "candidate" as const }
        : item);
    } else if (!product.offers.some((offer) => offer.pharmacyId === pharmacyId)) {
      const { productId: _productId, ...offer } = seed;
      product.offers.push({ ...offer, pharmacyId, priceSourceType: "candidate" });
    }
  }

  return { products, pharmacies, seedVersion: verifiedSeedVersion };
}

function initialDemoState(): DemoState {
  const pharmacies: Pharmacy[] = [
    { id: "drmax", name: "Dr. Max", shippingFeeCents: 399, freeThresholdCents: 1799, thresholdMode: "gte", shippingSource: "Esempio demo" },
    { id: "farmamia", name: "Farmamia", shippingFeeCents: 499, freeThresholdCents: 5990, thresholdMode: "gt", shippingSource: "Esempio demo" },
    { id: "farmaglobo", name: "Farmaglobo", shippingFeeCents: 490, freeThresholdCents: 5990, thresholdMode: "gt", shippingSource: "Esempio demo" },
    { id: "openfarma", name: "Openfarma", shippingFeeCents: 590, freeThresholdCents: 7990, thresholdMode: "gt", shippingSource: "Esempio demo" },
  ];
  const products: Product[] = [
    { id: "tachipirina-500-20", name: "Tachipirina 500 mg · 20 compresse", quantity: 1, offers: [
      { id: "off-tachi-farmamia", pharmacyId: "farmamia", unitPriceCents: 540, availability: "available" },
      { id: "off-tachi-drmax", pharmacyId: "drmax", unitPriceCents: 568, availability: "available" },
    ] },
    { id: "brufen-200-12", name: "Brufen Analgesico 200 mg · 12 compresse", quantity: 1, offers: [
      { id: "off-brufen-farmaglobo", pharmacyId: "farmaglobo", unitPriceCents: 318, availability: "available" },
      { id: "off-brufen-farmamia", pharmacyId: "farmamia", unitPriceCents: 350, availability: "available" },
    ] },
    { id: "moment-200-12", name: "Moment 200 mg · 12 compresse rivestite", quantity: 1, offers: [
      { id: "off-moment-farmaglobo", pharmacyId: "farmaglobo", unitPriceCents: 339, availability: "available" },
      { id: "off-moment-drmax", pharmacyId: "drmax", unitPriceCents: 429, availability: "available" },
    ] },
    { id: "nurofen-200-12", name: "Nurofen 200 mg · 12 compresse rivestite", quantity: 1, offers: [
      { id: "off-nurofen-openfarma", pharmacyId: "openfarma", unitPriceCents: 341, availability: "available" },
      { id: "off-nurofen-drmax", pharmacyId: "drmax", unitPriceCents: 377, availability: "available" },
    ] },
    { id: "voltaren-1-60g", name: "Voltaren Emulgel 1% · tubo da 60 g", quantity: 1, offers: [
      { id: "off-voltaren-drmax", pharmacyId: "drmax", unitPriceCents: 839, availability: "available" },
      { id: "off-voltaren-farmamia", pharmacyId: "farmamia", unitPriceCents: 790, availability: "available" },
    ] },
  ];
  return mergeVerifiedData({ products, pharmacies });
}

function readState(): DemoState {
  if (typeof window === "undefined") return initialDemoState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialDemoState();
    const saved = JSON.parse(raw) as DemoState;
    if (!Array.isArray(saved.products) || !Array.isArray(saved.pharmacies)) return initialDemoState();
    return mergeVerifiedData({ products: saved.products, pharmacies: saved.pharmacies });
  } catch {
    return initialDemoState();
  }
}

function availabilityLabel(value: Availability) {
  if (value === "available") return "Disponibile";
  if (value === "unavailable") return "Esaurito";
  return "Da verificare";
}

function availabilityClass(value: Availability) {
  if (value === "available") return "stock stock--available";
  if (value === "unavailable") return "stock stock--unavailable";
  return "stock stock--unknown";
}

function ProductCard({
  product,
  allProducts,
  pharmacies,
  onProductChange,
  onRemoveProduct,
  onOfferChange,
  onOfferRemove,
  onAddOffer,
}: {
  product: Product;
  allProducts: Product[];
  pharmacies: Pharmacy[];
  onProductChange: (patch: Partial<Product>) => void;
  onRemoveProduct: () => void;
  onOfferChange: (offerId: string, patch: Partial<Offer>) => void;
  onOfferRemove: (offerId: string) => void;
  onAddOffer: (pharmacyId: string) => void;
}) {
  const [newOfferStore, setNewOfferStore] = useState("");
  const activeOffers = product.offers.filter((offer) => offer.priceSourceType !== "candidate");
  const candidateOffers = product.offers.filter((offer) => offer.priceSourceType === "candidate");
  const availableOfferCount = activeOffers.filter((offer) => offer.priceSourceType !== "demo" && offer.availability === "available").length;
  const unusedPharmacies = pharmacies.filter((pharmacy) => !product.offers.some((offer) => offer.pharmacyId === pharmacy.id));
  const eligibleParents = allProducts.filter((item) => item.id !== product.id && !item.alternativeForId);
  const parentProduct = allProducts.find((item) => item.id === product.alternativeForId);

  return (
    <article className="product-card">
      <div className="product-heading">
        <div className="product-icon"><Pill size={19} strokeWidth={1.8} /></div>
        <div className="product-title-wrap">
          <label className="sr-only" htmlFor={`name-${product.id}`}>Nome e confezione</label>
          <input
            id={`name-${product.id}`}
            className="product-name-input"
            value={product.name}
            onChange={(event) => onProductChange({ name: event.target.value })}
            aria-label="Nome e confezione del prodotto"
            placeholder="Nome del prodotto e confezione"
          />
          <div className="product-meta">
            <span>{availableOfferCount} offerte disponibili</span>
            {product.offers.some((offer) => offer.availability === "unknown") && <span className="meta-dot">• dato da verificare</span>}
          </div>
        </div>
        <div className="quantity-control" aria-label="Quantità confezioni">
          <button type="button" className="quantity-btn" aria-label="Diminuisci quantità" onClick={() => onProductChange({ quantity: Math.max(1, product.quantity - 1) })}>−</button>
          <input
            type="number"
            min={1}
            max={99}
            value={product.quantity}
            onChange={(event) => onProductChange({ quantity: Math.max(1, Number(event.target.value) || 1) })}
            aria-label={`Quantità per ${product.name}`}
          />
          <button type="button" className="quantity-btn" aria-label="Aumenta quantità" onClick={() => onProductChange({ quantity: Math.min(99, product.quantity + 1) })}>+</button>
          <span className="quantity-caption">conf.</span>
        </div>
        <button type="button" className="icon-button delete-product" onClick={onRemoveProduct} aria-label={`Rimuovi ${product.name}`} title="Rimuovi prodotto">
          <Trash2 size={17} />
        </button>
      </div>

      <div className="alternative-control">
        <label htmlFor={`role-${product.id}`}>Confronta come</label>
        <select
          id={`role-${product.id}`}
          value={product.alternativeForId ?? ""}
          onChange={(event) => onProductChange({ alternativeForId: event.target.value || null, alternativeConfirmed: false })}
        >
          <option value="">Prodotto richiesto</option>
          {eligibleParents.map((parent) => <option key={parent.id} value={parent.id}>Alternativa manuale a: {parent.name}</option>)}
        </select>
        {product.alternativeForId && (
          <div className={`alternative-confirmation ${product.alternativeConfirmed ? "is-confirmed" : ""}`}>
            <Info size={14} />
            <span>{product.alternativeConfirmed
              ? `Alternativa scelta da te per “${parentProduct?.name ?? "prodotto richiesto"}”.`
              : `Candidato manuale per “${parentProduct?.name ?? "prodotto richiesto"}”: non verrà usato senza conferma.`}</span>
            <button type="button" onClick={() => onProductChange({ alternativeConfirmed: !product.alternativeConfirmed })}>
              {product.alternativeConfirmed ? "Escludi" : "Conferma e confronta"}
            </button>
          </div>
        )}
      </div>

      <div className="offer-list">
        {activeOffers.length === 0 && <p className="empty-offers">Nessuna offerta con prezzo verificato o inserito. Puoi consultare i negozi candidati qui sotto.</p>}
        {activeOffers.map((offer) => {
          const pharmacy = pharmacies.find((item) => item.id === offer.pharmacyId);
          return (
            <div className={`offer-row ${offer.availability !== "available" ? "offer-row--muted" : ""}`} key={offer.id}>
              <div className="offer-pharmacy">
                <Store size={15} />
                <select
                  value={offer.pharmacyId}
                  onChange={(event) => onOfferChange(offer.id, { pharmacyId: event.target.value })}
                  aria-label={`Farmacia per offerta ${product.name}`}
                >
                  {pharmacies.map((store) => <option value={store.id} key={store.id}>{store.name}</option>)}
                </select>
              </div>
              <label className="price-field">
                <span>€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={centsToInput(offer.unitPriceCents)}
                  onChange={(event) => onOfferChange(offer.id, { unitPriceCents: parseEuroInput(event.target.value) })}
                  aria-label={`Prezzo unitario ${product.name} da ${pharmacy?.name ?? "farmacia"}`}
                  placeholder="0,00"
                />
              </label>
              <select
                className={availabilityClass(offer.availability)}
                value={offer.availability}
                onChange={(event) => onOfferChange(offer.id, { availability: event.target.value as Availability })}
                aria-label={`Disponibilità offerta ${product.name}`}
              >
                <option value="available">Disponibile</option>
                <option value="unavailable">Esaurito</option>
                <option value="unknown">Da verificare</option>
              </select>
              <button type="button" className="icon-button remove-offer" onClick={() => onOfferRemove(offer.id)} aria-label="Rimuovi offerta">
                <Trash2 size={15} />
              </button>
              {offer.priceSourceType === "verified" ? (
                <div className="offer-evidence">
                  <span className="offer-source-pill offer-source-pill--verified" title={offer.exactProductTitle}>Prezzo verificato</span>
                  {offer.availabilityText && <span title={offer.availabilityText}>Disponibilità rilevata</span>}
                  {offer.checkedOn && <time dateTime={offer.checkedOn}>Rilevato il {offer.checkedOn.split("-").reverse().join("/")}</time>}
                  {offer.priceSourceUrl && <a href={offer.priceSourceUrl} target="_blank" rel="noreferrer">Fonte prezzo</a>}
                  {offer.authorizationEvidenceUrl && <a href={offer.authorizationEvidenceUrl} target="_blank" rel="noreferrer">Autorizzazione</a>}
                </div>
              ) : (
                <div className="offer-evidence">
                  <span className="offer-source-pill">{offer.priceSourceType === "manual" ? "Inserito manualmente" : "Esempio demo · non verificato"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {candidateOffers.length > 0 && (
        <details className="candidate-offers">
          <summary>{candidateOffers.length} altri negozi candidati · prezzi e spedizione da verificare</summary>
          <p className="candidate-note">Negozi individuati nelle liste Trovaprezzi consultate il 20/10/2026. Non importiamo prezzi o spedizioni del comparatore e questi candidati non partecipano al calcolo finché non inserisci dati verificati sul venditore. La presenza in lista non conferma l’autorizzazione ministeriale né costituisce un censimento completo del mercato.</p>
          <div className="candidate-list">
            {candidateOffers.map((offer) => {
              const pharmacy = pharmacies.find((item) => item.id === offer.pharmacyId);
              return (
                <div className="candidate-row" key={offer.id}>
                  <div className="candidate-description">
                    <strong>{pharmacy?.name ?? "Farmacia candidata"}</strong>
                    <span title={offer.exactProductTitle}>{offer.exactProductTitle}</span>
                  </div>
                  <div className="candidate-actions">
                    {offer.comparisonSourceUrl && <a href={offer.comparisonSourceUrl} target="_blank" rel="noreferrer">Scheda Trovaprezzi</a>}
                    {offer.comparisonStoreUrl && <a href={offer.comparisonStoreUrl} target="_blank" rel="noreferrer">Profilo negozio</a>}
                    <button type="button" onClick={() => onOfferChange(offer.id, { priceSourceType: "manual", unitPriceCents: null, availability: "unknown" })}>Inserisci prezzo verificato</button>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}

      <div className="add-offer-row">
        {unusedPharmacies.length > 0 ? (
          <>
            <select value={newOfferStore} onChange={(event) => setNewOfferStore(event.target.value)} aria-label="Seleziona farmacia per nuova offerta">
              <option value="">Aggiungi offerta da…</option>
              {unusedPharmacies.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
            <button type="button" className="text-button" disabled={!newOfferStore} onClick={() => { onAddOffer(newOfferStore); setNewOfferStore(""); }}>
              <Plus size={15} /> Aggiungi offerta
            </button>
          </>
        ) : (
          <span className="add-offer-hint">Per aggiungere un altro negozio, crealo nella sezione “Regole spedizione”.</span>
        )}
      </div>
    </article>
  );
}

function BasketResult({ basket, pharmacies }: { basket: Basket; pharmacies: Pharmacy[] }) {
  const grouped = new Map<string, typeof basket.lines>();
  basket.lines.forEach((line) => {
    const group = grouped.get(line.pharmacyId) ?? [];
    group.push(line);
    grouped.set(line.pharmacyId, group);
  });

  return (
    <div className="result-content">
      <div className={`result-state ${basket.complete ? "result-state--complete" : "result-state--partial"}`}>
        {basket.complete ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <div>
          <strong>{basket.complete ? "Carrello completo" : "Carrello parziale"}</strong>
          <span>{basket.coveredCount} di {basket.requestedCount} prodotti coperti</span>
        </div>
        <span className="coverage-pill">{basket.coveredCount}/{basket.requestedCount}</span>
      </div>

      {!basket.complete && basket.missing.length > 0 && (
        <div className="missing-box">
          <h3>Da coprire</h3>
          {basket.missing.map((item) => (
            <div className="missing-item" key={item.productId}>
              <span>{item.productName || "Prodotto senza nome"}</span>
              <small>{item.reason}</small>
            </div>
          ))}
        </div>
      )}

      {grouped.size > 0 ? (
        <div className="basket-groups">
          {[...grouped.entries()].map(([pharmacyId, lines]) => {
            const pharmacy = pharmacies.find((item) => item.id === pharmacyId);
            const subtotal = basket.subtotalByPharmacy[pharmacyId] ?? 0;
            const delivery = basket.shippingByPharmacy[pharmacyId] ?? 0;
            const remaining = nextLowerShippingDistance(pharmacy, subtotal, delivery);
            return (
              <section className="basket-group" key={pharmacyId}>
                <div className="basket-store-heading">
                  <div className="store-mark"><Store size={16} /></div>
                  <div><strong>{pharmacy?.name ?? "Farmacia"}</strong><span>{lines.length} {lines.length === 1 ? "articolo" : "articoli"}</span></div>
                  <span className="store-total">{formatEuro(subtotal + delivery)}</span>
                </div>
                <div className="basket-lines">
                  {lines.map((line) => (
                    <div className="basket-line" key={line.productId}>
                      <span className="basket-line-copy">
                        {line.productName}<small> × {line.quantity}</small>
                        <small className="basket-source-copy">
                          {line.priceSourceType === "verified" ? `Prezzo verificato il ${line.checkedOn?.split("-").reverse().join("/") ?? ""}` : line.priceSourceType === "manual" ? "Prezzo inserito manualmente" : "Prezzo demo non verificato"}
                          {line.priceSourceType === "verified" && line.priceSourceUrl && <> · <a href={line.priceSourceUrl} target="_blank" rel="noreferrer">fonte</a></>}
                        </small>
                      </span>
                      <strong>{formatEuro(line.lineTotalCents)}</strong>
                    </div>
                  ))}
                </div>
                <div className="shipping-line"><span>Subtotale prodotti</span><span>{formatEuro(subtotal)}</span></div>
                <div className="shipping-line"><span><Truck size={14} /> Spedizione</span><span>{delivery === 0 ? "Gratuita" : formatEuro(delivery)}</span></div>
                {delivery > 0 && remaining !== null && remaining > 0 && (
                  <div className="threshold-note">Mancano {formatEuro(remaining)} {pharmacy?.shippingBands?.length ? "al prossimo scaglione di spedizione più economico" : "alla soglia di spedizione gratuita"}.</div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="no-offers"><CircleHelp size={21} /><p>Non ci sono offerte calcolabili. Inserisci almeno un’offerta disponibile con prezzo e regola di spedizione.</p></div>
      )}

      {basket.coveredCount > 0 && <div className="total-box">
        <div><span>Prodotti</span><strong>{formatEuro(basket.productsTotalCents)}</strong></div>
        <div><span>Spedizioni</span><strong>{formatEuro(basket.shippingTotalCents)}</strong></div>
        <div className="grand-total"><span>{basket.complete ? "Totale stimato" : "Totale parziale stimato"}</span><strong>{formatEuro(basket.totalCents)}</strong></div>
      </div>}
    </div>
  );
}

function SavingsSummary({ basket, benchmarkCents, maxPharmacies }: { basket: Basket; benchmarkCents: number | null; maxPharmacies: 1 | 2 }) {
  if (!basket.complete) {
    return (
      <div className="savings-summary savings-summary--unavailable">
        <strong>Risparmio non calcolabile</strong>
        <small>{benchmarkCents !== null ? `Riferimento per ordini separati: ${formatEuro(benchmarkCents)}. ` : ""}Il carrello è incompleto entro il limite di {maxPharmacies} {maxPharmacies === 1 ? "farmacia" : "farmacie"}; prima completa gli articoli mancanti.</small>
      </div>
    );
  }
  if (benchmarkCents === null) {
    return (
      <div className="savings-summary savings-summary--unavailable">
        <strong>Benchmark non disponibile</strong>
        <small>Per almeno un prodotto manca un prezzo o una regola di spedizione/minimo valida per un ordine singolo.</small>
      </div>
    );
  }

  const differenceCents = benchmarkCents - basket.totalCents;
  const variant = differenceCents > 0 ? "positive" : differenceCents < 0 ? "negative" : "neutral";
  const label = differenceCents > 0
    ? "Risparmio rispetto agli ordini separati"
    : differenceCents < 0
      ? "Costo aggiuntivo rispetto agli ordini separati"
      : "Nessuna differenza rispetto agli ordini separati";
  return (
    <div className={`savings-summary savings-summary--${variant}`}>
      <div className="savings-summary-top"><strong>{label}</strong><b>{formatEuro(Math.abs(differenceCents))}</b></div>
      <small>Confronto: ogni prodotto acquistato da solo al suo totale individuale migliore; spedizione e minimo d’ordine calcolati per quel singolo ordine.</small>
    </div>
  );
}

function nextLowerShippingDistance(pharmacy: Pharmacy | undefined, subtotalCents: number, currentFeeCents: number): number | null {
  if (!pharmacy || currentFeeCents <= 0) return null;
  if (pharmacy.shippingBands?.length) {
    let previousMax = -1;
    for (const band of pharmacy.shippingBands) {
      const firstSubtotalInBand = previousMax + 1;
      if (band.feeCents < currentFeeCents && firstSubtotalInBand > subtotalCents) return firstSubtotalInBand - subtotalCents;
      if (band.maxSubtotalCents === null) break;
      previousMax = band.maxSubtotalCents;
    }
    return null;
  }
  if (pharmacy.freeThresholdCents === null) return null;
  const freeAt = pharmacy.thresholdMode === "gte" ? pharmacy.freeThresholdCents : pharmacy.freeThresholdCents + 1;
  return freeAt > subtotalCents ? freeAt - subtotalCents : null;
}

function getMinimumOrderPolicy(pharmacy: Pharmacy): MinimumOrderPolicy {
  return pharmacy.minimumOrderPolicy ?? (pharmacy.minimumOrderCents !== undefined ? "minimum" : "unknown");
}

function shippingRuleDescription(pharmacy: Pharmacy): string {
  const minimumPolicy = getMinimumOrderPolicy(pharmacy);
  const minimumOrder = minimumPolicy === "none"
    ? "nessun minimo · "
    : minimumPolicy === "minimum"
      ? pharmacy.minimumOrderCents !== undefined ? `ordine minimo ${formatEuro(pharmacy.minimumOrderCents)} · ` : "importo minimo da inserire · "
      : "minimo ordine da verificare · ";
  if (pharmacy.shippingBands?.length) {
    let previousMax = -1;
    const bands = pharmacy.shippingBands.map((band, index) => {
      if (band.feeCents === 0) return `gratuita oltre ${formatEuro(previousMax)}`;
      if (band.maxSubtotalCents === null) return `${formatEuro(band.feeCents)} senza soglia`;
      const label = index === 0 ? "fino a" : "poi fino a";
      const text = `${formatEuro(band.feeCents)} ${label} ${formatEuro(band.maxSubtotalCents)}`;
      previousMax = band.maxSubtotalCents;
      return text;
    }).join("; ");
    return minimumOrder + bands;
  }
  if (pharmacy.freeThresholdCents === null) return minimumOrder + (pharmacy.shippingFeeCents === null ? "Spedizione da verificare" : `${formatEuro(pharmacy.shippingFeeCents)} · soglia gratuita non indicata`);
  const comparison = pharmacy.thresholdMode === "gte" ? "da" : "oltre";
  return `${minimumOrder}${pharmacy.shippingFeeCents === null ? "costo standard n/d" : formatEuro(pharmacy.shippingFeeCents)} · gratuita ${comparison} ${formatEuro(pharmacy.freeThresholdCents)}`;
}

function Home() {
  const [data, setData] = useState<DemoState>(readState);
  const [newProductName, setNewProductName] = useState("");
  const [newPharmacyName, setNewPharmacyName] = useState("");
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [pharmacyLimit, setPharmacyLimit] = useState<1 | 2>(2);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* demo works in memory if storage is blocked */ }
  }, [data]);

  const optimization = useMemo(
    () => optimizeCart(data.products, data.pharmacies, pharmacyLimit),
    [data.products, data.pharmacies, pharmacyLimit],
  );
  const result = optimization.complete ?? optimization.partial;
  const requestedProducts = data.products.filter((product) => !product.alternativeForId);
  const manualAlternatives = data.products.filter((product) => product.alternativeForId);
  const verifiedPriceCount = data.products.reduce((total, product) => total + product.offers.filter((offer) => offer.priceSourceType === "verified").length, 0);
  const candidateOfferCount = data.products.reduce((total, product) => total + product.offers.filter((offer) => offer.priceSourceType === "candidate").length, 0);
  const knownShippingCount = data.pharmacies.filter((pharmacy) => pharmacy.shippingFeeCents !== null || pharmacy.freeThresholdCents !== null || Boolean(pharmacy.shippingBands?.length)).length;
  const completeCount = requestedProducts.filter((product) => {
    const confirmedAlternatives = manualAlternatives.filter((candidate) => candidate.alternativeForId === product.id && candidate.alternativeConfirmed);
    return [product, ...confirmedAlternatives].some((item) => item.offers.some((offer) =>
      offer.priceSourceType !== "demo" && offer.priceSourceType !== "candidate" &&
      offer.availability === "available" && offer.unitPriceCents !== null && offer.unitPriceCents > 0,
    ));
  }).length;

  const updateProduct = (productId: string, patch: Partial<Product>) => {
    setData((current) => ({
      ...current,
      products: current.products.map((product) => product.id === productId ? { ...product, ...patch } : product),
    }));
  };

  const updateOffer = (productId: string, offerId: string, patch: Partial<Offer>) => {
    const priceEdited = Object.prototype.hasOwnProperty.call(patch, "unitPriceCents");
    const pharmacyEdited = Object.prototype.hasOwnProperty.call(patch, "pharmacyId");
    const candidatePromoted = patch.priceSourceType === "manual";
    const manualized = priceEdited || pharmacyEdited || candidatePromoted;
    setData((current) => ({
      ...current,
      products: current.products.map((product) => product.id === productId
        ? { ...product, offers: product.offers.map((offer) => offer.id === offerId ? {
            ...offer,
            ...patch,
            ...(pharmacyEdited ? { unitPriceCents: null, availability: "unknown" as const } : {}),
            ...(manualized ? {
              priceSourceType: "manual" as const,
              priceSourceUrl: undefined,
              authorizationEvidenceUrl: undefined,
              exactProductTitle: undefined,
              availabilityText: undefined,
              comparisonSourceUrl: undefined,
              comparisonStoreUrl: undefined,
              checkedOn: undefined,
            } : {}),
            ...(Object.prototype.hasOwnProperty.call(patch, "availability") ? { availabilityText: undefined } : {}),
          } : offer) }
        : product),
    }));
  };

  const addProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newProductName.trim();
    if (!name || data.products.length >= 10) return;
    setData((current) => ({
      ...current,
      products: [...current.products, { id: createId("product"), name, quantity: 1, offers: [] }],
    }));
    setNewProductName("");
  };

  const addPharmacy = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newPharmacyName.trim();
    if (!name || data.pharmacies.some((pharmacy) => pharmacy.name.toLowerCase() === name.toLowerCase())) return;
    setData((current) => ({
      ...current,
      pharmacies: [...current.pharmacies, {
        id: createId("pharmacy"), name, shippingFeeCents: null, freeThresholdCents: null,
        minimumOrderPolicy: "unknown", minimumOrderPolicySource: "unknown", thresholdMode: "gte", shippingSource: "Inserito manualmente",
      }],
    }));
    setNewPharmacyName("");
  };

  const updatePharmacy = (pharmacyId: string, patch: Partial<Pharmacy>) => {
    const shippingCostEdited = ["shippingFeeCents", "freeThresholdCents", "thresholdMode"].some((key) => Object.prototype.hasOwnProperty.call(patch, key));
    const shippingRuleEdited = shippingCostEdited || ["minimumOrderCents", "minimumOrderPolicy"].some((key) => Object.prototype.hasOwnProperty.call(patch, key));
    const minimumPolicyEdited = ["minimumOrderCents", "minimumOrderPolicy"].some((key) => Object.prototype.hasOwnProperty.call(patch, key));
    setData((current) => ({
      ...current,
      pharmacies: current.pharmacies.map((pharmacy) => pharmacy.id === pharmacyId ? {
        ...pharmacy,
        ...patch,
        ...(shippingCostEdited ? { shippingBands: undefined } : {}),
        ...(shippingRuleEdited ? { shippingSource: "Modificato manualmente", shippingSourceUrl: undefined, shippingCheckedOn: undefined } : {}),
        ...(minimumPolicyEdited ? { minimumOrderPolicySource: "manual" as const } : {}),
      } : pharmacy),
    }));
  };

  const resetDemo = () => {
    setData(initialDemoState());
    setNewProductName("");
    setNewPharmacyName("");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#top" className="brand" aria-label="Farmia demo, inizio pagina">
          <span className="brand-mark"><Pill size={19} /></span>
          <span>farmia<span className="brand-dot">.</span></span>
          <span className="brand-tag">DEMO</span>
        </a>
        <div className="topbar-right">
          <span className="demo-indicator"><span /> Verifiche + candidati</span>
          <button type="button" className="reset-button" onClick={resetDemo}><RotateCcw size={15} /> Ripristina demo</button>
        </div>
      </header>

      <main className="page-main" id="top">
        <section className="intro-row">
          <div className="intro-copy">
            <div className="eyebrow"><span /> IL TUO CARRELLO, CONFRONTATO</div>
            <h1>La tua lista.<br /><em>Il totale più chiaro.</em></h1>
            <p>Inserisci i prodotti e confronta l’ordine in una sola farmacia o al massimo due, sommando le soglie di spedizione sugli articoli accorpati.</p>
          </div>
        <div className="intro-side-note">
            <div className="note-icon"><Info size={17} /></div>
            <p>{verifiedPriceCount} prezzi sui siti dei venditori sono stati rilevati il 20/10/2026. Altri {candidateOfferCount} negozi-prodotto sono candidati trovati su Trovaprezzi: non importiamo quei prezzi e non entrano nel calcolo finché non inserisci dati verificati.</p>
          </div>
        </section>

        <div className="notice-bar" role="note">
          <Info size={17} />
          <span><strong>Solo confronto, nessuna vendita.</strong> Il motore usa offerte verificate o prezzi inseriti manualmente, mai esempi demo o candidati Trovaprezzi; questi ultimi hanno prezzo e spedizione da controllare sul venditore. Le rilevazioni sono del 20/10/2026, non live: riconferma importi, disponibilità e soglie sul sito del venditore.</span>
        </div>

        <section className="settings-strip" aria-label="Impostazioni carrello">
          <div className="settings-copy">
            <span className="settings-icon"><ShoppingBasket size={18} /></span>
            <div><strong>Ordine accorpato</strong><small>Puoi limitarti a una farmacia o consentirne al massimo due; gli articoli dello stesso negozio condividono una spedizione.</small></div>
          </div>
          <div className="all-pharmacies-badge"><Store size={15} /> Max 2 farmacie</div>
        </section>

        <div className="workspace-grid">
          <section className="list-column" aria-label="Lista prodotti">
            <div className="section-heading">
              <div>
                <div className="step-label"><span>01</span> LA TUA LISTA</div>
                <h2>Prodotti da confrontare</h2>
                <p>{requestedProducts.length} prodotti richiesti · {manualAlternatives.length} alternative manuali · {completeCount} richiesti con offerta</p>
              </div>
              <span className="editable-tag">Modificabile</span>
            </div>

            <form className="add-product-form" onSubmit={addProduct}>
              <div className="add-product-icon"><Plus size={19} /></div>
              <input
                value={newProductName}
                onChange={(event) => setNewProductName(event.target.value)}
                placeholder="Aggiungi un prodotto e la confezione (es. nome, dosaggio, formato)"
                aria-label="Nome e confezione del nuovo prodotto"
                maxLength={100}
                disabled={data.products.length >= 10}
              />
              <button type="submit" disabled={!newProductName.trim() || data.products.length >= 10}><Plus size={16} /> Aggiungi</button>
            </form>
            {data.products.length >= 10 && <p className="limit-note">Limite demo raggiunto: 10 prodotti per mantenere rapido il calcolo.</p>}

            <div className="product-stack">
              {data.products.length === 0 ? (
                <div className="empty-list"><Pill size={23} /><strong>La lista è vuota</strong><span>Aggiungi un prodotto qui sopra per iniziare.</span></div>
              ) : data.products.map((product, index) => (
                <div className="numbered-product" key={product.id}>
                  <span className="product-number">{String(index + 1).padStart(2, "0")}</span>
                  <ProductCard
                    product={product}
                    allProducts={data.products}
                    pharmacies={data.pharmacies}
                    onProductChange={(patch) => updateProduct(product.id, patch)}
                    onRemoveProduct={() => setData((current) => ({
                      ...current,
                      products: current.products
                        .filter((item) => item.id !== product.id)
                        .map((item) => item.alternativeForId === product.id ? { ...item, alternativeForId: null, alternativeConfirmed: false } : item),
                    }))}
                    onOfferChange={(offerId, patch) => updateOffer(product.id, offerId, patch)}
                    onOfferRemove={(offerId) => updateProduct(product.id, { offers: product.offers.filter((offer) => offer.id !== offerId) })}
                    onAddOffer={(pharmacyId) => updateProduct(product.id, {
                      offers: [...product.offers, { id: createId("offer"), pharmacyId, unitPriceCents: null, availability: "unknown", priceSourceType: "manual" }],
                    })}
                  />
                </div>
              ))}
            </div>

            <section className="shipping-settings" aria-labelledby="shipping-heading">
              <button type="button" className="shipping-toggle" onClick={() => setIsRulesOpen((open) => !open)} aria-expanded={isRulesOpen}>
                <span className="shipping-toggle-icon"><Truck size={18} /></span>
                <span className="shipping-toggle-copy"><strong id="shipping-heading">Regole di spedizione</strong><small>{knownShippingCount} negozi con almeno una regola nota su {data.pharmacies.length}; verifica o compila le altre.</small></span>
                <ChevronDown className={isRulesOpen ? "chevron-open" : ""} size={18} />
              </button>
              {isRulesOpen && (
                <div className="shipping-body">
                  <div className="shipping-header-row"><span>Farmacia</span><span>Spedizione</span><span>Gratuita</span><span>Min. ordine</span><span>Regola</span></div>
                  {data.pharmacies.map((pharmacy) => (
                    <div className="shipping-rule-row" key={pharmacy.id}>
                      <div className="shipping-pharmacy-name">
                        <div className="shipping-pharmacy-title"><Store size={14} /><span>{pharmacy.name}</span>{pharmacy.shippingSourceUrl && <a href={pharmacy.shippingSourceUrl} target="_blank" rel="noreferrer" title={`Fonte spedizione ${pharmacy.name}`}>fonte</a>}{pharmacy.directorySourceUrl && <a href={pharmacy.directorySourceUrl} target="_blank" rel="noreferrer" title={`Profilo comparatore ${pharmacy.name}`}>profilo</a>}</div>
                        <small>{shippingRuleDescription(pharmacy)} · {pharmacy.shippingSource}</small>
                      </div>
                      <label className="shipping-input"><span>€</span><input type="number" min="0" step="0.01" placeholder="n/d" value={centsToInput(pharmacy.shippingFeeCents)} onChange={(event) => updatePharmacy(pharmacy.id, { shippingFeeCents: parseEuroInput(event.target.value) })} aria-label={`Costo spedizione ${pharmacy.name}`} /></label>
                      <label className="shipping-input"><span>€</span><input type="number" min="0" step="0.01" placeholder="nessuna" value={centsToInput(pharmacy.freeThresholdCents)} onChange={(event) => updatePharmacy(pharmacy.id, { freeThresholdCents: parseEuroInput(event.target.value) })} aria-label={`Soglia spedizione gratuita ${pharmacy.name}`} /></label>
                      <div className="minimum-order-control">
                        <select value={getMinimumOrderPolicy(pharmacy)} onChange={(event) => {
                          const policy = event.target.value as MinimumOrderPolicy;
                          updatePharmacy(pharmacy.id, { minimumOrderPolicy: policy, minimumOrderCents: policy === "minimum" ? pharmacy.minimumOrderCents : undefined });
                        }} aria-label={`Policy minimo d’ordine ${pharmacy.name}`}>
                          <option value="unknown">Da verificare</option><option value="none">Nessuno</option><option value="minimum">Importo</option>
                        </select>
                        {getMinimumOrderPolicy(pharmacy) === "minimum" && <label className="shipping-input minimum-order-input"><span>€</span><input type="number" min="0" step="0.01" placeholder="importo" value={centsToInput(pharmacy.minimumOrderCents ?? null)} onChange={(event) => updatePharmacy(pharmacy.id, { minimumOrderPolicy: "minimum", minimumOrderCents: parseEuroInput(event.target.value) ?? undefined })} aria-label={`Importo minimo d’ordine ${pharmacy.name}`} /></label>}
                      </div>
                      <select value={pharmacy.thresholdMode} onChange={(event) => updatePharmacy(pharmacy.id, { thresholdMode: event.target.value as ThresholdMode })} aria-label={`Regola soglia ${pharmacy.name}`}>
                        <option value="gte">Da (≥)</option><option value="gt">Oltre (&gt;)</option>
                      </select>
                    </div>
                  ))}
                  <form className="add-pharmacy-form" onSubmit={addPharmacy}>
                    <input value={newPharmacyName} onChange={(event) => setNewPharmacyName(event.target.value)} placeholder="Aggiungi una farmacia" aria-label="Nome farmacia da aggiungere" maxLength={50} />
                    <button type="submit" disabled={!newPharmacyName.trim()}><Plus size={15} /> Aggiungi negozio</button>
                  </form>
                  <p className="shipping-footnote">Le regole note provengono dai siti dei venditori (rilevazione 20/10/2026); per AmicaFarmacia si applica lo scaglione del subtotale. Per i negozi candidati non sono stati importati costi o soglie da Trovaprezzi. Il minimo “Da verificare” esclude quel negozio dal calcolo; scegli “Nessuno” solo dopo aver controllato le condizioni, oppure inserisci l’importo minimo.</p>
                </div>
              )}
            </section>
          </section>

          <aside className="result-column" aria-label="Risultato ottimizzazione">
            <div className="result-heading">
              <div className="step-label"><span>02</span> RISULTATO</div>
              <h2>Il carrello ottimizzato</h2>
              <p>Minimizza prodotti e spedizioni entro il limite scelto.</p>
            </div>
            <div className="pharmacy-limit-control" role="group" aria-label="Numero massimo di farmacie">
              <div className="pharmacy-limit-caption"><strong>Limita le consegne</strong><small>Le soglie gratuite si applicano al subtotale combinato.</small></div>
              <button type="button" className={pharmacyLimit === 1 ? "is-selected" : ""} aria-pressed={pharmacyLimit === 1} onClick={() => setPharmacyLimit(1)}>1 farmacia</button>
              <button type="button" className={pharmacyLimit === 2 ? "is-selected" : ""} aria-pressed={pharmacyLimit === 2} onClick={() => setPharmacyLimit(2)}>Massimo 2</button>
            </div>
            <div className="result-card">
              <div className="result-card-top"><span className="live-dot" /> CALCOLO AUTOMATICO</div>
              {result ? <BasketResult basket={result} pharmacies={data.pharmacies} /> : (
                <div className="no-offers empty-result"><PackageCheck size={24} /><strong>Pronto quando vuoi</strong><p>Aggiungi prodotti e offerte disponibili per calcolare il carrello.</p></div>
              )}
              {result && <SavingsSummary basket={result} benchmarkCents={optimization.separateOrderBenchmarkCents} maxPharmacies={pharmacyLimit} />}
              {result && result.complete && <div className="result-source-note"><CheckCircle2 size={15} /><span>Copertura completa · {Object.keys(result.subtotalByPharmacy).length} {Object.keys(result.subtotalByPharmacy).length === 1 ? "farmacia usata" : "farmacie usate"} (limite {pharmacyLimit})</span></div>}
            </div>
            <div className="result-explainer"><CircleHelp size={17} /><p>Il benchmark del risparmio è l’acquisto separato di ogni prodotto, con la sua migliore offerta e la relativa spedizione. Il carrello accorpato somma invece gli articoli per farmacia e ricalcola soglia, scaglione e minimo d’ordine.</p></div>
          </aside>
        </div>

        <footer className="page-footer">
          <div className="footer-brand"><span className="brand-mark"><Pill size={16} /></span><strong>farmia<span className="brand-dot">.</span></strong></div>
          <p>Prototipo dimostrativo, non vende medicinali e non fornisce indicazioni terapeutiche. Verifica prezzo, disponibilità e totale sul sito del venditore.</p>
          <span className="footer-version">DEMO · DATI LOCALI</span>
        </footer>
      </main>
    </div>
  );
}

export default Home;
