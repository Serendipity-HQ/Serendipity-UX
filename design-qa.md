# Invitation Entrance Design QA

- Source visual truth: `.design-qa/entrance-modernization/03-modern-reference-open.png`
- Implemented open state: `.design-qa/entrance-modernization/12-three-invite-open-desktop.png`
- Implemented closed state: `.design-qa/entrance-modernization/11-three-invite-closed-desktop.png`
- Full-view comparison: `.design-qa/entrance-modernization/08-reference-vs-implementation-open.jpg`
- Before/after evidence: `.design-qa/entrance-modernization/10-before-vs-after-open.jpg`
- Mobile evidence: `.design-qa/entrance-modernization/13-three-invite-open-mobile.png`
- Viewports: 1280px desktop; 390 × 844 mobile
- State: authenticated test member; one strict Growth match plus two Adventure matches from the current event feed

## Full-view comparison evidence

The implemented screen reproduces the source's editorial dispatch structure: stamped greeting, city-post heading, cream paper ledger, one open action, and three readable recommendation rows. The supplied hand-lettered Serendipity SVG intentionally replaces the older leaf-plus-typeset mark. The trajectory engine preserves strict Passion and Growth quality gates, then fills an open slot with a distinct high-novelty Adventure so the weekly promise is always a complete three-card set when three active experiences are available.

## Focused-region comparison evidence

The open-state comparison keeps both 1280px captures side by side at readable scale. It confirms the ledger header, row rhythm, image proportions, lane stamps, host/date metadata, pricing, arrows, paper texture, rules, and offset shadow. Mobile captures separately confirm the closed cover, open action, row wrapping, and fixed bottom navigation without horizontal overflow.

## Required fidelity surfaces

- Fonts and typography: passed. Serif display hierarchy, monospaced stamps, utility labels, and handwritten SVG logo are coherent with the source. Long event titles wrap within their row rather than taking over a full photo card.
- Spacing and layout rhythm: passed. The source's wide ledger, ruled rows, square photo crops, small-radius paper surface, and terracotta offset shadow are retained. Mobile reflows to 86px thumbnails and compact metadata without overflow.
- Colors and visual tokens: passed. The shared paper green, cream, charcoal, terracotta, sage, and purple lane tokens are preserved. The former translucent shortage card was replaced by a legible paper note.
- Image quality and asset fidelity: passed. Event images use their real feed URLs. The supplied `public/serendipity-lettering.svg` is used directly in the header; no logo approximation was created.
- Copy and content: passed. The screen consistently presents three invitations. Adventure rationales explicitly explain how each choice moves beyond the member's ordinary patterns, while Passion and Growth keep their stricter meaning. Recommendation reasons remain visible in each opened row.

## Comparison history

### Iteration 1

- [P1] The branch used a stacked, one-at-a-time photo-card reveal instead of the selected open-dispatch interaction.
- Fix: restored one sealed dispatch cover and one open action that reveals the complete recommendation list.
- Post-fix evidence: comparison 10 shows the stacked card replaced by the editorial ledger.

- [P1] Long event titles dominated the stack and obscured useful metadata.
- Fix: moved recommendations into structured rows with bounded title, rationale, host, date, price, and detail-link regions.
- Post-fix evidence: desktop capture 05 and mobile capture 07 show readable long-title behavior.

- [P2] The page could say “three” while the algorithm returned two strong recommendations.
- Fix: kept the strict lane matches, then added a novelty-ranked Adventure supplement for every open slot. Selection also avoids duplicate experiences and prefers different hosts, dates, and topics.
- Post-fix evidence: captures 11–13 consistently show three invitations for the tested feed.

- [P2] The header used the older leaf-plus-typeset brand mark.
- Fix: replaced both public and authenticated desktop header marks with the supplied hand-lettered SVG.
- Post-fix evidence: captures 04 and 05 show the new logo at top left.

## Interaction and runtime checks

- The closed dispatch opens with one click and honors reduced-motion preferences.
- Opened invitation rows navigate to their corresponding experience detail routes.
- The weekly set contains three unique invitations whenever the active inventory contains three eligible future experiences.
- Passion still requires active engagement; Growth still requires active cognitive depth; Adventure fills any open lane by prioritizing novelty relative to the member.
- 390px mobile measurement: `scrollWidth` 390px, no horizontal overflow.
- Browser console: no error-level entries; only development/HMR messages.
- Seven recommendation-engine tests, lint, TypeScript, and the production build pass.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] Very long recommendation rationales are visually clamped on mobile; their full text remains in the accessible link name and on larger screens.

final result: passed
