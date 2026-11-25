import { readFile, mkdir, writeFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const [html, css, core, app, logo] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('styles.css', root), 'utf8'),
  readFile(new URL('spin-core.mjs', root), 'utf8'),
  readFile(new URL('app.mjs', root), 'utf8'),
  readFile(new URL('assets/saras-logo.svg', root)),
]);
const logoUrl = `data:image/svg+xml;base64,${logo.toString('base64')}`;
let bundledApp = app;
let bundledHtml = html;
for (const name of ['saras','claude','bug-fitur','codex']) {
  const path = 'assets/stickers/' + name + '.png';
  const image = await readFile(new URL(path, root));
  const url = 'data:image/png;base64,' + image.toString('base64');
  bundledApp = bundledApp.replaceAll('./' + path, url);
  bundledHtml = bundledHtml.replaceAll('./' + path, url);
}
const script = core.replaceAll('export function ', 'function ') + '\n' + bundledApp.replace(/^import[^\n]*\n/, '');
const output = bundledHtml
  .replace('<link rel="stylesheet" href="./styles.css">', `<style>\n${css}\n</style>`)
  .replace(/\s*<script type="module" src="\.\/app\.mjs"><\/script>\n/, '\n')
  .replaceAll('./assets/saras-logo.svg', logoUrl)
  .replace('</body>', `<script type="module">\n${script.replaceAll('</script', '<\\/script')}\n</script>\n  </body>`);
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/index.html', root), output);
await writeFile(new URL('dist/saras-duotone.prototype.html', root), output);
await writeFile(new URL('dist/.nojekyll', root), '');
console.log('dist/saras-duotone.prototype.html siap untuk membandingkan varian A, B, dan C.');
