# Invitation Entrance Audit

## Audit scope

The authenticated `/home` entrance flow, from seeing the weekly recommendation prompt through opening the invitations and selecting an experience. Evidence was captured from the current branch and from the newer dispatch implementation already present in the workspace.

## User goal and accessibility target

Understand that a curated weekly set is waiting, open it once, compare every strong recommendation, understand why each one fits, and continue to an experience detail page. Controls should remain clear by keyboard and touch, with honest state communication and responsive reflow.

## Steps

1. **Current stacked invitation reveal — needs replacement.** The oversized photo card requires repeated taps, hides the set as a whole, and lets long titles overwhelm the screen. Evidence: `.design-qa/entrance-modernization/01-current-stacked-invitations.png`.
2. **Closed dispatch entrance — healthy after fix.** One large, clearly labeled button communicates that three recommendations are enclosed and gives a single obvious action. Evidence: `.design-qa/entrance-modernization/11-three-invite-closed-desktop.png`.
3. **Opened recommendation list — healthy after fix.** All three recommendations appear together with lane, title, host, personalized reason, date, price state, and detail affordance. Evidence: `.design-qa/entrance-modernization/12-three-invite-open-desktop.png`, `.design-qa/entrance-modernization/13-three-invite-open-mobile.png`.
4. **Experience continuation — healthy after fix.** Selecting a row opens the matching experience page, where booking, sharing, and Passion Path actions remain available.

## Strengths

- The modern dispatch interaction feels intentional and supports comparison without turning the page into a feed.
- Recommendation rationales preserve the intelligence of the trajectory engine instead of showing event category alone.
- The weekly set now fulfills the three-invitation promise without lowering Passion or Growth quality: open slots become distinct Adventure recommendations selected for novelty.
- The supplied hand-lettered logo now makes the header feel specific to Serendipity.

## UX risks addressed

- Removed repeated reveal taps and hidden-card uncertainty.
- Removed the two-result dead end by adding deterministic Adventure supplementation from active inventory.
- Prevented long titles from consuming an entire visual card.
- Replaced a low-contrast translucent shortage message with a readable printed note.

## Accessibility risks addressed

- The dispatch cover is a semantic button with a descriptive accessible name and visible focus treatment.
- Each recommendation is a full semantic link, with metadata included in its accessible name.
- Reduced-motion users receive a near-instant state change.
- Mobile content reflows at 390px without horizontal overflow.

## Evidence limits

Screenshot review cannot establish full WCAG conformance. Screen-reader announcement order, keyboard traversal across every browser, and high-zoom behavior beyond the tested responsive viewport should still be included in formal accessibility testing.
