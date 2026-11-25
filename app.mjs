import { createSession, reserveSpin, nextVisitor, restoreSession, targetRotation } from './spin-core.mjs';

const STORAGE_KEY = 'saras-sticker-wheel-v2';
const prizes = [
  { id:'saras', label:'SARAS', quantity:20 },
  { id:'claude', label:'In Claude We Trust', quantity:20 },
  { id:'bug-fitur', label:'BUG! Fitur!', quantity:20 },
  { id:'codex', label:'Codex Make no mistake', quantity:20 },
];
const stickerImages = {
  saras:'./assets/stickers/saras.png',
  claude:'./assets/stickers/claude.png',
  'bug-fitur':'./assets/stickers/bug-fitur.png',
  codex:'./assets/stickers/codex.png',
};
const colors = ['var(--pink)', 'var(--cream)'];
const $ = selector => document.querySelector(selector);
const game = $('#game'), panel = $('#settings-panel');
const wheel = $('#wheel'), spinButton = $('#spin-button'), confetti = $('#confetti');
const motionPreference = matchMedia('(prefers-reduced-motion:reduce)');
let session = createSession(prizes);
let rotation = 0, spinning = false, busy = false, storageHealthy = false, settingsOpen = false;
let confettiFrame;

function showError(message) {
  $('#error-message').textContent = message;
  $('#error-message').hidden = false;
}

function clearError() { $('#error-message').hidden = true; }

function loadSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const next = raw === null ? createSession(prizes) : restoreSession(raw);
  if (next.prizes.length !== prizes.length || next.prizes.some((prize, index) => prize.id !== prizes[index].id)) {
    throw new Error('Data stiker tidak sesuai. Gunakan Reset contoh untuk memulihkan.');
  }
  return next;
}

function persist(next) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  catch (error) { storageHealthy = false; throw error; }
  session = next; storageHealthy = true;
}

async function changeSession(update) {
  const commit = () => {
    try { session = loadSession(); }
    catch (error) { storageHealthy = false; throw error; }
    persist(update(session));
  };
  if (navigator.locks) await navigator.locks.request(STORAGE_KEY, commit);
  else commit();
}

function updatePanel() {
  panel.hidden = !settingsOpen;
  $('#settings-toggle').setAttribute('aria-expanded', String(settingsOpen));
}

function closePanel() {
  settingsOpen = false; updatePanel(); $('#settings-toggle').focus();
}

function svgNode(tag, attrs, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function drawWheel() {
  wheel.replaceChildren();
  const definitions = svgNode('defs', {});
  wheel.append(definitions);
  const angle = 360 / session.prizes.length;
  session.prizes.forEach((prize, i) => {
    const start = (i * angle - 90) * Math.PI / 180, end = ((i + 1) * angle - 90) * Math.PI / 180;
    const x1 = 280 + 266 * Math.cos(start), y1 = 280 + 266 * Math.sin(start);
    const x2 = 280 + 266 * Math.cos(end), y2 = 280 + 266 * Math.sin(end);
    const path = 'M280 280L' + x1 + ' ' + y1 + 'A266 266 0 0 1 ' + x2 + ' ' + y2 + 'Z';
    const soldOut = !prize.quantity && session.pending?.prizeId !== prize.id;
    wheel.append(svgNode('path', { d:path,fill:soldOut ? 'color-mix(in srgb, var(--rose) 16%, var(--cream))' : colors[i % colors.length],stroke:'var(--ink)','stroke-width':.75 }));
    const clip = svgNode('clipPath', { id:'segment-' + prize.id });
    clip.append(svgNode('path', { d:path })); definitions.append(clip);
    const degrees = (i + .5) * angle - 90, radians = degrees * Math.PI / 180;
    const segment = svgNode('g', { 'clip-path':'url(#segment-' + prize.id + ')' });
    const artwork = svgNode('g', { transform:'translate(' + (280 + 164 * Math.cos(radians)) + ' ' + (280 + 164 * Math.sin(radians)) + ')' });
    artwork.append(svgNode('image', { href:stickerImages[prize.id],x:-98,y:-66,width:196,height:132,preserveAspectRatio:'xMidYMid meet',opacity:soldOut ? .3 : 1,'aria-hidden':'true' }));
    if (soldOut) {
      const size = Math.max(22,14 * 560 / Math.max(wheel.clientWidth,200));
      artwork.append(svgNode('rect', { x:-44,y:-size * .8,width:88,height:size * 1.6,rx:3,fill:'var(--cream)',stroke:'var(--rose)','stroke-width':1 }));
      artwork.append(svgNode('text', { x:0,y:0,'text-anchor':'middle','dominant-baseline':'middle','font-family':'system-ui,sans-serif','font-size':size,fill:'var(--rose)' }, 'Habis'));
    }
    segment.append(artwork); wheel.append(segment);
  });
  wheel.append(svgNode('circle', { cx:280,cy:280,r:268,fill:'none',stroke:'var(--cream)','stroke-width':4 }));
  wheel.setAttribute('aria-label', 'Roda stiker: ' + session.prizes.map(p => p.label + (p.quantity ? '' : ' habis')).join(', '));
}


function renderControls() {
  const available = session.prizes.some(prize => prize.quantity > 0);
  const locked = spinning || busy || Boolean(session.pending);
  spinButton.disabled = spinning || busy || !storageHealthy || (!available && !session.pending);
  spinButton.textContent = spinning ? 'Berputar…' : session.pending ? 'Lihat hadiah' : available ? 'Putar roda' : 'Hadiah habis';
  $('#spin-status').textContent = !storageHealthy ? 'Penyimpanan perlu diperiksa.' : spinning ? 'Roda sedang berputar.' : session.pending ? 'Stiker terpilih: ' + session.pending.label : available ? 'Roda siap diputar.' : 'Semua stiker habis.';
  $('#apply-button').disabled = locked || !storageHealthy;
  $('#reset-button').disabled = spinning || busy || (Boolean(session.pending) && storageHealthy);
  $('#export-button').disabled = !session.history.length || spinning || busy;
  $('#draw-count').textContent = session.history.length;
  for (const input of panel.querySelectorAll('input')) input.disabled = locked || !storageHealthy;
  game.dataset.spinning = String(spinning);
  wheel.setAttribute('aria-busy', String(spinning));
}

function renderSettings() {
  const fields = $('#prize-fields'); fields.replaceChildren();
  session.prizes.forEach((prize, index) => {
    const row = document.createElement('div'); row.className = 'prize-row';
    const preview = document.createElement('img');
    preview.src = stickerImages[prize.id]; preview.alt = ''; preview.width = 44; preview.height = 44;
    preview.className = 'sticker-thumbnail'; row.append(preview);
    for (const kind of ['name','stock']) {
      const label = document.createElement('label'), caption = document.createElement('span'), input = document.createElement('input');
      caption.textContent = kind === 'name' ? 'Stiker ' + (index + 1) : 'Stok';
      input.name = kind + '-' + index;
      input.type = kind === 'name' ? 'text' : 'number';
      input.value = kind === 'name' ? prize.label : prize.quantity;
      input.required = true;
      if (kind === 'name') input.maxLength = 28;
      else {
        input.min = 0; input.max = 9999; input.step = 1; input.inputMode = 'numeric';
        input.setAttribute('aria-label', 'Stok stiker ' + (index + 1));
      }
      label.append(caption,input); row.append(label);
    }
    fields.append(row);
  });
  const history = $('#history'); history.replaceChildren();
  if (!session.history.length) {
    const empty = document.createElement('li'); empty.textContent = 'Belum ada putaran.'; history.append(empty);
  }
  for (const result of session.history.slice().reverse()) {
    const row = document.createElement('li'), label = document.createElement('span');
    row.textContent = String(result.number).padStart(3,'0'); label.textContent = result.label;
    row.append(label); history.append(row);
  }
  renderControls();
}

function renderAll() { drawWheel(); renderSettings(); }

function stopConfetti() {
  cancelAnimationFrame(confettiFrame);
  confetti.hidden = true;
  confetti.width = confetti.height = 1;
}

function celebratePrize() {
  stopConfetti();
  if (motionPreference.matches) return;
  const context = confetti.getContext('2d');
  if (!context) return;
  const width = innerWidth, height = innerHeight;
  const density = Math.min(devicePixelRatio || 1, 2);
  confetti.width = Math.round(width * density);
  confetti.height = Math.round(height * density);
  context.scale(density, density);
  const style = getComputedStyle(document.documentElement);
  const palette = ['--pink','--rose','--cream'].map(color => style.getPropertyValue(color).trim());
  const particles = Array.from({ length:width < 600 ? 80 : 140 }, (_, index) => {
    const side = index % 2;
    return {
      x:width * (side ? .88 : .12), y:height * .72,
      vx:(side ? -1 : 1) * (180 + Math.random() * 380) * Math.min(width / 1000, 1),
      vy:-(480 + Math.random() * 360) * Math.min(height / 800, 1),
      delay:Math.random() * .16, angle:Math.random() * Math.PI,
      turn:(Math.random() - .5) * 16, size:5 + Math.random() * 4,
      color:palette[index % palette.length],
    };
  });
  confetti.hidden = false;
  const start = performance.now();
  function draw(now) {
    const elapsed = (now - start) / 1000;
    context.clearRect(0, 0, width, height);
    if (elapsed >= 3.2) { stopConfetti(); return; }
    for (const particle of particles) {
      const time = elapsed - particle.delay;
      if (time < 0) continue;
      const x = particle.x + particle.vx * time;
      const y = particle.y + particle.vy * time + 500 * time * time;
      if (y > height + 24) continue;
      context.save();
      context.globalAlpha = Math.min(1, (3.2 - elapsed) / .5);
      context.translate(x, y);
      context.rotate(particle.angle + particle.turn * time);
      context.scale(1, Math.cos(particle.angle + time * 10));
      context.fillStyle = particle.color;
      context.fillRect(-particle.size / 2, -particle.size, particle.size, particle.size * 2);
      context.restore();
    }
    confettiFrame = requestAnimationFrame(draw);
  }
  confettiFrame = requestAnimationFrame(draw);
}

function presentResult(celebrate = false) {
  const image = $('#result-image');
  image.src = stickerImages[session.pending.prizeId];
  image.alt = 'Stiker ' + session.pending.label;
  image.hidden = false;
  if (!$('#result-dialog').open) $('#result-dialog').showModal();
  if (celebrate) celebratePrize();
}


function alignPending() {
  if (!session.pending) return;
  rotation = targetRotation(session.prizes.findIndex(prize => prize.id === session.pending.prizeId), session.prizes.length, rotation, 0);
  wheel.style.transform = 'rotate(' + rotation + 'deg)';
}

$('#result-dialog').addEventListener('close', stopConfetti);
$('#result-dialog').addEventListener('cancel', stopConfetti);
motionPreference.addEventListener('change', event => { if (event.matches) stopConfetti(); });

spinButton.addEventListener('click', async () => {
  if (spinning || busy || !storageHealthy) return;
  if (session.pending) { presentResult(); return; }
  spinning = true; clearError(); renderControls();
  try { await changeSession(current => reserveSpin(current)); }
  catch (error) {
    spinning = false; renderAll(); showError('Putaran belum dimulai. ' + error.message);
    if (storageHealthy && session.pending) { alignPending(); presentResult(); }
    return;
  }
  const resultNumber = session.pending.number;
  const target = targetRotation(session.prizes.findIndex(prize => prize.id === session.pending.prizeId), session.prizes.length, rotation);
  renderAll();
  const animation = wheel.animate([{ transform:'rotate(' + rotation + 'deg)' }, { transform:'rotate(' + target + 'deg)' }], { duration:motionPreference.matches ? 120 : 4600,easing:'cubic-bezier(.12,.74,.13,1)',fill:'forwards' });
  let frame, lastSegment = Math.floor(rotation / (360 / session.prizes.length));
  const pointer = $('#pointer-body');
  function tickPointer() {
    const progress = animation.effect.getComputedTiming().progress || 0;
    const segment = Math.floor((rotation + (target - rotation) * progress) / (360 / session.prizes.length));
    if (segment !== lastSegment) {
      pointer.getAnimations().forEach(tick => tick.cancel());
      pointer.animate([{ transform:'rotate(0deg)' }, { transform:'rotate(-7deg)',offset:.3 }, { transform:'rotate(0deg)' }], { duration:110,easing:'ease-out' });
      lastSegment = segment;
    }
    frame = requestAnimationFrame(tickPointer);
  }
  if (!motionPreference.matches) frame = requestAnimationFrame(tickPointer);
  // The saved prize remains valid even if the visual animation is cancelled.
  try { await animation.finished; } catch {}
  cancelAnimationFrame(frame); pointer.getAnimations().forEach(tick => tick.cancel());
  rotation = target; wheel.style.transform = 'rotate(' + rotation + 'deg)'; animation.cancel();
  spinning = false;
  try { session = loadSession(); }
  catch (error) { storageHealthy = false; showError('Data undian perlu diperiksa. ' + error.message); renderAll(); return; }
  renderAll();
  if (session.pending) { alignPending(); presentResult(session.pending.number === resultNumber); }
});

$('#next-button').addEventListener('click', async () => {
  if (busy) return;
  busy = true; $('#next-button').disabled = true; stopConfetti(); renderControls();
  try {
    await changeSession(current => nextVisitor(current));
    $('#result-dialog').close(); clearError(); renderAll();
  } catch (error) {
    $('#result-dialog').close(); showError('Hadiah belum bisa diselesaikan. ' + error.message);
  } finally {
    busy = false; $('#next-button').disabled = false; renderControls();
    (spinButton.disabled ? $('#settings-toggle') : spinButton).focus();
  }
});

$('#prize-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || spinning || session.pending || !storageHealthy) return;
  const values = new FormData(event.currentTarget);
  busy = true; renderControls();
  try {
    await changeSession(current => {
      if (current.pending) throw new Error('Selesaikan hadiah sebelumnya dulu.');
      const next = createSession(current.prizes.map((prize,index) => ({ id:prize.id,label:String(values.get('name-' + index)).trim(),quantity:Number(values.get('stock-' + index)) })));
      return { ...next,history:current.history };
    });
    clearError(); renderAll(); $('#settings-message').textContent = 'Nama stiker dan stok tersimpan.';
  } catch (error) { $('#settings-message').textContent = 'Belum tersimpan. ' + error.message; }
  finally { busy = false; renderControls(); }
});

$('#prize-form').addEventListener('invalid', () => { $('#settings-message').textContent = 'Isi nama stiker dan stok berupa angka 0–9999.'; }, true);
$('#settings-toggle').addEventListener('click', () => { settingsOpen = !settingsOpen; if (settingsOpen) renderSettings(); updatePanel(); });
$('#close-settings').addEventListener('click', closePanel);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && settingsOpen && !document.querySelector('dialog[open]')) closePanel();
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.close === 'result-dialog') stopConfetti();
  document.getElementById(button.dataset.close).close();
}));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button:not(:disabled)')];
  if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
  else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
}));

$('#reset-button').addEventListener('click', () => $('#reset-dialog').showModal());
$('#confirm-reset-button').addEventListener('click', async () => {
  if (busy || spinning) return;
  busy = true; $('#confirm-reset-button').disabled = true; renderControls();
  try {
    const reset = () => persist(createSession(prizes));
    if (navigator.locks) await navigator.locks.request(STORAGE_KEY,reset); else reset();
    rotation = 0; wheel.style.transform = 'rotate(0deg)'; stopConfetti();
    clearError(); renderAll(); $('#reset-dialog').close();
    $('#settings-message').textContent = 'Stok contoh dikembalikan dan riwayat dihapus.';
  } catch (error) {
    showError('Reset belum tersimpan. ' + error.message); $('#reset-dialog').close();
  } finally { busy = false; $('#confirm-reset-button').disabled = false; renderControls(); }
});

$('#export-button').addEventListener('click', () => {
  const escapeCell = value => '"' + String(value).replaceAll('"','""').replace(/^[=+@-]/,"'$&") + '"';
  const rows = [['Giliran','Stiker','Waktu'], ...session.history.map(result => [result.number,result.label,result.timestamp])];
  const blob = new Blob(['\uFEFF' + rows.map(row => row.map(escapeCell).join(',')).join('\r\n')], { type:'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'saras-stiker-' + new Date().toISOString().slice(0,10) + '.csv';
  link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
});

window.addEventListener('storage', event => {
  if ((event.key !== STORAGE_KEY && event.key !== null) || spinning || busy) return;
  try {
    session = loadSession(); storageHealthy = true; renderAll(); clearError();
    if (session.pending) alignPending();
    if ($('#result-dialog').open) {
      if (session.pending) presentResult(); else $('#result-dialog').close();
    }
  } catch (error) { storageHealthy = false; showError('Data di browser perlu diperiksa. ' + error.message); renderControls(); }
});

try { persist(loadSession()); }
catch (error) { showError('Data tidak dapat dibaca atau disimpan. Buka Pengaturan lalu Reset contoh untuk memulihkan. ' + error.message); }
renderAll(); updatePanel();
let lastWidth = wheel.clientWidth;
new ResizeObserver(() => {
  if (lastWidth !== wheel.clientWidth) { lastWidth = wheel.clientWidth; drawWheel(); }
}).observe(wheel);
if (storageHealthy && session.pending) { alignPending(); presentResult(); }
