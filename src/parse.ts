import type { Menu, MenuItem, RestaurantId, Venue } from "./types.js";

/** Raw venue record — deliberately models ONLY guest-relevant fields.
 * The public endpoint also carries settlement data (IBAN, BRN, ZTL
 * account, owner email); those are research artifacts and never enter
 * a model, fixture, or published package (PLATFORM.md exposure note). */
export interface RawVenue {
  readonly _id?: string;
  readonly name?: string;
  readonly address?: string;
  readonly status?: string;
  readonly isOpen?: boolean;
  readonly serviceFee?: number;
  readonly allowAdvanceOrder?: boolean;
  readonly callAWaiterSupported?: boolean;
  readonly categories?: readonly unknown[];
  readonly availability?: Record<string, unknown>;
  readonly currency?: Record<string, unknown>;
  readonly Message?: string;
}

export interface RawMenuEnvelope {
  readonly categorydesc?: string;
  readonly data?: readonly Record<string, unknown>[];
  readonly meta?: { readonly total?: number | null } | null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function venueFromWire(id: RestaurantId, wire: RawVenue): Venue | null {
  if (wire.Message !== undefined && wire.name === undefined) return null;
  const availability: Record<string, { start: string; end: string; available: boolean }> = {};
  const rawAvailability = wire.availability ?? {};
  for (const [day, slot] of Object.entries(rawAvailability)) {
    if (typeof slot !== "object" || slot === null) continue;
    const s = slot as Record<string, unknown>;
    const start = text(s["start"]);
    const end = text(s["end"]);
    if (start === "" || end === "") continue;
    availability[day] = { start, end, available: s["isAvailable"] === true };
  }
  const rawCurrency = wire.currency ?? {};
  const code = text(rawCurrency["code"]);
  return {
    id,
    name: text(wire.name),
    address: text(wire.address),
    availability,
    currency: {
      code: code === "" ? "DKK" : code,
      symbol: text(rawCurrency["symbol"]),
      decimalDigits: num(rawCurrency["decimal_digits"]) ?? 2,
    },
    status: text(wire.status),
    openNow: wire.isOpen === true,
    serviceFee: num(wire.serviceFee) ?? 0,
    advanceOrder: wire.allowAdvanceOrder === true,
    waiterCallSupported: wire.callAWaiterSupported === true,
    categories: (wire.categories ?? []).filter(
      (c): c is string => typeof c === "string",
    ),
  };
}

export function menuFromWire(
  id: RestaurantId,
  wire: RawMenuEnvelope,
): Menu {
  const items: MenuItem[] = [];
  for (const raw of wire.data ?? []) {
    const price = num(raw["price"]);
    const name = text(raw["name"]);
    if (price === null || name === "") continue;
    const oldPrice = num(raw["oldPrice"]);
    const stamps = num(raw["stamps"]);
    items.push({
      id: text(raw["_id"]),
      name,
      price,
      oldPrice: oldPrice === null || oldPrice === price ? null : oldPrice,
      description: text(raw["description"]),
      category: text(raw["category"]),
      stamps: stamps === null || stamps === 0 ? null : stamps,
    });
  }
  return { restaurant: id, items, reportedTotal: wire.meta?.total ?? null };
}
