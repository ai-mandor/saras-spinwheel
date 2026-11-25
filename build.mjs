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
const script = core.replaceAll('export function ', 'function ') + '\n' + app.replace(/^import[^\n]*\n/, '');
const output = html
  .replace('<link rel="stylesheet" href="./styles.css">', `<style>\n${css}\n</style>`)
  .replace('    <script type="module" src="./app.mjs"></script>\n', '')
  .replaceAll('./assets/saras-logo.svg', logoUrl)
  .replace('</body>', `<script type="module">\n${script.replaceAll('</script', '<\\/script')}\n</script>\n  </body>`);
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/index.html', root), output);
await writeFile(new URL('dist/.nojekyll', root), '');
console.log('dist/index.html siap: satu file, tanpa permintaan aset eksternal.');
