# Photo uploads

Scope / acceptance: native system camera/gallery; cancellation and permission errors; JPEG/PNG/WebP up to 5 MB, at most 5 per draft; durable demo files (browser IndexedDB); authenticated private cloud bucket; short-lived view URLs; removal invalidates copy approval. Photos remain unaltered. Stacked on advertising-connections / PR #7.

Apply migration 003. Rebuild development binaries for camera permission changes. A phone camera must be tested on physical hardware; this environment can only run typecheck, validation tests and bundle exports. No cloud upload has been tested without credentials.

Try: Explore demo → business → goal → platforms → continue → gallery/camera. Relaunch to verify saved photos. For live storage use configured Supabase login. The photo picker opens only in response to a user action. Missing files show retry/add-again guidance.

Removing a draft reference does not delete source files that may be used by a campaign snapshot. Production retention/cleanup and account-deletion lifecycle need deployment policy. Demo images remain on the device/browser. Do not put sensitive photos in demo on shared devices.

References: https://docs.expo.dev/versions/latest/sdk/imagepicker/, https://docs.expo.dev/versions/latest/sdk/filesystem/, https://supabase.com/docs/guides/storage/security/access-control
