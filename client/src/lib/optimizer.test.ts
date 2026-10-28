import { describe, expect, it } from "vitest";
import { optimizeCart, type Offer, type Pharmacy, type Product } from "./optimizer";

function pharmacy(id: string, shippingFeeCents: number | null, freeThresholdCents: number | null = null): Pharmacy {
  return {
    id,
    name: id,
    shippingFeeCents,
    freeThresholdCents,
    minimumOrderPolicy: "none",
    thresholdMode: "gte",
    shippingSource: "test",
  };
}

function offer(id: string, pharmacyId: string, unitPriceCents: number, priceSourceType: Offer["priceSourceType"] = "verified"): Offer {
  return { id, pharmacyId, unitPriceCents, availability: "available", priceSourceType };
}

function product(id: string, offers: Offer[], quantity = 1): Product {
  return { id, name: id, quantity, offers };
}

describe("optimizeCart pharmacy limits and savings", () => {
  it("combines same-store subtotals before applying free shipping and compares separate orders", () => {
    const store = pharmacy("store", 500, 1000);
    const products = [
      product("a", [offer("a", "store", 500)]),
      product("b", [offer("b", "store", 500)]),
    ];

    const result = optimizeCart(products, [store], 1);

    expect(result.complete?.productsTotalCents).toBe(1000);
    expect(result.complete?.shippingTotalCents).toBe(0);
    expect(result.complete?.totalCents).toBe(1000);
    expect(result.separateOrderBenchmarkCents).toBe(2000);
  });

  it("uses two stores only when their combined total beats the best single-store option", () => {
    const products = [
      product("a", [offer("a-central", "central", 1500), offer("a-low", "store-a", 500)]),
      product("b", [offer("b-central", "central", 1500), offer("b-low", "store-b", 500)]),
    ];
    const stores = [pharmacy("central", 0), pharmacy("store-a", 0), pharmacy("store-b", 0)];

    const oneStore = optimizeCart(products, stores, 1);
    const upToTwo = optimizeCart(products, stores, 2);

    expect(oneStore.complete?.totalCents).toBe(3000);
    expect(Object.keys(oneStore.complete?.subtotalByPharmacy ?? {})).toHaveLength(1);
    expect(upToTwo.complete?.totalCents).toBe(1000);
    expect(Object.keys(upToTwo.complete?.subtotalByPharmacy ?? {})).toHaveLength(2);
    expect(upToTwo.separateOrderBenchmarkCents).toBe(1000);
  });

  it("returns a partial basket, not a false complete total, when three stores are required", () => {
    const products = [
      product("a", [offer("a", "store-a", 500)]),
      product("b", [offer("b", "store-b", 500)]),
      product("c", [offer("c", "store-c", 500)]),
    ];
    const stores = [pharmacy("store-a", 0), pharmacy("store-b", 0), pharmacy("store-c", 0)];

    const result = optimizeCart(products, stores, 2);

    expect(result.complete).toBeNull();
    expect(result.partial?.complete).toBe(false);
    expect(result.partial?.coveredCount).toBe(2);
    expect(result.partial?.missing).toHaveLength(1);
    expect(result.separateOrderBenchmarkCents).toBe(1500);
  });

  it("does not calculate a savings benchmark if a product cannot be ordered alone", () => {
    const store = { ...pharmacy("store", 500), minimumOrderPolicy: "minimum" as const, minimumOrderCents: 1000 };
    const products = [
      product("a", [offer("a", "store", 500)]),
      product("b", [offer("b", "store", 500)]),
    ];

    const result = optimizeCart(products, [store], 1);

    expect(result.complete?.totalCents).toBe(1500);
    expect(result.separateOrderBenchmarkCents).toBeNull();
  });

  it("does not treat an unknown minimum or a missing amount as no minimum", () => {
    const unknownStore = { ...pharmacy("store", 0), minimumOrderPolicy: "unknown" as const };
    const missingAmountStore = { ...pharmacy("store", 0), minimumOrderPolicy: "minimum" as const, minimumOrderCents: undefined };
    const productWithOffer = product("a", [offer("a", "store", 500)]);

    for (const store of [unknownStore, missingAmountStore]) {
      const result = optimizeCart([productWithOffer], [store], 1);
      expect(result.complete).toBeNull();
      expect(result.partial?.coveredCount).toBe(0);
      expect(result.separateOrderBenchmarkCents).toBeNull();
    }
  });

  it("excludes demo and comparison candidates from both the basket and benchmark", () => {
    const store = pharmacy("store", 0);
    const item = product("a", [
      offer("demo", "store", 100, "demo"),
      offer("candidate", "store", 50, "candidate"),
    ]);

    const result = optimizeCart([item], [store], 2);

    expect(result.complete).toBeNull();
    expect(result.partial?.coveredCount).toBe(0);
    expect(result.separateOrderBenchmarkCents).toBeNull();
  });
});
