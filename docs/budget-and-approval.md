# Budget and approval

Acceptance: validated whole-cent USD amount and duration, provider allocations sum to one total (Facebook and Instagram share Meta allocation), working phone/messaging destinations for owners without a website, immutable approval revision, full copy/account/destination review, fee separate from advertising spend. Stacked on ad creation / PR #9. Persistence/submission follows on its own feature.

The amount is a planning total, not a promise of an exact cap. Google supports daily and eligible campaign-total budgets with specific constraints (https://developers.google.com/google-ads/api/docs/campaigns/budgets/overview). UI exposes this difference and does not imply that automatic pausing or delayed reports enforce a cap. Meta's official budget documentation returned HTTP 429 here, so live requirements must still be verified. This build does not configure final provider targeting, billing or dates and cannot launch paid campaigns.

No website is required to plan an ad. Calls need a valid phone number and messages need a supported business messaging link; booking/sales ads need a secure booking/website link. Destination compatibility must be validated by the future live provider campaign adapter, not inferred from passing client validation.

Try: prepare copy → confirm → budget → choose amount, duration and destination → review every platform/account → check approval. Checks: monetary precision/allocation, unsafe URL rejection and no-website destination tests; typecheck/lint; no device or live billing tests.
