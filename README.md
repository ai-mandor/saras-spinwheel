# SARAS showcase spinwheel

Static booth prototype using HTML, CSS, native JavaScript modules, and the existing SARAS logo. No runtime packages, API keys, or backend.

GitHub Pages URL: https://ai-mandor.github.io/saras-spinwheel/

## Preview

For a preview that opens directly from Finder, run `npm run build` and open `dist/index.html`. This standalone file embeds the CSS, JavaScript, and logo, so it also works without a server or an internet connection.

```sh
npm start
```

Open http://127.0.0.1:4173. Use an HTTP server rather than opening `index.html` as a file, because the app uses JavaScript modules.

## Booth operation

1. Open **Panel panitia** and replace the example merchandise names and remaining quantities.
2. Visitors press **Putar roda**. Each available prize type has equal probability, regardless of remaining quantity.
3. Give the visitor the selected prize, then press **Hadiah sudah diterima** for the next visitor.
4. Download the history as CSV from the staff panel when needed.

Inventory and draw history are saved in localStorage on this browser and origin. Use one tab on one supervised booth device. This prototype does not synchronize inventory across visitor phones, authenticate staff, or enforce one participation per person. Staff confirmation is a handover action, not a secure redemption system.

Stock is deducted and the outcome saved before animation. Refreshing the page restores the same outcome. Storage failures stop drawing rather than silently discarding history. A corrupted session can be reset through the staff panel after explicit confirmation.

## GitHub Pages

1. Put this project's source in a dedicated GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select `main` and `/(root)`, then save.

`index.html`, `styles.css`, `app.mjs`, `spin-core.mjs`, `assets/`, and `.nojekyll` must be present. All asset URLs are relative, supporting both a user site and a project URL such as `/saras-spinwheel/`. No build step is required. The development-only `node_modules` folder must not be committed.

Alternatively, run `npm run build` and upload only the contents of `dist/` to the repository root. This is the same app packaged as a single HTML file.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Verification

```sh
npm test
npm run test:browser
```

Browser checks use the installed Google Chrome through Playwright. They cover the visitor flow, stock changes, reload recovery, editing, CSV download, reset confirmation, storage failure, keyboard dialogs, and responsive layouts.
