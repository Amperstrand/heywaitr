# AGENTS.md — contributing to heywaitr

TODO: one paragraph — what platform this reads, where the surface notes
live (this repo's research/<platform>/), what the read surface is.

Rules:
- READ-ONLY: no accounts, no baskets, no orders, no payment. Payment
  lanes get a README section (who charges whom), never a code path.
- This repository is public. Never commit card numbers, HAR/pcap/log
  files, cookies, session dumps, captured payloads, or personal data.
  Fakes are synthetic with provenance comments. Commit via
  `sh scripts/git-commit.sh`; CI runs the leak scan.
- Tests are offline against a synthetic fake that encodes the platform
  quirks; every quirk is a test + a Lessons line in prompts/write-tests.md.
