# SARAS palette prototype review

Date: 2026-11-25. Method: local Chrome click-through, screenshots, computed dimensions, and source inspection. This is a throwaway UI, not a production release. The owner selected B, the SARAS palette, custom confetti, and four supplied sticker designs. Follow-up checks for each change are recorded below.

## Observed behavior

- Built with `npm run build`; `node --check app.mjs`, `node --check build.mjs`, and `git diff --check` passed.
- Without a variant parameter, the browser renders B. Computed brand tokens are pink #E983A7 and cream #FFF8F1, matching the app's Color+Saras.swift; controls use its accessible rose #9D3E61 and wheel labels use sarasText #2B2125.
- At 1440×1000, A/B wheel SVGs measure 668 px; C measures 752 px. The framed objects are 696 px and 780 px. All three page heights are 1000 px.
- A/B/C opened at 320, 390, 768, 1024, and 1440 px. No horizontal page overflow; narrow drawers have no horizontal overflow.
- At 390 px, 200% root text size causes no horizontal page or hub overflow in A/B/C. The center action grows to fit in C. Decorative hub branding scales with the cap.
- The current wheel shows sticker artwork rather than merchandise text. Each source keeps its own aspect ratio; editable names remain in the accessible wheel description, labelled settings, and result image alt text.
- Normal motion was observed during a 4.6-second spin: disabled spin/configuration, “Berputar…”, a rotating face, fixed cap, and small pointer deflections. Reduced motion uses 120 ms and no deflection.
- The self-contained HTML opened offline, rendered the wheel, and switched variants. It has zero external script sources.
- No JavaScript exceptions or console errors were recorded.
- No automated test suite was added. The inherited earlier tests were not run as evidence for this changed prototype.
- Evidence is local in ignored `artifacts/`: desktop/mobile A/B/C, result, settings drawer, active spin, keyboard focus, enlarged text, long labels, exhausted stock, and `preview-observations.json`.
- Lighthouse, field Web Vitals, screen-reader behavior, and Safari/device behavior were not measured.

## Custom confetti follow-up

The owner requested confetti on landing, then explicitly chose an original implementation. The effect uses a local canvas and no external library. Chrome observations are in `artifacts/confetti-observations.json`; desktop/mobile screenshots were inspected.

- Timing PASS: canvas hidden during the spin; visible painted particles after the wheel settles and the result opens.
- Once per prize PASS: reopening the same pending result does not replay confetti or deduct stock again.
- Cleanup PASS: after 3.2 seconds, the canvas is hidden and resized to 1×1; no painted pixels remain.
- Handover PASS: the handover button works during the burst, clears pending state, and immediately releases the canvas.
- Escape PASS: closing the result during a burst hides and releases the canvas.
- Reduced motion PASS: changing the preference during a burst cancels it; a reduced-motion landing produces no confetti.
- Mobile PASS: painted canvas at 390×844, readable result controls, no pointer interception, and no horizontal page overflow after landing.
- Wheel clipping PASS: inspected the rotated SVG's square bounds extending past the viewport; circular frame clipping now keeps page scroll width at 390 px.
- Offline PASS: the standalone HTML paints confetti with zero external script sources.
- Console PASS: no browser exceptions or console errors in the focused follow-up.

## Four-sticker follow-up

The user supplied four PNGs and approved direct pixel-based white removal after generated previews changed the artwork. The selected project assets come from the original files, with no generated variant used. See `assets/stickers/README.md` for provenance and crop dimensions. Evidence: `artifacts/sticker-assets.json`, `artifacts/sticker-observations.json`, and the inspected `stickers-*.png` screenshots.

- Assets PASS: four cropped PNGs have transparent backgrounds. Original colored interiors and typography remain; the enclosed white terminal glyph inside the Codex icon is retained. The original files were not overwritten.
- Wheel PASS: B is default, with four 90-degree segments, four source images, a clear hub and pointer, and a per-segment clip. The four images begin upright and rotate with the wheel.
- Controls PASS: the drawer has four image thumbnails, four labelled name fields, and four stock fields. Name/stock edits apply; empty-name validation reports feedback.
- Binding PASS: each of SARAS, Claude, BUG/Fitur, and Codex was independently made the only available prize, spun, and compared with the matching result PNG. Renaming SARAS to SARAS lotus retained the SARAS artwork.
- Pending result PASS: closing/reopening each result retains the matching image and does not replay confetti. Handover completes each draw.
- Empty/reset PASS: after all stocks reached zero, all four wedges show Habis and spin is disabled. Reset restores the four example choices.
- Motion PASS: normal-motion SARAS and mobile Codex landings showed confetti; reduced-motion landings did not.
- Responsive PASS: A/B/C each opened with four images at 320, 390, 768, 1024, and 1440 px without horizontal page overflow. The mobile drawer and winning dialog had no horizontal overflow; the 390×844 result fit without internal scrolling.
- Text size PASS: the current B layout has no horizontal page overflow at 390 px with 200% root text size.
- Offline PASS: all four wheel images use embedded PNG data in the standalone HTML, decode successfully, and the matching result image loads offline. Spin activated with Enter and the result dismissed with Escape.
- Console/build PASS: no exceptions or console errors; build, source syntax checks, and diff whitespace checks passed. No formal test suite was added for this prototype.

## Control-by-control click-through

Result-copy follow-up PASS: the visible result now contains only Stikermu, the actual sticker image, close, and Hadiah sudah diterima. No visible prize-name caption, booth instruction, or turn number. Chrome mobile and offline desktop views were inspected; spin/confetti, close/reopen without replay, handover, Enter activation, and Escape still work with no console errors. Evidence: `artifacts/result-copy-observations.json` and `result-copy-*.png`.

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
- R-06 PASS: serif branding retains the SARAS voice; system sans keeps controls and the quiet result heading legible; sticker typography is preserved from the supplied images.
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
- R-19 PASS: action-triggered wheel motion and the explicitly requested landing celebration; each lasts under five seconds. The 3.2-second confetti burst is skipped/cancelled under reduced motion and never replays for a reopened result.
- R-20 PASS: SARAS pink/cream printed face, concentric cap, and petal pointer create a coherent wheel object beyond the product name.
- R-21 PASS: one intentional light scheme follows the supplied SARAS character; no theme toggle requested or shipped.
- R-22 PASS: the owner's existing logo and expressly supplied sticker art identify the actual prizes; no generic filler illustration.
- R-23 PASS: the owner supplied all four sticker images, requested background removal, approved the pixel method, and authorized custom confetti; stock is visibly labelled example data.
- R-24 PASS: the only navigation link resolves to an existing index page.
- R-25 PASS: calculated sRGB contrast: ink/pink 6.14:1; rose/cream 6.05:1; muted text/cream 5.15:1; rose/sold-out surface 4.78:1; input rule/cream 3.57:1. Pink is a surface rather than small text on cream.
- R-26 PASS: every visible control was exercised as recorded above; no placeholder action.
- R-27 PASS: empty history, exhausted inventory, active spin, and invalid-input feedback observed; no remote-fetch loading state exists in this memory-only prototype.
- R-28 PASS: no FAQ.
- R-29 PASS: the interface keeps pink/cream with accessible rose and neutral ink. Extra colors belong to the owner's supplied prize artwork and are preserved rather than introduced as control accents.
- R-30 PASS: direction comes from SARAS and the physical wheel; no other product layout was copied.
- R-31 PASS: DESIGN.md records the purpose of palette, type, rim, pointer, cap, side editor, motion, and result presentation.
- R-32 PASS: native controls and dialogs, visible focus, Enter activation, Escape dismissal, dialog Tab handling, and input-safe arrows.
- R-33 PASS: source edited with native patches; build only packages the already-written source into standalone HTML.
- R-34 PASS: the sole shipped light scheme was previewed through normal, disabled, settings, and result states.
- R-35 PASS: build, screenshots, the element-by-element click-through, and focused confetti/sticker checks above completed with no console errors.
- R-36 PASS: no fabricated business, security, customer, or performance claims; unmeasured areas are named above.
- R-37 PASS: the owner's explicit refinement brief was interpreted before implementation; DESIGN.md records the critical assessment and dials.
- R-38 PASS: actual supplied sticker designs, clearly labelled example stock of 20 each, and real in-memory counts; no fictional endorsements.
- R-39 PASS: native named controls, visible labels, focus/interaction states, reduced motion, and unrestricted zoom; confetti is aria-hidden and pointer-transparent, with result text/buttons above its paint layer.
- R-40 PASS: source sticker images are preloaded; SVG image boxes, settings thumbnails, and the result image have explicit dimensions with contained aspect ratios. The canvas caps density at 2 and releases its buffer. The build embeds PNGs, with no remote scripts/fonts.

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
