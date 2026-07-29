# Dark Textured Home Design QA

- Source visual truth: `.design-qa/dark-home/00-source-original-green.png`
- Final mobile implementation: `.design-qa/dark-home/10-final-closed-mobile.png`
- Final opened state: `.design-qa/dark-home/11-final-open-mobile.png`
- Final desktop implementation: `.design-qa/dark-home/12-final-closed-desktop.png`
- Final full-view comparison: `.design-qa/dark-home/13-final-source-vs-implementation-mobile.jpg`
- Viewports: 390 × 844 mobile; 1280 × 900 desktop
- State: authenticated member with three invitations; closed dispatch for source comparison, opened dispatch for interaction QA

## Full-view comparison evidence

The final 390 × 844 comparison places the selected ImageGen reference and the browser-rendered implementation at the same scale. The implementation matches the reference's dark forest paper field, warm ivory greeting, muted coral utilities, dashed section rule, cream invitation ledger, terracotta offset edge, and bright cream navigation dock. The invitation begins at 409px and the fixed navigation begins at 757px, matching the source's defining vertical proportions.

The source says “Good afternoon” while the final capture says “Good evening” because the production greeting follows the member's current local time. This is an intentional dynamic-content difference, not visual drift. The implementation also renders all three truthful lane badges, while the generated reference accidentally depicted only two despite saying three invitations.

## Focused-region comparison evidence

A separate crop was not needed: the 1:1 mobile comparison keeps the greeting, paper texture, invitation typography, stamps, action, and navigation icons readable. The opened-state capture separately verifies the denser recommendation rows at their native mobile width.

## Required fidelity surfaces

- Fonts and typography: passed. Cormorant Garamond supplies the high-contrast editorial display face; Inter supplies readable body, utility, stamp, and navigation text. The mobile greeting is 53.6px with a 0.93 line height and preserves the source's two-line wrap.
- Spacing and layout rhythm: passed. Page margins remain 20px. The ledger starts at 409px, ends at 721px, and leaves the same deliberate breathing room above the 87px navigation dock. Desktop expands the same hierarchy without horizontal overflow.
- Colors and visual tokens: passed. Warm ivory, sage-gray, muted terracotta, cream paper, and restrained lane colors remain legible against the dark forest surface. The active Home glyph uses the forest token against the cream dock.
- Image quality and asset fidelity: passed. `public/textures/home-forest-paper.webp` is a dedicated 1024px raster paper texture derived from the selected visual direction, optimized to 120KB. The supplied Serendipity logo and existing real icon library remain intact.
- Copy and content: passed. The screen consistently states three invitations. The year is included to match the source date treatment. Dynamic greeting and the extra truthful Surprise badge are documented product-data differences.

## Comparison history

### Iteration 1

- [P2] The first implementation used the existing light paper asset with color blending, so the green field read flatter than the selected texture.
- Fix: generated and installed a dedicated dark forest paper raster, removing the color-blend approximation.
- Pre-fix evidence: `.design-qa/dark-home/07-source-vs-implementation-mobile.jpg`.
- Post-fix evidence: `.design-qa/dark-home/09-source-vs-textured-implementation-mobile.jpg` and `.design-qa/dark-home/13-final-source-vs-implementation-mobile.jpg`.

- [P2] The first mobile pass compressed the source composition: the ledger began near 393px and the navigation dock was 69px tall.
- Fix: increased the editorial greeting scale, reduced the closed-ledger height, and set the navigation links to a 76px minimum so the dock occupies 87px overall.
- Pre-fix evidence: `.design-qa/dark-home/01-implementation-closed-mobile.png`.
- Post-fix evidence: `.design-qa/dark-home/10-final-closed-mobile.png`; measured ledger top 409px and navigation top 757px.

## Interaction and runtime checks

- The closed ledger opens with one activation and reveals all three invitation links.
- Opened recommendation rows preserve title, host, personalized reason, date, and detail navigation.
- Mobile measurement: `innerWidth` 390px and `scrollWidth` 390px; no horizontal overflow.
- Desktop measurement: `innerWidth` 1280px and `scrollWidth` 1280px; no horizontal overflow.
- Navigating away from `/home` restores the existing light paper theme on other routes.
- Browser console: no error-level entries in mobile or desktop states.
- Lint, TypeScript, and production build pass.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] The Next.js development badge overlaps the Home glyph in local screenshots. It is development-only and does not ship in the production deployment.

final result: passed
