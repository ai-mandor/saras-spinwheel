# SARAS B release verification

Date: 2026-11-25. Scope: the selected B layout promoted into the browser-persistent app, with four supplied sticker images and custom confetti. Prototype alternatives remain on their separate branch.

## Checks

- PASS: `npm test`, 5 core cases, including stock exhaustion, restore, duplicate-draw prevention, random sampling, and pointer alignment across 2–10 segments.
- PASS: `npm run build`, source syntax checks, and `git diff --check`.
- PASS: `npm run test:browser`, 10 Chrome cases, no page exceptions or console errors.
- PASS: final desktop/mobile wheel and drawer screenshots inspected in local `artifacts/release-*.png`.
- PASS: B is the sole layout, including when a URL supplies old prototype parameters. No comparison controls or state inspector ship.
- PASS: the offline single file embeds all sticker art, completes a draw/handover, and makes zero HTTP requests.
- Not measured: Lighthouse, field Web Vitals, screen-reader behavior, Safari, and physical phone behavior.

## Recorded interactions

- Brand link resolves to index.html, preserving browser-local state.
- Putar roda creates one reserved outcome before animation. Double-click creates one draw; the pointed segment matches the saved prize.
- Landing opens the corresponding sticker image and one confetti burst. Burst clears after 3.2 seconds.
- Result close and Escape preserve the pending outcome. Lihat hadiah reopens it without more stock deduction or confetti.
- Reload restores the same pending prize and image. The winner contains no visible prize-name caption, booth instruction, or turn number.
- Hadiah sudah diterima commits handover, closes the result, retains history, and restores focus to spin.
- Pengaturan opens the right drawer; its close button and Escape dismiss it and return focus.
- Four name/stock rows update their respective stable sticker IDs. All four winning images were exercised. Valid edits persist after reload; invalid stock and whitespace names are rejected.
- Exhausted inventory shows Habis and disables drawing.
- Unduh CSV produces a history download; empty history disables export.
- Reset contoh opens confirmation. Batal preserves state; Ya, reset restores the four example stocks and clears history.
- Blocked storage displays an error and prevents draws/saves. Corrupt data remains untouched until explicit reset.
- Two tabs sharing an origin retain one pending draw when started together; handover updates the other tab.
- Responsive checks at 320/390/768/1024/1440 px found no horizontal page/drawer overflow; 200% root text also fits. Native focus/Enter/Escape were exercised.

## Antislop delivery gate

- R-01 PASS: SARAS palette, no gradients or glow.
- R-02 PASS: concise Indonesian actions; no em dash or marketing filler in UI copy.
- R-03 PASS: five responsive widths and enlarged text checked; buttons and inputs provide at least 44 px targets.
- R-04 PASS: supplied branding, functional pointer, and named close controls; no decorative icon library.
- R-05 PASS: the screen serves spinning, handover, and inventory, with no marketing template.
- R-06 PASS: serif wordmark reflects SARAS; system sans keeps controls legible; sticker lettering remains original.
- R-07 PASS: plain cream makes the wheel silhouette clear; no patterned backdrop.
- R-08 PASS: no decorative button arrows.
- R-09 PASS: example-stock copy identifies actual initial inventory status; no promotional badge.
- R-10 PASS: no glass or backdrop blur.
- R-11 PASS: circles express the physical wheel; controls/dialogs use restrained rectangular corners.
- R-12 PASS: short rim/cap/control shadows describe physical separation.
- R-13 PASS: no glow.
- R-14 PASS: actual inventory rows rather than decorative cards.
- R-15 PASS: Putar roda, Terapkan hadiah, Unduh CSV, and Hadiah sudah diterima name their effects.
- R-16 PASS: no generic AI marketing phrases.
- R-17 PASS: initial stock is disclosed as example data; history counts come from saved draws.
- R-18 PASS: no testimonials or invented people.
- R-19 PASS: action-triggered spin and explicitly requested landing burst each last under five seconds; reduced motion skips nonessential effects.
- R-20 PASS: pink/cream printed face, petal pointer, concentric cap, and supplied artwork form a specific identity.
- R-21 PASS: fixed light follows the owner's brand and booth use.
- R-22 PASS: actual supplied sticker art identifies prizes; no generic filler illustration.
- R-23 PASS: owner provided all images, approved pixel cutouts, requested custom confetti, and selected B.
- R-24 PASS: the sole link resolves to the existing index route.
- R-25 PASS: calculated sRGB ratios: rose/cream 6.05:1, muted/cream 5.15:1, rose/sold-out surface 4.78:1, control rule/cream 3.57:1. Original sticker art is preserved as content.
- R-26 PASS: all visible controls perform the recorded actions.
- R-27 PASS: loading, empty history, exhausted stock, active spin, saving validation, storage errors, and recovery states are implemented and exercised.
- R-28 PASS: no FAQ.
- R-29 PASS: interface colors stay in the SARAS palette; extra artwork colors come from supplied prize content.
- R-30 PASS: the owner's app and physical wheel inform the design; no other product layout is copied.
- R-31 PASS: DESIGN.md records palette, geometry, art, typography, composition, motion, and state decisions.
- R-32 PASS: native controls/dialogs, visible focus, Enter activation, Escape dismissal, dialog Tab handling, and focus return.
- R-33 PASS: source changes use native patches; build only packages the written source.
- R-34 PASS: the single light scheme works across normal, pending, disabled, error, and result states.
- R-35 PASS: core/browser checks and build ran; control walkthrough and screenshots provide evidence.
- R-36 PASS: no invented business, security, or performance claims; unmeasured areas are explicitly named.
- R-37 PASS: the owner selected B and supplied the palette/content direction before promotion.
- R-38 PASS: actual sticker images, disclosed example quantities, and saved session counts; no fictional endorsements.
- R-39 PASS: named native controls, visible field labels, meaningful result alt, decorative canvas/thumbnail alt, pointer/disabled cursors, interaction states, reduced motion, document landmarks/title/lang, and unrestricted zoom.
- R-40 PASS: explicit image/SVG dimensions, preloaded sticker assets, reserved result area, pixel-density cap and canvas cleanup; no third-party scripts/fonts.

## Liveliness and craftsmanship

- Dials PASS: ENERGY 2 / RHYTHM 1 / MOTION 2 is explicit and reflected in the lively wheel, quiet regular editor, and action-triggered motion.
- Focal point PASS: the wheel dominates; there is no competing promotional heading.
- Whitespace PASS: spacing separates wheel, spin action, and drawer; reviewer-bar space has been removed.
- Accent PASS: the projecting petal pointer interrupts the circular silhouette for a functional purpose.
- Identity PASS: SARAS colors, mark, cap, pointer, and actual sticker designs recur coherently.
- Design read PASS: the approved prototype and owner corrections define the implementation.
- C-1 PASS: major decisions have recorded purposes.
- C-2 PASS: every visible control has verified behavior.
- C-3 PASS: content supports the booth task, without filler sections.
- C-4 PASS: responsive, pending, active, empty, error, offline, keyboard, and reduced-motion paths were exercised within Chrome.
- C-5 PASS: examples are disclosed and no evidence is fabricated.
- Comments PASS: one concise animation-cancellation constraint; no banners, generic narration, or empty TODOs.

Publishing source: `main`, `/(root)`, with `.nojekyll`. Public deployment status and asset loading are checked separately at handoff.
