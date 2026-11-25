# SARAS two-color wheel prototype

An art-direction exploration of the existing merchandise wheel. Deep rose and warm ivory, a printed serif face, a narrow rim, and a petal-shaped pointer give the wheel a more deliberate physical identity. The central wheel and its game rules stay intact.

Open `dist/saras-duotone.prototype.html` directly, or run:

```sh
npm run prototype
```

Visit http://127.0.0.1:4175/?prototype=1&variant=A. The bottom comparison bar and Left/Right keys switch between three compositions:

- A: permanent settings column on the right, spin below the wheel.
- B: wheel centered across the page, settings in a right drawer.
- C: left editor, with the spin action in the center hub.

On mobile, settings use a drawer. Data shows the full in-memory session. Reloading restores example merchandise and inventory; there is no persistence or external service.

`npm run build` creates self-contained HTML previews, including the existing recolored SARAS vector. The prototype comparison bar appears only on a local host with `?prototype=1`, or in the local `.prototype.html` file. Runtime dependencies and internet access are unnecessary.

The exploration is captured on `prototype/saras-duotone`. The owner has not selected a composition for main. See [PROTOTYPE.md](PROTOTYPE.md) for context, [DESIGN.md](DESIGN.md) for decisions, and [VERIFICATION.md](VERIFICATION.md) for the delivery gate and browser observations.
