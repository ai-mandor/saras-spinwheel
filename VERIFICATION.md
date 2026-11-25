# SARAS palette prototype review

Date: 2026-11-25. Method: local Chrome click-through, screenshots, computed dimensions, and source inspection. This is a throwaway UI, not a production release. The owner selected B and requested the actual SARAS palette; the revised palette and B default were rechecked.

## Observed behavior

- Built with `npm run build`; `node --check app.mjs`, `node --check build.mjs`, and `git diff --check` passed.
- Without a variant parameter, the browser renders B. Computed brand tokens are pink #E983A7 and cream #FFF8F1, matching the app's Color+Saras.swift; controls use its accessible rose #9D3E61 and wheel labels use sarasText #2B2125.
- At 1440×1000, A/B wheel SVGs measure 668 px; C measures 752 px. The framed objects are 696 px and 780 px. All three page heights are 1000 px.
- A/B/C opened at 320, 390, 768, 1024, and 1440 px. No horizontal page overflow; narrow drawers have no horizontal overflow.
- At 390 px, 200% root text size causes no horizontal page or hub overflow in A/B/C. The center action grows to fit in C. Decorative hub branding scales with the cap.
- Long multiword and 28-character unbroken names wrap within the wheel at 320 px. Segment text renders at a minimum 14 px at the checked widths.
- Normal motion was observed during a 4.6-second spin: disabled spin/configuration, “Berputar…”, a rotating face, fixed cap, and small pointer deflections. Reduced motion uses 120 ms and no deflection.
- The self-contained HTML opened offline, rendered the wheel, and switched variants. It has zero external script sources.
- No JavaScript exceptions or console errors were recorded.
- No automated test suite was added. The inherited earlier tests were not run as evidence for this changed prototype.
- Evidence is local in ignored `artifacts/`: desktop/mobile A/B/C, result, settings drawer, active spin, keyboard focus, enlarged text, long labels, exhausted stock, and `preview-observations.json`.
- Lighthouse, field Web Vitals, screen-reader behavior, and Safari/device behavior were not measured.

## Control-by-control click-through

- Brand link PASS: navigates to the existing index route and restores a fresh example session.
- Spin PASS, A/B/C: opens a real result; one history entry and one stock deduction per draw.
- Result close PASS: closes the dialog and leaves “Lihat hadiah” available for the reserved result.
- Lihat hadiah PASS: reopens the same pending prize without another deduction.
- Result Escape PASS: closes the native dialog; the pending result remains available.
- Hadiah sudah diterima PASS: clears the pending result, closes the dialog, and returns focus to spin.
- Prize names and quantities PASS: edited visible fields; applying changes updates the wheel and shows session feedback.
- Invalid form PASS: an empty required name prevents submit and reports the valid name/stock requirement.
- Exhausted inventory PASS: all stock set to zero; labels show “Habis” and spin is disabled with “Hadiah habis”.
- Reset contoh PASS: restores example inventory and zero history.
- Pengaturan PASS: opens the right drawer in B and mobile A/B/C.
- Drawer close PASS: closes it; Escape also closes it and restores focus to Pengaturan.
- Previous/next variant PASS: cycles and wraps while updating the URL.
- Keyboard arrows PASS: switch variants; an arrow inside a text field does not change variant.
- Reload PASS: retains the URL variant and resets in-memory example data.
- Data PASS: opens the full session snapshot; close control and Escape dismiss the dialog.
- Keyboard PASS: spin activated with Enter; visible focus screenshot recorded; native dialog Tab cycle retains focus.
- Normal route PASS: reviewer bar hidden without local prototype mode.

## Antislop delivery gate

Each line records the rule and the evidence for this prototype.

- R-01 PASS: the app's pink/cream direction, accessible darker rose, and neutral label ink have documented brand/contrast purposes; no gradient or glow.
- R-02 PASS: application copy has no em dash or marketing filler.
- R-03 PASS: no horizontal overflow at the five inspected widths; buttons/inputs have targets at least 44 px.
- R-04 PASS: the existing logo identifies SARAS; pointer indicates a segment; close/arrow symbols perform their named actions.
- R-05 PASS: the compositions serve the wheel/editor relationship, with no marketing-template sections.
- R-06 PASS: serif face echoes the SARAS wordmark and printed wheel; system sans keeps settings legible; monospace is confined to raw state.
- R-07 PASS: plain ivory background gives the wheel clear silhouette and negative space.
- R-08 PASS: arrows only cycle reviewer variants.
- R-09 PASS: no promotional badges; Prototype identifies the actual comparison tool.
- R-10 PASS: no glass or backdrop blur.
- R-11 PASS: circles describe the wheel; controls and dialogs use restrained rectangular corners.
- R-12 PASS: short shadows describe the rim, cap, and pressed control; no floating stack of cards.
- R-13 PASS: no glows.
- R-14 PASS: actual editable rows, no decorative feature cards.
- R-15 PASS: Putar roda, Terapkan hadiah, and Hadiah sudah diterima name their actions.
- R-16 PASS: no generic AI marketing phrases.
- R-17 PASS: inventory is visibly labelled example data; counts derive from actual session draws.
- R-18 PASS: no testimonials or invented people.
- R-19 PASS: only user-triggered wheel/control motion; normal spin under five seconds, reduced-motion path observed.
- R-20 PASS: SARAS pink/cream printed face, concentric cap, and petal pointer create a coherent wheel object beyond the product name.
- R-21 PASS: one intentional light scheme follows the supplied SARAS character; no theme toggle requested or shipped.
- R-22 PASS: no generic illustration; the owner's original vector geometry is retained.
- R-23 PASS: existing brand asset and expressly requested wheel/pointer refinement; example stock is disclosed.
- R-24 PASS: the only navigation link resolves to an existing index page.
- R-25 PASS: calculated sRGB contrast: ink/pink 6.14:1; rose/cream 6.05:1; muted text/cream 5.15:1; rose/sold-out surface 4.78:1; input rule/cream 3.57:1. Pink is a surface rather than small text on cream.
- R-26 PASS: every visible control was exercised as recorded above; no placeholder action.
- R-27 PASS: empty history, exhausted inventory, active spin, and invalid-input feedback observed; no remote-fetch loading state exists in this memory-only prototype.
- R-28 PASS: no FAQ.
- R-29 PASS: pink #E983A7 and cream #FFF8F1 are the two main colors; #9D3E61 is the app's accessible rose tone and #2B2125 is its neutral text ink. No competing accent hue is introduced.
- R-30 PASS: direction comes from SARAS and the physical wheel; no other product layout was copied.
- R-31 PASS: DESIGN.md records the purpose of palette, type, rim, pointer, cap, side editor, motion, and result presentation.
- R-32 PASS: native controls and dialogs, visible focus, Enter activation, Escape dismissal, dialog Tab handling, and input-safe arrows.
- R-33 PASS: source edited with native patches; build only packages the already-written source into standalone HTML.
- R-34 PASS: the sole shipped light scheme was previewed through normal, disabled, settings, and result states.
- R-35 PASS: build, browser screenshots, and the element-by-element click-through above were completed with no console errors.
- R-36 PASS: no fabricated business, security, customer, or performance claims; unmeasured areas are named above.
- R-37 PASS: the owner's explicit refinement brief was interpreted before implementation; DESIGN.md records the critical assessment and dials.
- R-38 PASS: actual SARAS branding, honest example merchandise, and real in-memory counts; no fictional endorsements.
- R-39 PASS: native named controls, visible field labels, decorative alt text, pointer/not-allowed cursors, hover/press/disabled treatments, reduced motion, lang/title/landmarks, and unrestricted viewport zoom.
- R-40 PASS: logo images have explicit dimensions; the inline wheel has a fixed viewBox and dimensions; no third-party scripts, lazy hero, external font, or late remote content.

## Liveliness gate

- Dials PASS: ENERGY 2 / RHYTHM 1 / MOTION 2 is explicit in DESIGN.md.
- Dial consistency PASS: lively printed wheel, quiet regular editor, motion tied to the spin.
- Focal point PASS: the wheel dominates each composition; there is no competing promotional headline.
- Whitespace PASS: gaps separate the object, action, editor, and reviewer controls; mobile reserves bottom-bar space.
- Deliberate accent PASS: the projecting petal pointer gives the round silhouette one purposeful interruption.
- Identity motif PASS: the petal/pivot and concentric printed cap echo the SARAS mark and circular wheel geometry.
- Design read PASS: weaknesses and the two-ink direction were stated before editing.

## Craftsmanship and comment gate

- C-1 PASS: the purpose of each major visual decision is documented.
- C-2 PASS: controls produce their recorded actions.
- C-3 PASS: content is limited to the game, configuration, outcome, and explicitly separate reviewer tools.
- C-4 PASS: empty, invalid, active, pending, exhausted, responsive, enlarged-text, offline, and reduced-motion states were exercised within the stated Chrome scope.
- C-5 PASS: examples are identified; no invented evidence.
- Comments PASS: the concise throwaway/variant context is retained; no banners, obvious narration, signature echoes, decorative emoji, or vague TODOs. Comment hygiene did not alter executable behavior; the requested UI work is separately implemented in source.

Result: PASS for the documented prototype scope. B is the owner's selected composition and opens by default. A/C remain reference variants on the prototype branch.
