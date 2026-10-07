import { HeywaitrError } from "./error.js";
import { getJson, postJson } from "./http.js";
import {
  menuFromWire,
  venueFromWire,
  type RawMenuEnvelope,
  type RawVenue,
} from "./parse.js";
import { restaurantId, type Menu, type RestaurantId, type Venue } from "./types.js";

export const HEYWAITR_API = "https://heywaitr.herokuapp.com/api";

export interface ClientOptions {
  readonly fetchImpl?: typeof fetch;
}

/**
 * Read-only heywaitr client. Two cookieless, headerless calls against
 * the public Heroku API (research/heywaitr/PLATFORM.md):
 *
 *   POST /mobile/restaurant/fetchspecific  body {"id":"<objectId>"}
 *   GET  /menu/fetch?restaurant=<id>&category=All
 *
 * A thrown HeywaitrError (reason "network") means unreachable; null
 * means the platform answered: absent (404 or `{"Message":"Restaurant
 * not found"}` — the API returns HTTP 200 for unknown ids, only the
 * body says absent).
 */
export class HeywaitrClient {
  constructor(private readonly options: ClientOptions = {}) {}

  async venue(idOrUrl: string): Promise<Venue | null> {
    const id = restaurantId(idOrUrl);
    const result = await postJson<RawVenue>(
      `${HEYWAITR_API}/mobile/restaurant/fetchspecific`,
      { id },
      this.options.fetchImpl,
    );
    if (!result.ok) {
      if (result.kind === "network") {
        throw new HeywaitrError("network", `venue fetch failed: ${result.body}`);
      }
      return null;
    }
    return venueFromWire(id, result.value);
  }

  async menu(idOrUrl: string): Promise<Menu | null> {
    const id = restaurantId(idOrUrl);
    const venue = await this.venue(id);
    if (venue === null) return null;
    const result = await getJson<RawMenuEnvelope>(
      `${HEYWAITR_API}/menu/fetch?restaurant=${id}&category=All`,
      this.options.fetchImpl,
    );
    if (!result.ok) {
      if (result.kind === "network") {
        throw new HeywaitrError("network", `menu fetch failed: ${result.body}`);
      }
      return null;
    }
    return menuFromWire(id, result.value);
  }
}
