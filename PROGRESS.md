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

- Optional website onboarding: 16 tests pass (validation, native storage mocks, form interaction including retry and duplicate taps); typecheck/lint pass; web export passes. No Android/iOS device or interactive browser verification was available. Tests/build ran against the workspace's existing uncommitted SDK 57 dependency updates; these unrelated dependency/config changes are not included in this feature commit.
- Goal selection saves a draft only. Later account/campaign screens remain unimplemented; missing website does not authorize submitting a campaign without a supported destination.

- No live Figma URL was provided; exported SVG/PNG/HTML/JSON are the active design reference.
- Google Ads and Meta credentials, app approvals, billing setup, and OAuth redirect configuration are not available. No real provider integration or paid submission can be enabled yet.
