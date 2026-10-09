# Turning repeated agent mistakes into enforceable controls

Use the conditional reference under skills/review-and-refactor-code/references/recurring-errors.md. This is a post-incident engineering workflow, not an always-running transcript scraper.

1. Identify at least two instances of the same failure mechanism from review comments, bug reports, or commits. Respect the repository's privacy boundary and don't infer repeated failure from subjective style comments.
2. Prefer preventing the bad state in architecture or data ownership. Then consider types/contracts, a deterministic lint rule, and a focused regression test. Documented advice is the last resort for judgment calls.
3. Show the control catching a representative previous failure (negative fixture) and permitting a valid case (positive fixture). Keep only high-signal rules; do not turn every past incident into mandatory boilerplate.
4. Propose the smallest bounded fix to the owning specialist. Significant changes still require explicit approval. Recheck the final integrated state and the existing CI enforcement.

The read-only helper audits a simple JSON file to identify repeated cases with missing controls. Example:

    {
      "schema": 1,
      "failures": [
        {
          "id": "cross-tenant-read",
          "occurrences": [
            "pull/123: wrong tenant returned",
            "pull/177: repeated authorization miss"
          ],
          "control": {
            "layer": "tests",
            "files": ["tests/tenant-access.test.ts"],
            "proof": "Reproduced original access bug in a negative fixture"
          }
        }
      ]
    }

Run:

    node scripts/audit-recurring-errors.mjs --workspace /path/to/repo --ledger relative/path/to/recurrences.json

A file path and proof **description** cannot prove that CI rejects the original error; the tool marks that result as needing evidence review. This is deliberate: actual architectural constraints, tests, and security policies—not more skill prose—must provide enforcement.
