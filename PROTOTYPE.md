# Centered-wheel layout prototype

Question: which layout best supports a large centered wheel with settings at the edge and no promotional headings?

User direction: “spinwheel nya gedhe ditengah trus setting nya dipinggir aja, ga perlu highlight kalimat yang lain.”

Three variants share the existing index route and the same in-memory game state:

| Variant | Structure | Primary action |
| --- | --- | --- |
| A, Panel kanan | Permanent settings column on the right; game centered in the remaining area | Below the wheel |
| B, Laci samping | Wheel centered on the full page; settings open in a drawer on the right | Below the wheel |
| C, Editor kiri | Settings editor on the left; larger wheel in the main area | Inside the wheel hub |

Run `npm run prototype`, then open `http://127.0.0.1:4174/?prototype=1&variant=A`. B and C use the same URL with `variant=B` or `variant=C`. The floating bottom switcher and keyboard Left/Right change this parameter without resetting state. Arrow keys inside inputs are left alone.

For an offline preview, run `npm run build` and open `dist/centered-wheel.prototype.html`. That filename explicitly enables the comparison bar on local files. The normal index and non-local hosts hide the bar unless appropriate local prototype conditions are met.

Use Data in the comparison bar to inspect the current variant, rotation, settings visibility, prizes, pending result, and full draw history. The same snapshot is printed to the browser console on variant switches and actions.

Data lives only in memory. Refresh restores example inventory. There are no localStorage calls, network mutations, credentials, or database connections. All initial merchandise and quantities are inherited example data.

Primary-source branch: `prototype/centered-wheel`, based on `main` at `68ae8f4`. Prototype files are confined to this branch; main still holds the previous implementation.

Verdict: the requested centered-wheel direction is implemented in all three variants. At 1440×1000, the visible SVG wheel measured 726 px in A/B and 794 px in C, with no page overflow. The selection between A, B, and C is pending owner review. Once selected, port the validated layout into the real app and retain these alternatives only on this prototype branch.

No automated test suite was added for this throwaway UI. Browser click-through observations and screenshots are in the ignored artifacts directory; review evidence is summarized in VERIFICATION.md.
