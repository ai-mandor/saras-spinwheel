import { createSession, reserveSpin, nextVisitor, targetRotation } from './spin-core.mjs';

// Throwaway prototype: three centered-wheel layouts on this route via ?variant=A|B|C.
const prizes = [
  { id: 'sticker', label: 'Sticker pack', quantity: 20 },
  { id: 'keychain', label: 'Gantungan kunci', quantity: 10 },
  { id: 'pin', label: 'Pin SARAS', quantity: 15 },
  { id: 'notebook', label: 'Notebook', quantity: 10 },
  { id: 'pouch', label: 'Pouch', quantity: 8 },
  { id: 'totebag', label: 'Tote bag', quantity: 5 },
];
const colors = ['#f2d6e0','#fff0dd','#d987a8','#fbe9ef','#f0c8ae','#e6b4c7'];
const names = { A: 'Panel kanan', B: 'Laci samping', C: 'Editor kiri' };
const $ = selector => document.querySelector(selector);
const layout = $('#layout'), game = $('#game'), panel = $('#settings-panel');
const wheel = $('#wheel'), spinButton = $('#spin-button'), hub = $('#wheel-hub');
const hubBrand = $('#hub-brand'), actions = $('#game-actions');
const mobile = matchMedia('(max-width:900px)');
let session = createSession(prizes);
let rotation = 0, spinning = false, settingsOpen = false;
let variant = new URL(location.href).searchParams.get('variant')?.toUpperCase() || 'A';
if (!names[variant]) variant = 'A';
const prototypeMode = ['localhost','127.0.0.1',''].includes(location.hostname) && (new URL(location.href).searchParams.has('prototype') || location.pathname.endsWith('.prototype.html'));
$('#prototype-switcher').hidden = !prototypeMode;

export function VariantA() {
  layout.className = 'layout variant-a';
  layout.replaceChildren(game, panel);
  hubBrand.hidden = false; hub.replaceChildren(hubBrand);
  actions.append(spinButton);
}
export function VariantB() {
  layout.className = 'layout variant-b';
  layout.replaceChildren(game);
  layout.append(panel);
  hubBrand.hidden = false; hub.replaceChildren(hubBrand);
  actions.append(spinButton);
}
export function VariantC() {
  layout.className = 'layout variant-c';
  layout.replaceChildren(panel, game);
  hubBrand.hidden = true; hub.replaceChildren(spinButton);
}

function updatePanel() {
  const drawer = variant === 'B' || mobile.matches;
  panel.hidden = drawer && !settingsOpen;
  $('#settings-toggle').setAttribute('aria-expanded', String(!panel.hidden));
}

function showState() {
  const state = { variant, layout: names[variant], spinning, rotation, settingsOpen, session };
  $('#state-json').textContent = JSON.stringify(state, null, 2);
  if (prototypeMode) console.info('SARAS layout prototype', state);
}

function switchVariant(key) {
  variant = key; settingsOpen = false;
  document.body.dataset.variant = variant;
  ({ A: VariantA, B: VariantB, C: VariantC })[variant]();
  const url = new URL(location.href);
  url.searchParams.set('variant', variant);
  history.replaceState(null, '', url);
  $('#variant-label').textContent = variant + ' · ' + names[variant];
  updatePanel(); renderControls(); showState();
}

function cycleVariant(direction) {
  const keys = Object.keys(names);
  switchVariant(keys[(keys.indexOf(variant) + direction + keys.length) % keys.length]);
}

function svgNode(tag, attrs, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function drawWheel() {
  wheel.replaceChildren();
  const size = Math.max(20, 14 * 560 / Math.max(wheel.clientWidth, 200));
  const angle = 360 / session.prizes.length;
  session.prizes.forEach((prize, i) => {
    const start = (i * angle - 90) * Math.PI / 180, end = ((i + 1) * angle - 90) * Math.PI / 180;
    const x1 = 280 + 266 * Math.cos(start), y1 = 280 + 266 * Math.sin(start);
    const x2 = 280 + 266 * Math.cos(end), y2 = 280 + 266 * Math.sin(end);
    wheel.append(svgNode('path', { d: 'M280 280L' + x1 + ' ' + y1 + 'A266 266 0 0 1 ' + x2 + ' ' + y2 + 'Z', fill: prize.quantity ? colors[i % colors.length] : '#e8dfdd', stroke:'#fff8f1','stroke-width':2 }));
    const degrees = (i + .5) * angle - 90, radians = degrees * Math.PI / 180;
    const orientation = degrees > 90 && degrees < 270 ? degrees + 180 : degrees;
    const text = svgNode('text', { transform:'translate(' + (280 + 169 * Math.cos(radians)) + ' ' + (280 + 169 * Math.sin(radians)) + ') rotate(' + orientation + ')', 'text-anchor':'middle','dominant-baseline':'middle',fill:'#2b2125','font-family':'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif','font-weight':550,'font-size':size });
    const words = prize.label.split(' ');
    const lines = prize.label.length > 12 && words.length > 1 ? [words.slice(0, -1).join(' '), words.at(-1)] : [prize.label];
    if (!prize.quantity) lines.push('Habis');
    lines.forEach((line, row) => text.append(svgNode('tspan', { x:0,y:(row - (lines.length - 1) / 2) * size * 1.2 }, line)));
    wheel.append(text);
  });
  wheel.append(svgNode('circle', { cx:280,cy:280,r:270,fill:'none',stroke:'#fff8f1','stroke-width':10 }));
  wheel.setAttribute('aria-label', 'Roda hadiah: ' + session.prizes.map(p => p.label + (p.quantity ? '' : ' habis')).join(', '));
}

function renderControls() {
  const available = session.prizes.some(p => p.quantity > 0);
  spinButton.disabled = spinning || (!available && !session.pending);
  spinButton.textContent = spinning ? 'Berputar…' : session.pending ? 'Lihat hadiah' : available ? 'Putar roda' : 'Hadiah habis';
  $('#spin-status').textContent = spinning ? 'Roda sedang berputar.' : session.pending ? 'Hadiah terpilih: ' + session.pending.label : available ? 'Roda siap diputar.' : 'Semua hadiah habis.';
  $('#apply-button').disabled = $('#reset-button').disabled = spinning || Boolean(session.pending);
  $('#draw-count').textContent = session.history.length;
}

function renderSettings() {
  const fields = $('#prize-fields');
  fields.replaceChildren();
  session.prizes.forEach((prize, i) => {
    const row = document.createElement('div'); row.className = 'prize-row';
    for (const kind of ['name','stock']) {
      const label = document.createElement('label'), caption = document.createElement('span'), input = document.createElement('input');
      caption.textContent = kind === 'name' ? 'Hadiah ' + (i + 1) : 'Sisa stok';
      input.name = kind + '-' + i;
      input.type = kind === 'name' ? 'text' : 'number';
      input.value = kind === 'name' ? prize.label : prize.quantity;
      input.required = true;
      if (kind === 'name') input.maxLength = 28;
      else { input.min = 0; input.max = 9999; input.step = 1; input.inputMode = 'numeric'; }
      input.disabled = spinning || Boolean(session.pending);
      label.append(caption, input); row.append(label);
    }
    fields.append(row);
  });
  const historyList = $('#history'); historyList.replaceChildren();
  if (!session.history.length) {
    const empty = document.createElement('li'); empty.textContent = 'Belum ada putaran.'; historyList.append(empty);
  }
  session.history.slice().reverse().forEach(result => {
    const row = document.createElement('li'), label = document.createElement('span');
    row.textContent = String(result.number).padStart(3, '0'); label.textContent = result.label;
    row.append(label); historyList.append(row);
  });
  renderControls(); showState();
}

function presentResult() {
  $('#result-prize').textContent = session.pending.label;
  $('#result-turn').textContent = 'Giliran ' + String(session.pending.number).padStart(3, '0');
  if (!$('#result-dialog').open) $('#result-dialog').showModal();
}

spinButton.addEventListener('click', async () => {
  if (spinning) return;
  if (session.pending) { presentResult(); return; }
  session = reserveSpin(session);
  spinning = true; renderControls(); renderSettings();
  const index = session.prizes.findIndex(p => p.id === session.pending.prizeId);
  const target = targetRotation(index, session.prizes.length, rotation);
  const animation = wheel.animate([{ transform:'rotate(' + rotation + 'deg)' }, { transform:'rotate(' + target + 'deg)' }], { duration:matchMedia('(prefers-reduced-motion:reduce)').matches ? 120 : 4200,easing:'cubic-bezier(.12,.69,.13,1)',fill:'forwards' });
  await animation.finished;
  rotation = target; wheel.style.transform = 'rotate(' + rotation + 'deg)'; animation.cancel();
  spinning = false; renderControls(); renderSettings(); presentResult();
});

$('#next-button').addEventListener('click', () => {
  session = nextVisitor(session); $('#result-dialog').close();
  drawWheel(); renderSettings(); spinButton.focus();
});
$('#prize-form').addEventListener('submit', event => {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  const updated = createSession(session.prizes.map((prize, i) => ({ id:prize.id,label:String(values.get('name-' + i)).trim() || prize.label,quantity:Number(values.get('stock-' + i)) })));
  session = { ...updated,history:session.history };
  $('#settings-message').textContent = 'Hadiah diperbarui untuk sesi ini.';
  drawWheel(); renderSettings();
});
$('#reset-button').addEventListener('click', () => {
  session = createSession(prizes); rotation = 0; wheel.style.transform = 'rotate(0deg)';
  $('#settings-message').textContent = 'Contoh direset.';
  drawWheel(); renderSettings();
});
$('#settings-toggle').addEventListener('click', () => { settingsOpen = !settingsOpen; updatePanel(); showState(); });
$('#close-settings').addEventListener('click', () => { settingsOpen = false; updatePanel(); showState(); $('#settings-toggle').focus(); });
$('#previous-variant').addEventListener('click', () => cycleVariant(-1));
$('#next-variant').addEventListener('click', () => cycleVariant(1));
$('#show-state').addEventListener('click', () => { showState(); $('#state-dialog').showModal(); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.addEventListener('keydown', event => {
  if (!prototypeMode || event.target.closest('input,textarea,select,[contenteditable]') || document.querySelector('dialog[open]')) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); cycleVariant(event.key === 'ArrowLeft' ? -1 : 1); }
});
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button:not(:disabled)')];
  if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
  else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
}));
mobile.addEventListener('change', updatePanel);
let width = 0;
new ResizeObserver(() => { if (width !== wheel.clientWidth) { width = wheel.clientWidth; drawWheel(); } }).observe(wheel);
switchVariant(variant); renderSettings(); drawWheel();
