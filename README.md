# Adora

Adora is a React Native/Expo mobile app that makes the path from business details to a reviewable ad campaign clear and safe. It is not a web view and does not submit ads or process payments in this foundation release.

## Current increment

`feature/mobile-foundation` establishes the Expo TypeScript app, native navigation shell, Figma-export-derived visual tokens, development-build configuration, lint/type/test scripts, CI, and the first responsive welcome experience. The supplied export was used because no live Figma file was shared.

## Run

```sh
npm install
npx expo start
```

For native integrations, install a development client and use a development build:

```sh
npx expo install expo-dev-client
npx expo run:android --device
# macOS only for iOS local builds:
npx expo run:ios --device
```

After native dependency or app-config changes, regenerate before rebuilding with `npx expo prebuild --clean`. Windows can build Android locally; an iOS device/simulator build requires macOS/Xcode or an EAS build.

## Architecture roadmap

The mobile app will use Expo Router and secure session storage. A future server (TypeScript API + PostgreSQL + object storage) will own user/business access control, provider OAuth tokens, ad API calls, AI generation, idempotent submission and campaign records. Advertising credentials never belong in the mobile bundle. Until live provider credentials, app review, billing setup, and consent flows are available, integrations will be explicitly simulated.

See [PROGRESS.md](PROGRESS.md) for delivery state and [AGENTS.md](AGENTS.md) for the required branch/PR workflow.
