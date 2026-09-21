# Adora delivery workflow

For each feature, define acceptance criteria, branch from the latest `main` (or document a required stacked dependency), implement, run relevant checks, commit, push, and open a PR. Never merge, force-push, delete branches, add secrets, launch paid campaigns, or represent a mock provider response as live behavior. Verify remote owner and URL before every push.

Branch format: `feature/<descriptive-name>`. PRs must state scope, checks, platform verification, dependencies, limitations, and how to try the change. Keep `PROGRESS.md` current. Provider access lives server-side only; do not commit `.env` files, OAuth secrets, access tokens, or card data.
