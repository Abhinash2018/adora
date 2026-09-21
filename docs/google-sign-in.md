# Google sign-in

Acceptance: a working sign-in action, PKCE callback, encrypted native session persistence, refresh, cancellation/error handling, sign-out, and protected routes. Missing configuration is displayed explicitly and never produces a fake logged-in account. Demo is a separate user-selected workspace.

1. Create a Supabase project. Copy its public project URL and public anon/publishable key to the variables in `.env.example` (use `.env` locally, never commit it).
2. In Google Cloud, configure the OAuth consent screen and a **Web application** OAuth client. Add the exact callback URL shown in Supabase Authentication > Providers > Google (normally `https://PROJECT.supabase.co/auth/v1/callback`). Configure allowed test users while the Google app is in testing.
3. Enable Google in Supabase and enter the Google client ID and secret **in the Supabase dashboard only**. Do not put the Google secret or Supabase service-role key in any `EXPO_PUBLIC_` setting.
4. In Supabase Auth URL configuration, allow `adora://auth/callback`. For browser preview, separately allow your exact origin plus `/auth/callback` (for example `http://localhost:8081/auth/callback`). Use HTTPS for hosted previews and production.
5. Restart Expo after environment changes. On Android/iOS, make a development build with the registered `adora` scheme; Expo Go is for demo only. Web preview also supports the same Google flow.
6. Tap Continue with Google, complete consent, verify you return to Business, reopen the app to test session restoration, then use My account > Sign out. Test cancellation, expired links, and offline refresh on actual devices before release.

The Supabase client handles PKCE verification. Duplicate callback consumers share a single exchange. Google sign-in requests identity scopes only; it does not grant Google Ads access. Native session chunks use SecureStore; browser sessions use tab-scoped sessionStorage. Use a strong CSP and HTTPS when deploying the browser preview. Apple sign-in/account deletion and store policy review must be completed before an iOS App Store release.

References checked 2026-09-21: [Supabase Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Expo OAuth](https://docs.expo.dev/guides/authentication/), [Supabase mobile links](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).
