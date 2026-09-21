# Adora

Adora is a native React Native + Expo SDK 57 + TypeScript mobile app for business owners. Android/iOS screens use native components and Expo Router, not a WebView. The supplied design exports provide the warm neutral/forest/coral visual direction.

## What works in this build

- Complete, clearly labeled demo: business profile → optional website → goal → platform recommendation/selection → sample accounts → camera/gallery → editable ad previews → budget/destination → explicit approval → saved campaigns → simulated review, pause/resume/stop.
- Saved progress, original photos, reusable UI, loading/error/retry states, accurate campaign states, whole-cent budget validation, immutable approval snapshots and duplicate-submission protection.
- Real Google identity sign-in via Supabase PKCE, configured separately from Google Ads authorization. It requires your Supabase project and Google OAuth configuration; no login is faked when these are absent.
- Server-only Google Ads/Meta OAuth/account-selection adapters, encrypted provider tokens, private photo storage and fact-constrained AI copy generation. These paths require configuration and live integration verification.

**Not production-ready:** paid campaign creation, targeting, final fee/tax quote, billing eligibility checks, platform-enforced budget setup, provider reporting and live pause/stop adapters are not implemented/enabled. The server deliberately rejects paid actions. Credentials alone cannot enable spending. No ads or charges were created during development. See [live-launch requirements](docs/campaign-submission.md).

All feature PRs are stacked and unmerged. The latest branch contains the preceding work; `main` is not automatically updated. See [PROGRESS.md](PROGRESS.md) for commits/PRs/dependencies.

## Try the full demo

Use Node 22.13.13+ (Node 22 LTS recommended) and npm. On Windows PowerShell use `npm.cmd` / `npx.cmd` if execution policy blocks the `.ps1` wrappers.

```sh
npm ci
npx expo start --go --clear
```

Install an Expo Go version compatible with SDK 57 on your phone, use the same network, and scan the **new QR shown in the terminal** (Android: Expo Go scanner; iOS: Camera). If that Expo Go version is unavailable, use a development build below. Browser text/JSON at port 8081 is an Expo manifest, not the mobile app. Do not open a localhost URL on a phone. If the LAN is blocked, Expo's `--tunnel` option can help but may require an additional tunnel package and internet access.

Tap **Explore demo — no account needed**. No `.env`, account credentials, provider APIs or paid services are required. Choose Calls with a valid business phone number to try the complete no-website path. Photos are real local uploads; demo copy and campaign status changes are explicitly simulated. Google sign-in is not supported through this Expo Go demo path.

If port 8081 is occupied, stop the prior Adora terminal with Ctrl+C or start on `--port 8082` and scan its new QR. Do not stop unrelated Node processes. A web-only preview is `npx expo start --web`; it does not verify Android/iOS.

## Google sign-in and development builds

Follow [Google sign-in setup](docs/google-sign-in.md): create a Supabase project, enable the Google provider with a Google Cloud web OAuth client, configure Supabase's callback in Google, allow `adora://auth/callback` in Supabase, and set only the public Supabase URL/key in root `.env` using [.env.example](.env.example). Keep Google secrets in the Supabase dashboard. Apply the migrations below for saved account data.

Real mobile OAuth requires an installed Adora development build. Camera/plugin changes also require rebuilding the binary. With the relevant native SDK installed:

```sh
npx expo run:android --device
# macOS only for iOS local builds:
npx expo run:ios --device
npx expo start --dev-client --clear
```

If generated native projects already exist, regenerate with `npx expo prebuild` after backing up any manual native changes, then rebuild. Do not delete native project changes casually.

Alternatively, use an Expo account and EAS (build quotas/Apple enrollment or fees may apply; these commands were not run):

```sh
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android
# For an enrolled iOS device and configured Apple signing:
npx eas-cli@latest build --profile development --platform ios
```

Install the resulting development build, then run `npx expo start --dev-client`. Follow the official [Expo development-build guide](https://docs.expo.dev/develop/development-builds/introduction/). Windows does not provide local iOS/Xcode builds. Never paste passwords, access tokens or provider secrets into chat.

## Backend and database

Straightforward architecture: Supabase Auth + PostgreSQL + private object storage, with a separate Express/TypeScript API for advertising credentials, account selection, AI requests and server-owned campaign reviews. Native sessions use chunked SecureStore; browser preview sessions use sessionStorage. Demo workspaces stay in AsyncStorage and photos in native document storage/browser IndexedDB.

1. In your Supabase SQL editor or migration tooling, apply `supabase/migrations/*.sql` in filename order (001–004). These create profiles/workspaces with owner RLS, server-only encrypted provider connections and OAuth state, the private photo bucket, and immutable campaign records. Review migrations before deploying; they have not been applied to a real project here.
2. Create root `.env` from `.env.example` with public project settings. Create root `.env.server` from `server/.env.example` with server-only credentials. Both are ignored by Git. For `TOKEN_ENCRYPTION_KEY`, generate and securely store 32 random bytes encoded as base64; never reuse a public value or put it in `EXPO_PUBLIC_` variables.
3. Start `npm run server`. Local health endpoint: `http://localhost:3000/health`. API base: `http://localhost:3000/api`. For a physical phone or hosted app, deploy a trusted **HTTPS** backend and configure `EXPO_PUBLIC_API_URL=https://YOUR_HOST/api`. The API binds loopback by default; use a deliberate deployment setup/reverse proxy, not an unprotected public development server.
4. Configure separate advertising OAuth callback URLs and permissions using [account-connection setup](docs/advertising-connections.md). Select accounts/assets, finish supported platform account/billing setup, and verify provider review/access requirements. Ordinary Google login does not grant Ads access.
5. For AI, configure server-only `OPENAI_API_KEY` and an appropriate vision/structured-output `OPENAI_MODEL`. Generation occurs only after the user consents and taps Generate. [AI implementation and limitations](docs/ai-ad-creation.md) explains fact-only composition and manual fallback. The OpenAI Docs skill informed the Responses API integration. No generation API calls were made during testing.

Storage removal currently removes draft references, not historical source assets. Production still needs a retention/account-deletion policy, distributed rate limits, observability/secret rotation, store privacy declarations, Apple sign-in/store-policy review where required, live provider contracts and hardware testing. Do not deploy this as a production paid-ad service yet.

## Verification

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
npm run test:server
npx expo export --platform all --no-bytecode --output-dir dist
```

CI runs these checks. Tests cover Google callback behavior/session storage, optional-website onboarding, the entire demo screen flow, exact budgets, safe destinations, authorization boundaries, encrypted token tampering, fact-only copy, campaign transitions and duplicate submissions. Bundle export is a JavaScript integration check, **not** a native build or device test. Exact results and remaining blockers are recorded in [PROGRESS.md](PROGRESS.md).

See [PROGRESS.md](PROGRESS.md) for delivery state and [AGENTS.md](AGENTS.md) for the required branch/PR workflow.
