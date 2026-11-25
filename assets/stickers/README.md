# Sticker assets

These are transparent derivatives of the owner's four supplied PNGs in `FINAL CHALLENGE/Sticker Saras/`. The source files remain unchanged.

| Source | Output | Pixels |
| --- | --- | --- |
| Sticker 1.png | saras.png | 842 × 781 |
| Sticker 2.png | claude.png | 784 × 343 |
| Sticker 3.png | bug-fitur.png | 460 × 365 |
| Sticker 4.png | codex.png | 878 × 285 |

The owner approved pixel-based white removal after imagegen previews changed artwork details. None of the generated variants is used here.

Processing uses the original RGBA pixels: remove pure white, soften/unmatte near-white edge pixels above a minimum channel value of 224, crop transparent margins, and retain 12 px of padding. Foreground pixels below that threshold retain their original colors. A flood-fill identifies exterior white so the enclosed white terminal details inside the Codex icon can be preserved. Typography, the BUG strikethrough, the orange Claude mark, and the SARAS illustration are retained from the original files.

The pixel-processing and browser inspection scripts are local review artifacts, outside runtime code. Source metadata and observations are in the ignored `artifacts/sticker-assets.json` and `artifacts/sticker-observations.json`. The app binds each PNG to a stable prize ID; editing a label or stock never changes that binding. The build embeds all four PNGs for offline use.
