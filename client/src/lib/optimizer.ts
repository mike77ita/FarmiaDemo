export type Availability = "available" | "unavailable" | "unknown";
export type ThresholdMode = "gte" | "gt";
export type OfferSourceType = "demo" | "verified" | "manual" | "candidate";
export type MinimumOrderPolicy = "unknown" | "none" | "minimum";
export type MinimumOrderPolicySource = "unknown" | "verified" | "manual";

export type Pharmacy = {
  id: string;
  name: string;
  domain?: string;
  siteUrl?: string;
  directorySourceUrl?: string;
  shippingFeeCents: number | null;
  freeThresholdCents: number | null;
  minimumOrderCents?: number;
  minimumOrderPolicy?: MinimumOrderPolicy;
  minimumOrderPolicySource?: MinimumOrderPolicySource;
  thresholdMode: ThresholdMode;
  shippingBands?: Array<{ maxSubtotalCents: number | null; feeCents: number }>;
  shippingSource: string;
  shippingSourceUrl?: string;
  shippingCheckedOn?: string;
  authorizationEvidenceUrl?: string;
};

export type Offer = {
  id: string;
  pharmacyId: string;
  unitPriceCents: number | null;
  availability: Availability;
  priceSourceType?: OfferSourceType;
  priceSourceUrl?: string;
  authorizationEvidenceUrl?: string;
  exactProductTitle?: string;
  availabilityText?: string;
  comparisonSourceUrl?: string;
  comparisonStoreUrl?: string;
  checkedOn?: string;
};

export type Product = {
  id: string;
  name: string;
  quantity: number;
  offers: Offer[];
  alternativeForId?: string | null;
  alternativeConfirmed?: boolean;
};

export type BasketLine = {
  productId: string;
  productName: string;
  quantity: number;
  pharmacyId: string;
  unitPriceCents: number;
  lineTotalCents: number;
  priceSourceType?: OfferSourceType;
  priceSourceUrl?: string;
  checkedOn?: string;
};

export type Basket = {
  complete: boolean;
  coveredCount: number;
  requestedCount: number;
  productsTotalCents: number;
  shippingTotalCents: number;
  totalCents: number;
  lines: BasketLine[];
  shippingByPharmacy: Record<string, number>;
  subtotalByPharmacy: Record<string, number>;
  missing: Array<{ productId: string; productName: string; reason: string }>;
};

export type OptimizationResult = {
  complete: Basket | null;
  partial: Basket | null;
  coverageCounts: number[];
  separateOrderBenchmarkCents: number | null;
};

type ProductGroup = {
  id: string;
  requestedProduct: Product;
  candidates: Product[];
};

type Assignment = {
  groupId: string;
  product: Product;
  pharmacy: Pharmacy;
  offer: Offer;
};

type PharmacySubset = {
  mask: number;
  costCents: number;
  shippingCents: number;
  assignments: Assignment[];
};

type State = {
  costCents: number;
  assignments: Assignment[];
  pharmacyCount: number;
};

function shippingCost(pharmacy: Pharmacy, subtotalCents: number): number | null {
  const minimumPolicy = pharmacy.minimumOrderPolicy ?? (pharmacy.minimumOrderCents !== undefined ? "minimum" : "unknown");
  if (minimumPolicy === "unknown") return null;
  if (minimumPolicy === "minimum" && (pharmacy.minimumOrderCents === undefined || subtotalCents < pharmacy.minimumOrderCents)) return null;
  if (pharmacy.shippingBands?.length) {
    const band = pharmacy.shippingBands.find((item) => item.maxSubtotalCents === null || subtotalCents <= item.maxSubtotalCents);
    return band?.feeCents ?? null;
  }
  if (pharmacy.freeThresholdCents !== null) {
    const reachesFreeShipping = pharmacy.thresholdMode === "gte"
      ? subtotalCents >= pharmacy.freeThresholdCents
      : subtotalCents > pharmacy.freeThresholdCents;
    if (reachesFreeShipping) return 0;
  }
  return pharmacy.shippingFeeCents;
}

function makeProductGroups(products: Product[]): ProductGroup[] {
  const requested = products.filter((product) => !product.alternativeForId);
  return requested.map((requestedProduct) => ({
    id: requestedProduct.id,
    requestedProduct,
    candidates: [
      requestedProduct,
      ...products.filter((product) =>
        product.alternativeForId === requestedProduct.id && product.alternativeConfirmed === true,
      ),
    ],
  }));
}

function missingReason(candidates: Product[], pharmacies: Map<string, Pharmacy>) {
  const sellable = candidates.flatMap((product) => product.offers.filter(
    (offer) => offer.priceSourceType !== "demo" && offer.priceSourceType !== "candidate" && offer.availability === "available" && offer.unitPriceCents !== null && offer.unitPriceCents > 0,
  ));
  if (sellable.length === 0) {
    const candidateFound = candidates.some((product) => product.offers.some((offer) => offer.priceSourceType === "candidate"));
    if (candidateFound) return "Altri negozi trovati su Trovaprezzi; prezzo, disponibilità e spedizione da verificare sul venditore";
    const unknown = candidates.some((product) => product.offers.some((offer) => offer.priceSourceType !== "demo" && offer.priceSourceType !== "candidate" && offer.availability === "unknown"));
    return unknown ? "Disponibilità o prezzo da verificare" : "Nessuna offerta disponibile nelle farmacie inserite";
  }
  const hasShippingData = sellable.some((offer) => {
    const pharmacy = pharmacies.get(offer.pharmacyId);
    return pharmacy && (pharmacy.shippingFeeCents !== null || pharmacy.freeThresholdCents !== null);
  });
  const hasUnknownMinimum = sellable.some((offer) => {
    const pharmacy = pharmacies.get(offer.pharmacyId);
    const policy = pharmacy?.minimumOrderPolicy ?? (pharmacy?.minimumOrderCents !== undefined ? "minimum" : "unknown");
    return policy === "unknown" || (policy === "minimum" && pharmacy?.minimumOrderCents === undefined);
  });
  if (hasUnknownMinimum) return "Minimo d’ordine da verificare o importo minimo da inserire nella regola della farmacia";
  if (!hasShippingData) return "Offerta presente, ma costo di spedizione incompleto";
  return "Non incluso nella soluzione completa più economica entro il limite di farmacie scelto";
}

function solutionFrom(
  groups: ProductGroup[],
  assignment: Assignment[],
  pharmacies: Map<string, Pharmacy>,
): Basket | null {
  const subtotals: Record<string, number> = {};
  const lines: BasketLine[] = assignment.map(({ product, pharmacy, offer }) => {
    const unitPriceCents = offer.unitPriceCents ?? 0;
    const quantity = Math.max(1, Math.floor(product.quantity || 1));
    const lineTotalCents = unitPriceCents * quantity;
    subtotals[pharmacy.id] = (subtotals[pharmacy.id] ?? 0) + lineTotalCents;
    return {
      productId: product.id,
      productName: product.name,
      quantity,
      pharmacyId: pharmacy.id,
      unitPriceCents,
      lineTotalCents,
      priceSourceType: offer.priceSourceType,
      priceSourceUrl: offer.priceSourceUrl,
      checkedOn: offer.checkedOn,
    };
  });

  const shippingByPharmacy: Record<string, number> = {};
  for (const [pharmacyId, subtotal] of Object.entries(subtotals)) {
    const pharmacy = pharmacies.get(pharmacyId);
    if (!pharmacy) return null;
    const cost = shippingCost(pharmacy, subtotal);
    if (cost === null) return null;
    shippingByPharmacy[pharmacyId] = cost;
  }

  const includedGroups = new Set(assignment.map((item) => item.groupId));
  const missing = groups
    .filter((group) => !includedGroups.has(group.id))
    .map((group) => ({
      productId: group.id,
      productName: group.requestedProduct.name,
      reason: missingReason(group.candidates, pharmacies),
    }));
  const productsTotalCents = lines.reduce((total, line) => total + line.lineTotalCents, 0);
  const shippingTotalCents = Object.values(shippingByPharmacy).reduce((total, amount) => total + amount, 0);
  return {
    complete: missing.length === 0,
    coveredCount: includedGroups.size,
    requestedCount: groups.length,
    productsTotalCents,
    shippingTotalCents,
    totalCents: productsTotalCents + shippingTotalCents,
    lines,
    shippingByPharmacy,
    subtotalByPharmacy: subtotals,
    missing,
  };
}

function countBits(value: number) {
  let count = 0;
  for (let rest = value; rest; rest &= rest - 1) count++;
  return count;
}

function separateOrderBenchmark(groups: ProductGroup[], pharmacies: Map<string, Pharmacy>): number | null {
  let totalCents = 0;
  for (const group of groups) {
    let bestOrderCents: number | null = null;
    for (const product of group.candidates) {
      const quantity = Math.max(1, Math.floor(product.quantity || 1));
      for (const offer of product.offers) {
        if (offer.priceSourceType === "demo" || offer.priceSourceType === "candidate" || offer.availability !== "available" || offer.unitPriceCents === null || offer.unitPriceCents <= 0) continue;
        const pharmacy = pharmacies.get(offer.pharmacyId);
        if (!pharmacy) continue;
        const subtotalCents = offer.unitPriceCents * quantity;
        const deliveryCents = shippingCost(pharmacy, subtotalCents);
        if (deliveryCents === null) continue;
        const orderCents = subtotalCents + deliveryCents;
        if (bestOrderCents === null || orderCents < bestOrderCents) bestOrderCents = orderCents;
      }
    }
    if (bestOrderCents === null) return null;
    totalCents += bestOrderCents;
  }
  return totalCents;
}

function isBetter(candidate: State, current: State | null) {
  return !current || candidate.costCents < current.costCents ||
    (candidate.costCents === current.costCents && candidate.pharmacyCount < current.pharmacyCount);
}

export function optimizeCart(products: Product[], pharmacyList: Pharmacy[], maxPharmacies: 1 | 2 = 2): OptimizationResult {
  const pharmacies = new Map(pharmacyList.map((pharmacy) => [pharmacy.id, pharmacy]));
  const groups = makeProductGroups(products);
  const groupCount = groups.length;
  const separateOrderBenchmarkCents = separateOrderBenchmark(groups, pharmacies);
  if (groupCount === 0) return { complete: null, partial: null, coverageCounts: [], separateOrderBenchmarkCents: null };

  // The UI caps requested rows at 10; exact optimization remains practical with
  // one or two pharmacy layers and charges once for each store actually used.
  const fullMask = (1 << groupCount) - 1;
  const optionsByPharmacy: PharmacySubset[][] = [];

  for (const pharmacy of pharmacies.values()) {
    const offersByGroup = groups.map((group) => {
      const uniqueOffers = new Map<string, { product: Product; offer: Offer; lineTotalCents: number }>();
      for (const product of group.candidates) {
        for (const offer of product.offers) {
          if (offer.pharmacyId !== pharmacy.id || offer.priceSourceType === "demo" || offer.priceSourceType === "candidate" || offer.availability !== "available" || offer.unitPriceCents === null || offer.unitPriceCents <= 0) continue;
          const quantity = Math.max(1, Math.floor(product.quantity || 1));
          const lineTotalCents = offer.unitPriceCents * quantity;
          const key = `${product.id}:${lineTotalCents}`;
          if (!uniqueOffers.has(key)) uniqueOffers.set(key, { product, offer, lineTotalCents });
        }
      }
      return [...uniqueOffers.values()];
    });

    const bestByMask = new Map<number, PharmacySubset>();
    const chosen: Assignment[] = [];
    const enumerate = (index: number, mask: number, subtotalCents: number) => {
      if (index === groupCount) {
        if (mask === 0) return;
        const shippingCents = shippingCost(pharmacy, subtotalCents);
        // Do not treat an unknown below-threshold delivery fee as zero.
        if (shippingCents === null) return;
        const candidate: PharmacySubset = {
          mask,
          costCents: subtotalCents + shippingCents,
          shippingCents,
          assignments: [...chosen],
        };
        const previous = bestByMask.get(mask);
        if (!previous || candidate.costCents < previous.costCents) bestByMask.set(mask, candidate);
        return;
      }

      // This pharmacy may leave the requested item for another store.
      enumerate(index + 1, mask, subtotalCents);
      for (const choice of offersByGroup[index]) {
        chosen.push({ groupId: groups[index].id, product: choice.product, pharmacy, offer: choice.offer });
        enumerate(index + 1, mask | (1 << index), subtotalCents + choice.lineTotalCents);
        chosen.pop();
      }
    };
    enumerate(0, 0, 0);
    optionsByPharmacy.push([...bestByMask.values()]);
  }

  const stateCount = fullMask + 1;
  const maxStoreCount = Math.min(maxPharmacies, groupCount);
  let states: Array<Array<State | null>> = Array.from(
    { length: maxStoreCount + 1 },
    () => Array.from({ length: stateCount }, () => null),
  );
  states[0][0] = { costCents: 0, assignments: [], pharmacyCount: 0 };

  // Each pharmacy is processed once and may serve any non-empty subset of
  // remaining needs. Product subtotals are combined before shipping is applied.
  for (const pharmacyOptions of optionsByPharmacy) {
    const next = states.map((layer) => layer.slice());
    for (let usedPharmacies = 0; usedPharmacies < maxStoreCount; usedPharmacies++) {
      for (let currentMask = 0; currentMask <= fullMask; currentMask++) {
        const state = states[usedPharmacies][currentMask];
        if (!state) continue;
        const remaining = fullMask ^ currentMask;
        for (const option of pharmacyOptions) {
          if ((option.mask & remaining) !== option.mask) continue;
          const newMask = currentMask | option.mask;
          const candidate: State = {
            costCents: state.costCents + option.costCents,
            assignments: [...state.assignments, ...option.assignments],
            pharmacyCount: usedPharmacies + 1,
          };
          if (isBetter(candidate, next[usedPharmacies + 1][newMask])) next[usedPharmacies + 1][newMask] = candidate;
        }
      }
    }
    states = next;
  }

  let completeState: State | null = null;
  for (let usedPharmacies = 0; usedPharmacies <= maxStoreCount; usedPharmacies++) {
    const candidate = states[usedPharmacies][fullMask];
    if (candidate && isBetter(candidate, completeState)) completeState = candidate;
  }
  if (completeState) {
    return {
      complete: solutionFrom(groups, completeState.assignments, pharmacies),
      partial: null,
      coverageCounts: [groupCount],
      separateOrderBenchmarkCents,
    };
  }

  let bestMask = 0;
  let bestState: State | null = states[0][0];
  for (let usedPharmacies = 0; usedPharmacies <= maxStoreCount; usedPharmacies++) {
    for (let mask = 0; mask <= fullMask; mask++) {
      const state = states[usedPharmacies][mask];
      if (!state) continue;
      const covered = countBits(mask);
      const bestCovered = countBits(bestMask);
      if (covered > bestCovered || (covered === bestCovered && isBetter(state, bestState))) {
        bestMask = mask;
        bestState = state;
      }
    }
  }
  const partial = bestState ? solutionFrom(groups, bestState.assignments, pharmacies) : null;
  const coverageCounts = [...new Set(states.flatMap((layer) => layer.map((state, mask) => state ? countBits(mask) : -1)).filter((count) => count >= 0))].sort((a, b) => b - a);
  return { complete: null, partial, coverageCounts, separateOrderBenchmarkCents };
}

export function parseEuroInput(value: string): number | null {
  const cleaned = value.trim().replace(/\s/g, "").replace(/€/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export function centsToInput(cents: number | null): string {
  return cents === null ? "" : (cents / 100).toFixed(2);
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}
