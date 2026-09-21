# Results and campaign controls

Acceptance: persisted campaign history, clear states, missing tracking represented honestly, no invented performance, demo review/approval/rejection controls, pause/resume/confirmed stop, new draft without losing campaign history, return to saved progress, account hub navigation. Stacked on campaign-submission / PR #11.

Try the full demo: Welcome → Explore demo → business (website optional) → goal → platforms → sample accounts → photos → copy → budget/destination → review/approve → dashboard. Simulate review then approval to see Active; pause/resume, or stop with confirmation. Reopen the app to verify saved campaigns. No state automatically advances and no real metrics are invented.

Live dashboard reads only server-owned campaign records, never untrusted workspace JSON. It supports loading, error and retry states. Live records in this build are reviews, not submitted provider ads. Reporting adapters, webhook/polling reconciliation and provider pause/stop mutations are still needed before production; their APIs intentionally fail closed.

Verification: full domain lifecycle regression (including no website, duplicate prevention, null conversions, stop terminal state), UI/build checks described in PROGRESS. Native device testing is unavailable in this environment.
