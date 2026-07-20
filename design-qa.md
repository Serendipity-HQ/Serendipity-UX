# Auth Style Design QA

- Source visual truth: `.design-qa/auth-style/11-root-reference-viewport.png`
- Login implementation: `.design-qa/auth-style/12-login-final-desktop.png`
- Signup implementation: `.design-qa/auth-style/13-signup-role-final-desktop.png`
- Desktop comparisons: `.design-qa/auth-style/14-root-vs-login-comparison.jpg`, `.design-qa/auth-style/15-root-vs-signup-comparison.jpg`
- Mobile evidence: `.design-qa/auth-style/09-login-final-mobile.png`, `.design-qa/auth-style/10-signup-role-final-mobile.png`
- Viewports: 1280 × 721 desktop; 390 × 844 mobile
- State: public, signed out; Login form ready; Signup role selection and account-entry steps

## Full-view comparison evidence

The landing page and revised auth screens use the same pale paper background, cream printed sheets, charcoal serif display type, terracotta editorial kickers, fine horizontal rules, square controls, and teal/terracotta offset shadows. The auth pages retain a distinct task layout while reading as part of the same city-post system.

## Focused-region comparison evidence

The Login and Signup paper sheets are legible at original resolution in the desktop captures. Mobile captures separately verify the form controls, role cards, button treatment, wrapping, and small-screen spacing. No additional crop was needed because the relevant form regions are large and readable in these captures.

## Required fidelity surfaces

- Fonts and typography: passed. Serif display hierarchy and sans-serif utility labels match the source system; headings wrap cleanly at desktop and mobile sizes.
- Spacing and layout rhythm: passed. Editorial masthead rules, two-column desktop composition, sheet padding, field spacing, and mobile stacking are consistent. No horizontal overflow at 390px.
- Colors and visual tokens: passed. Shared cream, paper green, charcoal, terracotta, teal, and border tokens are used without the former glass/white-opacity treatment.
- Image quality and asset fidelity: passed. No new raster imagery was required; existing Lucide interface icons and the shared paper texture render cleanly.
- Copy and content: passed. Existing authentication and questionnaire meaning is preserved, with supporting copy adjusted only to fit the established editorial voice.

## Comparison history

### Iteration 1

- [P1] Auth screens used rounded translucent cards and pill buttons that visibly conflicted with the printed-paper app system.
- Fix: replaced glass surfaces with shared `entry-sheet`, `field-input`, `paper-button`, `interest-chip`, and invitation-card patterns; added the established editorial masthead and hierarchy.
- Post-fix evidence: desktop comparisons 14 and 15 show aligned typography, palette, rules, surfaces, radii, and shadows.

- [P2] The first mobile Login pass placed the primary Sign in action below the initial viewport.
- Fix: reduced small-screen editorial spacing and hid the supporting aside on narrow viewports while preserving the full desktop composition.
- Post-fix evidence: capture 09 shows the Sign in button fully visible at 390 × 844; its measured bottom edge is 782px.

## Interaction and runtime checks

- Signup role selection advances to the account form.
- Login fields accept input and retain correct accessible labels.
- Submit remains enabled after valid field entry.
- Public navigation and cross-links remain present.
- Browser console: no errors.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] Secondary account links can require a small scroll on shorter phones; the primary actions remain visible and usable.

final result: passed
