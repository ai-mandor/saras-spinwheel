# SARAS centered-wheel layout prototype

Throwaway UI exploration on branch `prototype/centered-wheel`. The question and branch context are recorded in [PROTOTYPE.md](PROTOTYPE.md).

## Open the preview

Double-click `dist/centered-wheel.prototype.html`. The preview includes its JavaScript, CSS, and existing SARAS logo, and works without an internet connection.

For the source route:

```sh
npm run prototype
```

Open http://127.0.0.1:4174/?prototype=1&variant=A and use the bottom bar to compare A, B, and C. Refresh preserves the selected variant in the URL but resets the example inventory. Left/Right also switches variants when a text field or dialog is not active.

- A: right settings column, spin action below the wheel.
- B: full-width centered wheel with a settings drawer on the right.
- C: left editor and the spin action inside the wheel hub.

Settings and spin results are in memory only. Use Data in the prototype bar to inspect the full session. Merchandise and quantities are examples.

`npm run build` refreshes both standalone HTML files in dist. No runtime packages or external services are needed. The existing test files belong to the earlier implementation; this throwaway layout does not add a test suite.

After choosing a variant, port that decision into main and leave the alternatives on this branch.
