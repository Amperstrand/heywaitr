export type RestaurantId = string & { readonly __brand: "RestaurantId" };

/**
 * Parse a heywaitr restaurant id: bare Mongo ObjectId (24 hex) or any
 * order.heywaitr.com restaurant URL form
 * (`/restaurants/<id>` or `/restaurants/<id>/menu`, query ignored).
 */
export function restaurantId(value: string): RestaurantId {
  let candidate = value.trim();
  if (/^https?:\/\//i.test(candidate)) {
    const url = new URL(candidate);
    if (!/(^|\.)heywaitr\.com$/.test(url.hostname)) {
      throw new Error(`not a heywaitr.com URL: ${value}`);
    }
    const match = url.pathname.match(/\/restaurants\/([a-f0-9]{24})/);
    if (match?.[1] === undefined) {
      throw new Error(`no restaurant id in URL: ${value}`);
    }
    candidate = match[1];
  }
  if (!/^[a-f0-9]{24}$/.test(candidate)) {
    throw new Error(`invalid restaurant id (expected 24-hex ObjectId): ${value}`);
  }
  return candidate as RestaurantId;
}

export interface Currency {
  readonly code: string;
  readonly symbol: string;
  readonly decimalDigits: number;
}

export interface Venue {
  readonly id: RestaurantId;
  readonly name: string;
  readonly address: string;
  /** Weekday map — opening hours ARE the menu gate ("Lukket" banner). */
  readonly availability: Readonly<Record<string, { readonly start: string; readonly end: string; readonly available: boolean }>>;
  readonly currency: Currency;
  /** Platform status machine ("Closed"/"Open"); NOT liveness. */
  readonly status: string;
  readonly openNow: boolean;
  readonly serviceFee: number;
  readonly advanceOrder: boolean;
  readonly waiterCallSupported: boolean;
  readonly categories: readonly string[];
}

export interface MenuItem {
  readonly id: string;
  readonly name: string;
  /** Main-unit integer in the venue currency (64 = 64 DKK lunch pizza). */
  readonly price: number;
  readonly oldPrice: number | null;
  readonly description: string;
  readonly category: string;
  /** heywaitr+ loyalty stamp value per item. */
  readonly stamps: number | null;
}

export interface Menu {
  readonly restaurant: RestaurantId;
  readonly items: readonly MenuItem[];
  /** meta.total as served — observed to disagree with items.length. */
  readonly reportedTotal: number | null;
}
