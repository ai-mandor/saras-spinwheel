# SARAS sticker wheel

Accepted direction: B, selected by the owner. The wheel fills the main viewport; settings open at the right edge. Four supplied sticker images replace merchandise text. The owner requested custom confetti and removal of prize-name, booth-instruction, and turn-number text from the winner dialog.

Dial: ENERGY 2 / RHYTHM 1 / MOTION 2.

- The SARAS app supplies pink #E983A7, cream #FFF8F1, accessible rose #9D3E61, and neutral ink #2B2125. Sticker colors belong to the supplied artwork, not extra interface accents.
- Alternating pink/cream quadrants, a narrow rim, concentric center cap, and petal pointer make the wheel a coherent physical object.
- Four equal segments retain the images' proportions. Per-segment clipping keeps artwork inside the face. Circular frame clipping prevents rotated SVG bounds from widening the page.
- Images start upright for recognition, rotate with the face, and appear larger in the winner dialog. The fixed cap and pointer establish the wheel's moving parts.
- The existing SARAS logo and four owner-provided PNGs retain their identity. The approved pixel-based cutout removes exterior white, preserves Codex terminal whites, and leaves source files untouched.
- Georgia gives the small wordmark its familiar serif voice; system sans makes controls and the quiet Stikermu heading readable without network fonts.
- Full-page composition and purposeful negative space prioritize the wheel. The drawer's underlined fields and thumbnails remain secondary.
- A fixed light scheme follows the app and suits a bright showcase booth. No dark toggle or decorative marketing sections are needed.
- The 4.6-second eased rotation communicates the draw. Brief pointer deflections mark segment crossings. A 3.2-second palette-matched paper burst celebrates a new landing; reduced motion skips both extended effects.
- The result is image-led, with one handover action. Closing it preserves the pending prize. Reopening or reloading never repeats the celebration.
- The drawer explains browser-local stock because it affects booth operation. Persistence, CSV export, reset confirmation, blocked-storage feedback, and pending-result recovery retain the existing app behavior.
- Comparison code remains on the prototype branch. The selected B layout is implemented without alternative variants, URL switches, state inspector, or reviewer bar on main.

Primary-source prototype: `prototype/saras-duotone` at `7c70f3f`. The owner confirmed B and publication to GitHub Pages on 2026-11-25.
