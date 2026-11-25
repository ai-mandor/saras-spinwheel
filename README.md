# SARAS palette wheel prototype

The owner selected option B: a centered wheel with a right settings drawer. The wheel now uses the app's actual pink #E983A7 and cream #FFF8F1, with SARAS's accessible rose for controls and neutral ink for readable labels. The printed serif face, narrow rim, petal pointer, and game rules stay intact.

Open `dist/saras-duotone.prototype.html` directly, or run:

```sh
npm run prototype
```

Visit http://127.0.0.1:4175/?prototype=1&variant=B. B is also the default without a variant parameter. The bottom comparison bar and Left/Right keys retain the previous compositions for reference:

- A: permanent settings column on the right, spin below the wheel.
- B: wheel centered across the page, settings in a right drawer.
- C: left editor, with the spin action in the center hub.

On mobile, settings use a drawer. Data shows the full in-memory session. Reloading restores example merchandise and inventory; there is no persistence or external service.

A custom SARAS-colored confetti burst celebrates each new landing. It runs once, cleans up automatically, respects reduced motion, and keeps result controls usable. Reopening the same prize does not trigger another burst.

`npm run build` creates self-contained HTML previews, including the existing recolored SARAS vector. The prototype comparison bar appears only on a local host with `?prototype=1`, or in the local `.prototype.html` file. Runtime dependencies and internet access are unnecessary.

The exploration is captured on `prototype/saras-duotone`. Selection: B, with the SARAS palette. See [PROTOTYPE.md](PROTOTYPE.md) for context, [DESIGN.md](DESIGN.md) for decisions, and [VERIFICATION.md](VERIFICATION.md) for the delivery gate and browser observations.
