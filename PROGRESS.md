# Adora progress

The complete **demo** flow is implemented. Real Google sign-in and server integration code require external configuration. **Live paid campaign submission/reporting/control adapters remain unfinished and hard-disabled.** No ads were launched or cards charged.

## Delivery

All branches below are stacked on the previous row unless noted. They are pushed and awaiting review, not automatically merged into main. Feature scope/acceptance and setup are in the linked docs.

| Feature branch | Commit | PR | Scope / how to try |
| --- | --- | --- | --- |
| feature/runtime-baseline | 7922e19 | [#4](https://github.com/Abhinash2018/adora/pull/4) | Depends on no-website-onboarding / #3; records SDK 57/runtime repairs. |
| feature/google-sign-in | dcffc2c | [#5](https://github.com/Abhinash2018/adora/pull/5) | [Google sign-in setup](docs/google-sign-in.md); separate demo entry. |
| feature/channel-selection | 6b76fa0 + a551b17 | [#6](https://github.com/Abhinash2018/adora/pull/6) | Choose a goal and platform; persisted owner-scoped drafts. |
| feature/advertising-connections | 96f171d | [#7](https://github.com/Abhinash2018/adora/pull/7) | [Accounts](docs/advertising-connections.md); separate Ads consent and sample selection. |
| feature/photo-upload | fa0efcf | [#8](https://github.com/Abhinash2018/adora/pull/8) | [Photos](docs/photo-upload.md); camera/gallery, private storage and previews. |
| feature/ai-ad-creation | dfafe3f | [#9](https://github.com/Abhinash2018/adora/pull/9) | [Ad creation](docs/ai-ad-creation.md); fact-only AI, editable previews, local demo. |
| feature/budget-and-approval | 22c8563 | [#10](https://github.com/Abhinash2018/adora/pull/10) | [Budget/review](docs/budget-and-approval.md); no-website phone/message destinations. |
| feature/campaign-submission | 8433ea0 | [#11](https://github.com/Abhinash2018/adora/pull/11) | [Records](docs/campaign-submission.md); idempotent demo submission, server-owned reviews. |
| feature/results-dashboard | d3ade38 | [#12](https://github.com/Abhinash2018/adora/pull/12) | [Dashboard](docs/results-dashboard.md); saved history and demo pause/resume/stop. |
| feature/flow-verification | 7748393 + documentation follow-up | [#13](https://github.com/Abhinash2018/adora/pull/13) | [Verification](docs/verification.md); connected-screen tests, storage/security fixes and complete setup instructions. |

Earlier history: mobile-foundation PR #1 was already merged; auth-business-profile PR #2 and no-website-onboarding PR #3 are prior dependencies. No PR was merged during this completion work. The latest stacked branch contains the full application; main remains unchanged.

## Verification

- 42 mobile/domain/component tests and 8 server tests passed locally; lint and mobile/server typecheck passed.
- Android, iOS and web JavaScript bundles exported successfully. No native compilation or device/emulator testing occurred; no interactive browser visual verification was available.
- GitHub CI succeeded for campaign-submission (#11, run 35570543831) and results-dashboard (#12, run 35570869695). PR #13 also runs all-platform JS exports; see its checks for the latest server-side result.
- Entire no-website demo screen flow is exercised, including camera/gallery boundary mocks, approval and pause/stop. This does not prove device hardware, OAuth or paid provider behavior.
- npm reports 13 moderate transitive dependency advisories; SDK-compatible remediation still needs review.

## Remaining blockers / unfinished production work

- No local .env or .env.server: Supabase project/public settings, deployed migrations, Google OAuth provider/callbacks and a development build are needed to use real sign-in. Configure secrets only in supported dashboards/server storage.
- Google Ads developer access/client credentials and Meta app review/permissions/eligibility, supported API versions and secure billing setup are not available. Meta official docs returned an access/rate-limit error; reverify in provider documentation before live use.
- AI requires a server-only key/model and user consent; no paid generation was tested. OpenAI Docs informed the Responses API implementation.
- Paid submission adapters, exact targeting/date/fee/billing validation, provider-enforced spending controls, reconciliation, real metrics and pause/stop still require implementation plus sandbox/device testing. Credentials alone do not enable them.
- Production privacy/account deletion, storage retention, store-policy review (including Apple sign-in where required), distributed rate limits and operational secret management remain.
- No live Figma URL was supplied; provided exports were the design reference.

Run instructions: [README](README.md). The complete demo requires no backend credentials and is clearly labeled at every campaign step.
