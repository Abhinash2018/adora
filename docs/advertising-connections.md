# Advertising connections

Scope / acceptance: separate identity and Ads consent; single-use expiring OAuth state tied to the authenticated owner; encrypted server-only tokens; account and asset selection verified against provider access; reconnect/disconnect/expired/missing-permission UI; explicit sample accounts only in demo. No campaign writes.

Stacked on `feature/channel-selection` (PR #6). Google and Meta share the same server token boundary and account-selection UI, so this feature ships the two adapters together.

Run both SQL migrations, configure `server/.env.example` values in root `.env.server` (never commit), and run `npm run server`. Configure public HTTPS OAuth callbacks `/oauth/google/callback` and `/oauth/meta/callback`. Set `EXPO_PUBLIC_API_URL` to that server's `/api` root. For a physical phone, localhost refers to the phone, not the development machine. Use a trusted HTTPS endpoint. The server binds loopback by default; set HOST only when intentionally exposing development access.

Google: separate OAuth client with Ads scope, developer token and eligible customer account. Select the supported API version in server configuration. Direct accessible USD customer accounts only in this increment; manager-account traversal is not implemented. Review access levels and test-account limitations at https://developers.google.com/google-ads/api/docs/api-policy/access-levels and OAuth at https://developers.google.com/google-ads/api/docs/oauth/overview.

Meta: configure app credentials and supported Graph version, app review/business verification/advanced access as applicable for ads_management, ads_read, pages_show_list, pages_read_engagement, instagram_basic. Link professional Instagram to a manageable business page. Official authorization documentation at https://developers.facebook.com/docs/marketing-api/get-started/authorization/ was inaccessible from this environment; current eligibility and permission requirements must be revalidated in the app dashboard before live use. First 100 accounts/pages only; pagination remains a limitation.

Billing setup stays in platform-owned secure pages. Adora never creates accounts, verifies businesses, collects cards or guarantees eligibility automatically. Disconnect deletes Adora's stored token; it does not stop provider campaigns or revoke provider-side consent. Revoke app access in provider settings when necessary.

Verification: encryption/tamper detection and unauthenticated-request tests; mobile typecheck and lint. No live credentials, provider review, device or OAuth end-to-end test available. Production needs distributed rate limiting, operational monitoring without tokens, infrastructure secret management and credential-rotation procedures. Provider callback pages render plain text without third-party assets.
