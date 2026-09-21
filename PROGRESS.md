# Progress

| Status | Feature | Branch | Dependency | Notes |
| --- | --- | --- | --- | --- |
| Merged (PR #1) | Mobile foundation | `feature/mobile-foundation` | `main` | Expo TypeScript shell, native navigation foundation, design tokens, CI and dev-build setup. |
| In progress | Auth and business profile | `feature/auth-business-profile` | `feature/mobile-foundation` | Local encrypted profile draft and validation; server authentication remains pending backend design. |
| Implemented; awaiting review | Optional website onboarding | `feature/no-website-onboarding` | `feature/auth-business-profile` (PR #2) | Explicit no-website choice, persisted preference, navigation to goal selection, saved goal, browser storage adapter. Scope/acceptance: `docs/no-website-onboarding.md`. |
| Planned | Channel selection | `feature/channel-selection` | business profile | Google/Meta connection states remain distinct. |
| Planned | Provider connections | separate Google/Meta branches | channel selection | Requires approved OAuth and advertising API credentials. |
| Planned | Assets, AI, budget, review, submission, results | feature branches | prior features | No paid campaign actions in development. |

## Blockers

## Completion work

- `feature/photo-upload` (stacked on PR #7): camera/gallery selection, durable demo images, private owner-scoped Supabase uploads, preview/retry/removal. Acceptance and device-test limitations: `docs/photo-upload.md`.

- `feature/advertising-connections` (stacked on PR #6): server-authenticated Google Ads and Meta OAuth adapters, encrypted tokens, account selection, demo selection, reconnect/disconnect and setup guidance. Acceptance and limitations: `docs/advertising-connections.md`. Live provider validation awaits credentials/approvals.

- `feature/channel-selection` (depends on Google sign-in / PR #5): saved channel choices, goal-based recommendation, persisted campaign draft state and owner-scoped cloud profiles/workspaces. Acceptance: no-website flow continues to channels; choices survive reload; cloud rows are protected by ownership RLS.

- `feature/runtime-baseline` (depends on `feature/no-website-onboarding`): record the existing SDK 57/configuration repairs and pin animation peers to Expo's compatibility matrix. Acceptance: clean install, typecheck, lint and existing tests.
- Next: Google sign-in with secure session handling; persistent campaign workflow; camera/gallery and previews; review/submission and results; protected backend and provider adapters. Live Google OAuth needs a configured Supabase project/Google provider; advertising needs separate provider approvals and credentials.
- `feature/google-sign-in` stacked on `feature/runtime-baseline` (PR #4): Google OAuth via Supabase PKCE, secure native sessions, cancellation/retry/sign-out, route guard and explicit demo entry. Setup/acceptance: `docs/google-sign-in.md`. Live end-to-end login awaits Supabase/Google configuration.

- Optional website onboarding: 16 tests pass (validation, native storage mocks, form interaction including retry and duplicate taps); typecheck/lint pass; web export passes. No Android/iOS device or interactive browser verification was available. Tests/build ran against the workspace's existing uncommitted SDK 57 dependency updates; these unrelated dependency/config changes are not included in this feature commit.
- Goal selection saves a draft only. Later account/campaign screens remain unimplemented; missing website does not authorize submitting a campaign without a supported destination.

- No live Figma URL was provided; exported SVG/PNG/HTML/JSON are the active design reference.
- Google Ads and Meta credentials, app approvals, billing setup, and OAuth redirect configuration are not available. No real provider integration or paid submission can be enabled yet.
