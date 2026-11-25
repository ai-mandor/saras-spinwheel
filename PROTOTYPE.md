# SARAS wheel: art-direction prototype

Question: can the existing wheel feel distinctly SARAS through two colors, geometry, typography, and tactile feedback, while preserving the large wheel and side settings?

This builds on the centered-wheel exploration at `87eba5e`. Before implementation, the review identified a six-pastel chart appearance, a disconnected triangular pointer, a flat center cap, repetitive boxed fields, and generic label typography. The owner's new direction and the response to each weakness are recorded in DESIGN.md.

Three variants share the existing index route and the same in-memory game state:

| Variant | Structure | Primary action |
| --- | --- | --- |
| A, Panel kanan | Permanent settings column on the right; game centered in the remaining area | Below the wheel |
| B, Laci samping | Wheel centered on the full page; settings open in a drawer on the right | Below the wheel |
| C, Editor kiri | Settings editor on the left; larger wheel in the main area | Inside the wheel hub |

Run `npm run prototype`, then open `http://127.0.0.1:4175/?prototype=1&variant=B`. B is selected and is the default even without a variant parameter. A/C remain comparison references. The floating bottom switcher and keyboard Left/Right change this parameter without resetting state. Arrow keys inside inputs are left alone.

For an offline preview, run `npm run build` and open `dist/saras-duotone.prototype.html`. That filename explicitly enables the comparison bar on local files. The normal index and non-local hosts hide the bar unless appropriate local prototype conditions are met. CSS, JavaScript, and the recolored original logo are embedded. No fonts or images are fetched externally.

Use Data in the comparison bar to inspect the current variant, rotation, settings visibility, prizes, pending result, and full draw history. The same snapshot is printed to the browser console on variant switches and actions.

Data lives only in memory. Refresh restores example inventory. There are no localStorage calls, network mutations, credentials, or database connections. All initial merchandise and quantities are inherited example data.

The spin core is unchanged: equal odds among prize types with stock, stock reserved at selection, one pending result until handover. Rendering, motion, and presentation are refined. The normal spin lasts 4.6 seconds; reduced motion uses 120 ms without pointer deflection.

The owner subsequently requested custom confetti. A self-contained canvas burst runs once after a new spin lands, using the SARAS palette, and clears after 3.2 seconds. It never replays when reopening the same prize. Reduced motion, dialog dismissal, and handover cancel it. No external library or CodePen dependency is used.

Primary-source branch: `prototype/saras-duotone`. The previous layout prototype remains on `prototype/centered-wheel`; main is unaffected. No implementation issue was provided. This file and the branch commit retain the question, decisions, and review context.

Verdict: the owner selected B on 2026-11-25 and requested the actual SARAS palette. B now opens by default; pink/cream, accessible rose, and neutral label ink come from the app's Color+Saras.swift. The revised palette was browser-reviewed. Comparison alternatives stay captured on this prototype branch.

No automated test suite was added for this throwaway UI. An ignored browser inspection script drove Chrome to record click-throughs and screenshots. The inherited tests target the earlier implementation and were not presented as validation of this prototype. Evidence and limitations are recorded in VERIFICATION.md.
