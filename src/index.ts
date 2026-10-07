export const PLATFORM = "heywaitr";
export { HeywaitrClient, HEYWAITR_API } from "./api.js";
export { HeywaitrError, isTransportFailure } from "./error.js";
export { menuFromWire, venueFromWire } from "./parse.js";
export type { RawMenuEnvelope, RawVenue } from "./parse.js";
export { restaurantId } from "./types.js";
export type { Currency, Menu, MenuItem, RestaurantId, Venue } from "./types.js";
