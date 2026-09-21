# Campaign records and submission boundary

Acceptance: explicit approval of the current revision, durable immutable campaign snapshots with selected accounts, duplicate-tap/retry prevention, accurate submitted vs active state, owner-protected server records, fail-closed paid actions. Stacked on budget-and-approval / PR #10.

Demo submission is fully local, serialized by workspace storage, and idempotent by draft ID + revision. It stores a copy of approved business, photo references, copy, budget, duration, destination and connections. No provider call occurs. Client approval is invalidated when draft/account selection changes.

Live mode saves an `awaiting_approval` server record after loading the authenticated owner's current draft and provider selections. PostgreSQL's unique owner/draft/revision constraint plus insert-ignore preserves the first snapshot across concurrent requests. A snapshot hash prevents an account change from silently replacing that approval. An expired review must be refreshed with a new revision. Client workspace campaign entries are never authoritative in live mode.

**Paid campaign adapters are not implemented/enabled.** `/submit` and `/control` authenticate owner, validate inputs and fail with a clear 503. There is deliberately no launch environment toggle. Credentials alone will not enable spending. Before implementation: verify current format/objective/destination eligibility, final targeting, UTC/time-zone dates, provider billing and fee/tax quote; implement platform-enforced appropriate budgets, idempotent outbox/provider reconciliation, status polling/webhooks, pause/stop reconciliation, sandbox contract tests and provider app review. Do not build a claim of an exact cap from delayed reporting.

Apply migration 004. Try demo approval twice/retry: one saved campaign, `submitted`, not `active`. Backend checks cover snapshot fingerprints and hard-disabled paid submission. Native/server typecheck, lint and domain tests run; no real provider campaign, billing action, migration deployment or device test took place.
