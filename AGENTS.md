# AGENTS.md — contributing to heywaitr

A read-and-prepare client for the Heywaitr table-ordering platform: menu
reads, venue/cart preparation, and the typed client surface consumed by
mcp-cashu-exchange and the numo-bridge POS integration.

Rules:
- READ-ONLY: no accounts, no baskets, no orders, no payment. Payment
  lanes get a README section (who charges whom), never a code path.
- This repository is public. Never commit card numbers, HAR/pcap/log
  files, cookies, session dumps, captured payloads, or personal data.
  Fakes are synthetic with provenance comments. Commit via
  `sh scripts/git-commit.sh`; CI runs the leak scan.
- Tests are offline against a synthetic fake that encodes the platform
  quirks; every quirk is a test + a Lessons line in prompts/write-tests.md.

## Commands

```sh
npm ci
npm run typecheck     # tsc --noEmit
npm run test          # vitest run (offline, synthetic fake)
npm run build         # tsc -p tsconfig.json
npm run gate          # scripts/leak-scan.mjs . --history
```

## Local CI gate

GitHub Actions is org-blocked; the per-PR gate is
[`scripts/pr-verify.sh`](scripts/pr-verify.sh) (fleet pattern:
Amperstrand/.github `workflow-templates/local-ci-gate.md`). From a review:

```sh
scripts/pr-verify.sh <PR-number>    # worktree checkout, legs, PR-comment stamp
scripts/pr-verify.sh origin/main    # ref mode, table only
```

Legs: hygiene / deps / typecheck / unit-tests / build / leak-gate. Not
covered: publish/runtime behaviour and anything live-platform-visible.

## Bench touchpoints

None. Read-only web client — no labgrid places, no devices.
