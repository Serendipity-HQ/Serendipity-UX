# Invitation Entrance Design QA

- Source visual truth: `.design-qa/entrance-modernization/03-modern-reference-open.png`
- Implemented open state: `.design-qa/entrance-modernization/05-implementation-open-desktop.png`
- Implemented closed state: `.design-qa/entrance-modernization/04-implementation-closed-desktop.png`
- Full-view comparison: `.design-qa/entrance-modernization/08-reference-vs-implementation-open.jpg`
- Before/after evidence: `.design-qa/entrance-modernization/10-before-vs-after-open.jpg`
- Mobile evidence: `.design-qa/entrance-modernization/06-implementation-closed-mobile.png`, `.design-qa/entrance-modernization/07-implementation-open-mobile.png`
- Viewports: 1280px desktop; 390 × 844 mobile
- State: authenticated test member; two high-confidence recommendations available from the current event feed

## Full-view comparison evidence

The implemented screen reproduces the source's editorial dispatch structure: stamped greeting, city-post heading, cream paper ledger, one open action, and a single readable row for each recommendation. The supplied hand-lettered Serendipity SVG intentionally replaces the older leaf-plus-typeset mark. The recommendation feed returned two strong matches during QA, so the implementation truthfully uses two rows and a quality-held note rather than claiming three.

## Focused-region comparison evidence

The open-state comparison keeps both 1280px captures side by side at readable scale. It confirms the ledger header, row rhythm, image proportions, lane stamps, host/date metadata, pricing, arrows, paper texture, rules, and offset shadow. Mobile captures separately confirm the closed cover, open action, row wrapping, and fixed bottom navigation without horizontal overflow.

## Required fidelity surfaces

- Fonts and typography: passed. Serif display hierarchy, monospaced stamps, utility labels, and handwritten SVG logo are coherent with the source. Long event titles wrap within their row rather than taking over a full photo card.
- Spacing and layout rhythm: passed. The source's wide ledger, ruled rows, square photo crops, small-radius paper surface, and terracotta offset shadow are retained. Mobile reflows to 86px thumbnails and compact metadata without overflow.
- Colors and visual tokens: passed. The shared paper green, cream, charcoal, terracotta, sage, and purple lane tokens are preserved. The former translucent shortage card was replaced by a legible paper note.
- Image quality and asset fidelity: passed. Event images use their real feed URLs. The supplied `public/serendipity-lettering.svg` is used directly in the header; no logo approximation was created.
- Copy and content: passed. The screen no longer promises three when fewer than three recommendations clear the algorithm's quality gates. Recommendation reasons remain visible in each opened row.

## Comparison history

### Iteration 1

- [P1] The branch used a stacked, one-at-a-time photo-card reveal instead of the selected open-dispatch interaction.
- Fix: restored one sealed dispatch cover and one open action that reveals the complete recommendation list.
- Post-fix evidence: comparison 10 shows the stacked card replaced by the editorial ledger.

- [P1] Long event titles dominated the stack and obscured useful metadata.
- Fix: moved recommendations into structured rows with bounded title, rationale, host, date, price, and detail-link regions.
- Post-fix evidence: desktop capture 05 and mobile capture 07 show readable long-title behavior.

- [P2] The page could say “three” while the algorithm returned two strong recommendations.
- Fix: made all counts and grammar dynamic and added a legible quality-held explanation for missing lanes.
- Post-fix evidence: captures 04–07 consistently state two invitations for the tested feed.

- [P2] The header used the older leaf-plus-typeset brand mark.
- Fix: replaced both public and authenticated desktop header marks with the supplied hand-lettered SVG.
- Post-fix evidence: captures 04 and 05 show the new logo at top left.

## Interaction and runtime checks

- The closed dispatch opens with one click and honors reduced-motion preferences.
- Opened invitation rows navigate to their corresponding experience detail routes.
- Dynamic counts support zero, one, two, three, or more recommendations without contradictory copy.
- 390px mobile measurement: `scrollWidth` 390px, no horizontal overflow.
- Browser console: no error-level entries; only development/HMR messages.
- Lint and TypeScript checks pass.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] Very long recommendation rationales are visually clamped on mobile; their full text remains in the accessible link name and on larger screens.

final result: passed
