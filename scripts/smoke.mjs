#!/usr/bin/env node
/**
 * Weekly read-only smoke: the README's live-verified worked examples,
 * asserted against the live platform. Read-only by design — two cookieless
 * GET/POST calls per venue, no orders, no payment. Any shape drift (venue
 * fields, item counts, currency, absent-id semantics) fails loudly here
 * instead of in a consumer. See issue #1.
 */
import { HeywaitrClient } from "../dist/index.js";

const LIVE_VENUE_ID = "60dc2019500e270015f90f07"; // Pizze Di Nap Hellerup (README 2026-10-07)
const DEAD_VENUE_ID = "635a515f0000000000000000"; // README dead-id example class
const client = new HeywaitrClient();

function check(name, ok, detail) {
  if (!ok) {
    console.error(`smoke: FAIL ${name}${detail === undefined ? "" : ` — ${detail}`}`);
    process.exitCode = 1;
  } else {
    console.log(`smoke: ok ${name}${detail === undefined ? "" : ` — ${detail}`}`);
  }
}

const venue = await client.venue(LIVE_VENUE_ID);
check("live venue present", venue !== null);
if (venue !== null) {
  check("venue name carried", typeof venue.name === "string" && venue.name.length > 0, venue.name);
  check("venue currency DKK", venue.currency.code === "DKK", venue.currency.code);
}

const menu = await client.menu(LIVE_VENUE_ID);
check("live menu present", menu !== null);
if (menu !== null) {
  const items = menu.items;
  check("menu carries items", items.length > 50, `${items.length} items`);
  const priced = items.filter((i) => Number.isInteger(i.price));
  check("integer DKK prices", priced.length === items.length, `${priced.length}/${items.length}`);
}

const dead = await client.venue(DEAD_VENUE_ID);
check("dead id answers null (200-with-Message shape)", dead === null);

if (process.exitCode === undefined || process.exitCode === 0) {
  console.log("smoke: all worked examples green");
}
