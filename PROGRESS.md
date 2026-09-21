# Progress

| Status | Feature | Branch | Dependency | Notes |
| --- | --- | --- | --- | --- |
| Complete (PR #1 open) | Mobile foundation | `feature/mobile-foundation` | `main` | Expo TypeScript shell, native navigation foundation, design tokens, CI and dev-build setup. |
| In progress | Auth and business profile | `feature/auth-business-profile` | `feature/mobile-foundation` | Local encrypted profile draft and validation; server authentication remains pending backend design. |
| Planned | Channel selection | `feature/channel-selection` | business profile | Google/Meta connection states remain distinct. |
| Planned | Provider connections | separate Google/Meta branches | channel selection | Requires approved OAuth and advertising API credentials. |
| Planned | Assets, AI, budget, review, submission, results | feature branches | prior features | No paid campaign actions in development. |

## Blockers

- No live Figma URL was provided; exported SVG/PNG/HTML/JSON are the active design reference.
- Google Ads and Meta credentials, app approvals, billing setup, and OAuth redirect configuration are not available. No real provider integration or paid submission can be enabled yet.
