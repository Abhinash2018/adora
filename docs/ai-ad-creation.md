# Ad creation and revision

Acceptance: preview original photos; create copy for selected channels; plain-language revision; manual editing; require accuracy confirmation; changes invalidate approval; AI secrets and image access stay server-side. Stacked on photo-upload / PR #8.

The OpenAI Docs skill informed use of the Responses API with strict structured output (https://developers.openai.com/api/docs/guides/structured-outputs). Configure `OPENAI_API_KEY` and a vision/structured-output-capable `OPENAI_MODEL` in server-only environment. No paid API calls were made during implementation/tests. Owner lookup and revision checks happen server-side; only owner-prefixed photo paths can produce short-lived signed URLs. Explicit user consent is required before sending photos/business details to AI.

Safety design: the model selects/orders indexes of user-confirmed facts, plus one neutral opening. The server composes actual text from those facts, validates indexes and enforces conservative copy lengths. The model cannot introduce prices, amenities, reviews, discounts or guarantees. This intentionally limits free-form rewriting; edit confirmed business facts or manually edit copy when needed. Actual platform acceptance still depends on format/policy/eligibility. Images are not altered or synthesized; all previews are approximate native layouts.

Demo uses deterministic local templates, labeled clearly; “shorter” and “warmer” are supported. Real configured mode calls the server, with a no-AI/manual alternative if configuration or generation fails. Generated copy is persisted on the client only after success and an unchanged revision. No automatic API retries that might incur duplicate generation costs.

Try: add photos → Create my ad → Prepare demo copy → edit/request shorter → confirm → budget. Verification: unit tests for fact-only composition/rejected invented indexes, typecheck/lint; live AI generation and device previews remain untested without credentials/hardware.
