# SARAS sticker wheel

The selected B layout: a large centered wheel, right settings drawer, four transparent sticker designs, and a short custom confetti burst after a new landing. The winning dialog shows only Stikermu, the image, and the handover action.

Site: https://ai-mandor.github.io/saras-spinwheel/

## Run locally

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173. Run `npm run build` to create `dist/index.html`, a self-contained offline copy with embedded CSS, JavaScript, logo, and sticker PNGs.

## Booth use

- Open Pengaturan and set the actual names and quantities. Initial stock is clearly labelled example data: 20 of each sticker.
- Press Putar roda. Each sticker type with stock has equal odds.
- Give the winner their sticker, then press Hadiah sudah diterima.
- Unduh CSV exports history. Reset contoh requires confirmation before restoring examples and clearing history.

Stock and history persist in localStorage on this browser and origin. The selected prize is saved before animation; reload restores the same pending result without another deduction or celebration. Storage errors stop drawing, and corrupt data is retained until an explicit reset. Web Locks serialize updates between tabs where available.

Use one supervised booth browser. Stock is not shared across devices, settings are not authenticated, and the page does not enforce one spin per person.

## Publish

GitHub Pages serves `main` from `/(root)`. Relative asset paths support the repository subpath. The root `.nojekyll` disables Jekyll processing. Source files can be served directly; there are no runtime services, external libraries, fonts, or API credentials.

The accepted exploration is retained on [prototype/saras-duotone](https://github.com/ai-mandor/saras-spinwheel/tree/prototype/saras-duotone) at `7c70f3f`. Main contains B only, without comparison variants, raw state inspection, or prototype controls.

## Verify

```sh
npm test
npm run build
npm run test:browser
```

Keep `npm start` running in a separate terminal for browser checks. Tests use installed Google Chrome via Playwright. See [VERIFICATION.md](VERIFICATION.md), [DESIGN.md](DESIGN.md), and [sticker provenance](assets/stickers/README.md).
