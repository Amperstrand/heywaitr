#!/usr/bin/env node
/**
 * heywaitr — read-only guest CLI. No orders, no payment, ever.
 *
 *   heywaitr venue <id|url>
 *   heywaitr menu  <id|url>
 */

import { realpathSync } from "node:fs";
import { HeywaitrClient } from "./api.js";

function binGuard(): void {
  // invoked through a symlink (npm .bin), argv[1] resolves past it
  const invoked = realpathSync(process.argv[1] ?? "");
  const self = realpathSync(new URL(import.meta.url).pathname);
  if (invoked !== self) return;
}

async function main(argv: readonly string[]): Promise<number> {
  const [command, target] = argv;
  if (
    (command !== "venue" && command !== "menu") ||
    target === undefined ||
    argv.length !== 2
  ) {
    process.stderr.write(
      "usage: heywaitr <venue|menu> <restaurant-id | order.heywaitr.com URL>\n",
    );
    return 2;
  }
  const client = new HeywaitrClient();
  if (command === "venue") {
    const venue = await client.venue(target);
    if (venue === null) {
      console.log("null  # platform answered: absent");
      return 1;
    }
    console.log(JSON.stringify(venue, null, 1));
    return 0;
  }
  const menu = await client.menu(target);
  if (menu === null) {
    console.log("null  # platform answered: absent (or venue dead)");
    return 1;
  }
  console.log(
    JSON.stringify(
      {
        restaurant: menu.restaurant,
        items: menu.items.length,
        reportedTotal: menu.reportedTotal,
        sample: menu.items.slice(0, 5),
      },
      null,
      1,
    ),
  );
  return 0;
}

if (process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`) {
  binGuard();
  process.exitCode = await main(process.argv.slice(2));
}
