/**
 * heywaitr transport fake. Fixtures are SANITIZED live reads
 * (Pizze Di Napo Hellerup, 60dc2019500e270015f90f07, 2026-10-07):
 * settlement fields (IBAN/BRN/ZTL/email) are stripped at the source —
 * the real API leaks them to anonymous readers; we never ship them.
 * The venue fixture additionally exercises the mixed-case record and
 * the 200-with-Message absent shape.
 */
import type { RecordedRequest } from "./transport-fake.js";

export const LIVE_RESTAURANT = "60dc2019500e270015f90f07";
export const DEAD_RESTAURANT = "635a515fe8b7f700169f63a6";

const sanitizedVenue = {
  _id: LIVE_RESTAURANT,
  name: "Pizze Di Napo Hellerup",
  address: "Standvejen 149, 2900 Hellerup",
  status: "Closed",
  isOpen: false,
  serviceFee: 1.25,
  allowAdvanceOrder: true,
  callAWaiterSupported: false,
  categories: ["Pizza", "Sandwiches", "Pasta", "Salater", "Drikkevarer"],
  availability: {
    Mon: { start: "10:00", end: "21:00", isAvailable: true },
    Tue: { start: "10:00", end: "21:00", isAvailable: true },
    Wed: { start: "10:00", end: "21:00", isAvailable: true },
  },
  currency: {
    symbol: "Dkr",
    name: "Danish Krone",
    symbol_native: "kr",
    decimal_digits: 2,
    code: "DKK",
  },
};

const menuEnvelope = {
  categorydesc: "",
  // meta.total deliberately disagrees with data.length (live quirk:
  // 126 reported vs 125 served for the real venue)
  meta: { current_page: null, last_page: null, total: 4 },
  data: [
    {
      _id: "aaa000000000000000000001",
      name: "20. Margharita - Frokost",
      price: 64,
      oldPrice: null,
      description: "Tomat, mozzarella, frisk basilikum.",
      category: "Pizza",
      stamps: 1,
      order: 1,
    },
    {
      _id: "aaa000000000000000000002",
      name: "21. Diavola",
      price: 85,
      oldPrice: 95,
      description: "Tomat, mozzarella, salami piccante.",
      category: "Pizza",
      stamps: 0,
      order: 2,
    },
    {
      _id: "aaa000000000000000000003",
      name: "Sansel - Erik B. Cuvee glas",
      price: 68,
      description: "",
      category: "Drikkevarer",
      stamps: null,
      order: 3,
    },
  ],
};

export function heywaitrFake() {
  const requests: RecordedRequest[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : String(input);
    requests.push({ method: init?.method ?? "GET", url });
    const respond = (status: number, body: unknown): Response =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      });
    if (url.endsWith("/mobile/restaurant/fetchspecific")) {
      const body = JSON.parse(String(init?.body ?? "{}")) as { id?: string };
      if (body.id === LIVE_RESTAURANT) return respond(200, sanitizedVenue);
      return respond(200, { Message: "Restaurant not found" });
    }
    if (url.includes("/menu/fetch")) {
      const restaurant = new URL(url).searchParams.get("restaurant");
      if (restaurant !== LIVE_RESTAURANT) {
        return respond(200, { Message: "Restaurant not found" });
      }
      return respond(200, menuEnvelope);
    }
    return respond(404, { Message: "unknown route" });
  };
  return { fetchImpl, requests };
}
