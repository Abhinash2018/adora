# Optional website onboarding

Branch: `feature/no-website-onboarding`.
Stacked dependency: `feature/auth-business-profile` (PR #2).

## Acceptance criteria

- Explicitly choosing "I don't have a website" permits a blank link.
- Name, location, and description remain required. A link remains required and validated when the choice is off.
- The preference survives saving/reloading; stale links are excluded from saved no-website profiles. Older profiles retain the website requirement.
- Saving successfully opens goal selection. Failed saves stay on the form with retry feedback; repeated taps do not save/navigate twice.
- Goal selection offers bookings/sales, calls, and messages. Website-based campaigns will still require a supported destination before submission. No landing page or campaign is created by this feature.
- Browser preview supports local profile storage; Android/iOS retain SecureStore. The form scrolls for keyboards and smaller screens.

## Try it

Open the business form, enter name, location and description, choose "I don't have a website", then press Save and continue. The next screen should ask what you want more of. Go back or reload the form to verify the preference. Turn the option off and try an empty/invalid link to verify validation. Choose a goal and save it, then reload to verify that choice.
