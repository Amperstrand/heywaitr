# heywaitr

TODO: what this reads, which surface, worked examples, install block,
CLI usage, error semantics (typed "network" throw vs null = absent),
what the client encodes, live verification lines (dated, with numbers).

Read-only by design: **no orders, no payment**.

```sh
npm install github:Amperstrand/heywaitr
```

## Live verification

- 2026-10-07 — `venue 60dc2019500e270015f90f07` → Pizze Di Napo Hellerup,
  Standvejen 149, 2900 Hellerup, DKK, serviceFee 1.25, Closed-but-live.
- 2026-10-07 — `menu 60dc2019500e270015f90f07` → 125 items served,
  `reportedTotal` 126 (live off-by-one quirk), integer DKK prices
  (lunch Margherita 64).
- 2026-10-07 — dead id `635a515f…` → `null`, exit 1 (200-with-Message
  absent shape).

## Payment lane (README-only, per fleet policy)

Reepay is the PSP (venue field `hasOwnReepayAccount`; platform aggregates
otherwise). No payment code path exists in this package, by design.
