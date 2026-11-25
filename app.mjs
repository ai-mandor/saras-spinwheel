import { createSession, nextVisitor, reserveSpin, restoreSession, targetRotation } from './spin-core.mjs';

const STORAGE_KEY = 'saras-showcase-spinwheel-v1';
const EXAMPLE_PRIZES = [
  { id: 'sticker', label: 'Sticker pack', quantity: 20 },
  { id: 'keychain', label: 'Gantungan kunci', quantity: 10 },
  { id: 'pin', label: 'Pin SARAS', quantity: 15 },
  { id: 'notebook', label: 'Notebook', quantity: 10 },
  { id: 'pouch', label: 'Pouch', quantity: 8 },
  { id: 'totebag', label: 'Tote bag', quantity: 5 },
];
const SEGMENT_COLORS = ['#f2d6e0', '#fff0dd', '#d987a8', '#fbe9ef', '#f0c8ae', '#e6b4c7'];
const $ = selector => document.querySelector(selector);
const wheel = $('#wheel');
const spinButton = $('#spin-button');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let session;
let spinning = false;
let rotation = 0;
let storageHealthy = false;

function svgNode(name, attributes, content) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (content !== undefined) node.textContent = content;
  return node;
}

function labelLines(label) {
  if (label.length <= 12) return [label];
  const words = label.split(' ');
  if (words.length === 1) return [label.slice(0, 14), label.slice(14)];
  let split = 1;
  for (let i = 1; i < words.length; i += 1) {
    if (Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length) < Math.abs(words.slice(0, split).join(' ').length - words.slice(split).join(' ').length)) split = i;
  }
  return [words.slice(0, split).join(' '), words.slice(split).join(' ')];
}

function drawWheel() {
  wheel.replaceChildren();
  const count = session.prizes.length;
  const angle = 360 / count;
  const fontSize = Math.max(17, 14 * 560 / Math.max(wheel.clientWidth, 180));
  session.prizes.forEach((prize, index) => {
    const start = (index * angle - 90) * Math.PI / 180;
    const end = ((index + 1) * angle - 90) * Math.PI / 180;
    const x1 = 280 + 266 * Math.cos(start), y1 = 280 + 266 * Math.sin(start);
    const x2 = 280 + 266 * Math.cos(end), y2 = 280 + 266 * Math.sin(end);
    wheel.append(svgNode('path', { d: `M280 280L${x1} ${y1}A266 266 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2}Z`, fill: prize.quantity > 0 ? SEGMENT_COLORS[index % SEGMENT_COLORS.length] : '#e8dfdd', stroke: '#fff8f1', 'stroke-width': 2 }));
    const degrees = (index + .5) * angle - 90;
    const radians = degrees * Math.PI / 180;
    const orientation = degrees > 90 && degrees < 270 ? degrees + 180 : degrees;
    const x = 280 + 165 * Math.cos(radians), y = 280 + 165 * Math.sin(radians);
    const text = svgNode('text', { transform: `translate(${x} ${y}) rotate(${orientation})`, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#2b2125', 'font-family': '-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif', 'font-size': fontSize, 'font-weight': 550 });
    const lines = labelLines(prize.label);
    lines.forEach((line, i) => text.append(svgNode('tspan', { x: 0, y: (i - (lines.length - 1) / 2) * fontSize * 1.2 }, line)));
    if (!prize.quantity) text.append(svgNode('tspan', { x: 0, y: (lines.length / 2) * fontSize * 1.2 + 12, 'font-size': fontSize }, 'Habis'));
    wheel.append(text);
  });
  wheel.append(svgNode('circle', { cx: 280, cy: 280, r: 270, fill: 'none', stroke: '#fff8f1', 'stroke-width': 10 }));
  for (let i = 0; i < 36; i += 1) {
    const radians = i * Math.PI / 18;
    wheel.append(svgNode('circle', { cx: 280 + 271 * Math.cos(radians), cy: 280 + 271 * Math.sin(radians), r: 2.2, fill: '#b77d8f' }));
  }
  wheel.setAttribute('aria-label', `Roda hadiah: ${session.prizes.map(prize => prize.label + (prize.quantity ? '' : ' (habis)')).join(', ')}`);
}

function renderPrizes() {
  const list = $('#prize-list');
  list.replaceChildren();
  for (const prize of session.prizes) {
    const row = document.createElement('li');
    if (!prize.quantity) row.className = 'sold-out';
    const dot = document.createElement('span');
    dot.className = 'prize-dot';
    dot.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'prize-label';
    label.textContent = prize.label;
    row.append(dot, label);
    if (!prize.quantity) {
      const stock = document.createElement('span');
      stock.className = 'stock-label';
      stock.textContent = 'Habis';
      row.append(stock);
      row.setAttribute('aria-label', `${prize.label}, stok habis`);
    }
    list.append(row);
  }
}

function renderControls() {
  const available = session?.prizes.some(prize => prize.quantity > 0);
  spinButton.disabled = spinning || !storageHealthy || (!session?.pending && !available);
  $('#staff-button').disabled = spinning;
  $('#spin-status').textContent = !storageHealthy ? 'Penyimpanan perlu diperiksa panitia.' : spinning ? 'Rodanya berputar… tunggu kejutanmu.' : session.pending ? 'Hadiahmu sudah terpilih dan siap diambil.' : available ? 'Siap untuk giliranmu?' : 'Terima kasih! Semua hadiah sudah dibagikan.';
  spinButton.textContent = spinning ? 'Sedang berputar…' : session?.pending ? 'Lihat hadiahmu' : !available ? 'Hadiah sudah habis' : 'Putar roda';
  $('#control-note').textContent = session?.pending && !spinning ? 'Selesaikan pengambilan hadiah untuk giliran berikutnya.' : '';
}

function showError(message) {
  const error = $('#error-message');
  error.textContent = message;
  error.hidden = false;
}

function clearError() {
  $('#error-message').hidden = true;
}

function persist(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  session = next;
  storageHealthy = true;
}

function loadSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === null ? createSession(EXAMPLE_PRIZES) : restoreSession(raw);
}

async function changeSession(update) {
  const commit = () => {
    const current = loadSession();
    persist(update(current));
  };
  if (navigator.locks) await navigator.locks.request(STORAGE_KEY, commit);
  else commit();
}

function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog.open) dialog.showModal();
}

function presentResult(celebrate = false) {
  if (!session.pending) return;
  $('#result-prize').textContent = session.pending.label;
  $('#ticket-number').textContent = `Giliran ${String(session.pending.number).padStart(3, '0')}`;
  openDialog('result-dialog');
  if (celebrate && !reducedMotion.matches) {
    const container = $('#confetti');
    container.replaceChildren();
    for (let i = 0; i < 34; i += 1) {
      const piece = document.createElement('i');
      piece.style.left = `${(i * 37) % 100}%`;
      piece.style.background = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      piece.style.animationDelay = `${i % 8 * .07}s`;
      piece.style.setProperty('--drift', `${(i % 5 - 2) * 60}px`);
      container.append(piece);
    }
    setTimeout(() => container.replaceChildren(), 3600);
  }
}

async function spin() {
  if (spinning || !storageHealthy) return;
  if (session.pending) { presentResult(); return; }
  spinning = true;
  clearError();
  renderControls();
  try {
    await changeSession(current => reserveSpin(current));
  } catch (error) {
    spinning = false;
    showError(`Putaran belum dimulai. ${error.message}`);
    renderControls();
    return;
  }
  const winnerIndex = session.prizes.findIndex(prize => prize.id === session.pending.prizeId);
  const target = targetRotation(winnerIndex, session.prizes.length, rotation);
  const animation = wheel.animate([{ transform: `rotate(${rotation}deg)` }, { transform: `rotate(${target}deg)` }], { duration: reducedMotion.matches ? 120 : 4800, easing: 'cubic-bezier(.12,.69,.13,1)', fill: 'forwards' });
  try { await animation.finished; } catch { /* Hasil sudah disimpan sebelum animasi, termasuk saat animasi dibatalkan. */ }
  rotation = target;
  wheel.style.transform = `rotate(${rotation}deg)`;
  animation.cancel();
  spinning = false;
  renderControls();
  renderPrizes();
  presentResult(true);
}

function renderStaff() {
  const fields = $('#prize-fields');
  fields.replaceChildren();
  session.prizes.forEach((prize, index) => {
    const row = document.createElement('div');
    row.className = 'prize-field';
    const nameLabel = document.createElement('label');
    nameLabel.className = 'visually-hidden';
    nameLabel.htmlFor = `prize-name-${index}`;
    nameLabel.textContent = `Nama hadiah ${index + 1}`;
    const name = document.createElement('input');
    name.id = nameLabel.htmlFor;
    name.name = `prize-name-${index}`;
    name.type = 'text';
    name.value = prize.label;
    name.required = true;
    name.maxLength = 28;
    const quantityLabel = document.createElement('label');
    quantityLabel.className = 'visually-hidden';
    quantityLabel.htmlFor = `prize-stock-${index}`;
    quantityLabel.textContent = `Sisa stok hadiah ${index + 1}`;
    const quantity = document.createElement('input');
    quantity.id = quantityLabel.htmlFor;
    quantity.name = `prize-stock-${index}`;
    quantity.type = 'number';
    quantity.inputMode = 'numeric';
    quantity.min = '0'; quantity.max = '9999'; quantity.step = '1'; quantity.required = true;
    quantity.value = prize.quantity;
    name.disabled = quantity.disabled = Boolean(session.pending);
    row.append(nameLabel, name, quantityLabel, quantity);
    fields.append(row);
  });
  $('#save-button').disabled = Boolean(session.pending) || !storageHealthy;
  $('#settings-message').textContent = session.pending ? 'Selesaikan pengambilan hadiah sebelum mengubah stok.' : '';
  $('#history-count').textContent = `(${session.history.length})`;
  $('#export-button').disabled = session.history.length === 0;
  const history = $('#history-list');
  history.replaceChildren();
  if (!session.history.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-history';
    empty.textContent = 'Belum ada putaran. Hasil akan tercatat di sini setelah roda diputar.';
    history.append(empty);
  }
  for (const result of session.history.slice().reverse()) {
    const row = document.createElement('li');
    const number = document.createElement('span');
    number.className = 'history-number'; number.textContent = String(result.number).padStart(3, '0');
    const label = document.createElement('strong'); label.textContent = result.label;
    const time = document.createElement('time'); time.dateTime = result.timestamp;
    time.textContent = new Date(result.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    row.append(number, label, time); history.append(row);
  }
}

spinButton.addEventListener('click', spin);
$('#guide-button').addEventListener('click', () => openDialog('guide-dialog'));
$('#staff-button').addEventListener('click', () => { renderStaff(); openDialog('staff-dialog'); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')].filter(node => node.getClientRects().length);
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}));

$('#next-button').addEventListener('click', async () => {
  $('#next-button').disabled = true;
  try {
    await changeSession(current => nextVisitor(current));
    $('#result-dialog').close();
    drawWheel();
    renderPrizes();
    clearError();
  } catch (error) {
    $('#result-dialog').close();
    showError(`Giliran belum bisa diselesaikan. ${error.message}`);
  } finally { $('#next-button').disabled = false; renderControls(); spinButton.focus(); }
});

$('#prize-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  $('#save-button').disabled = true;
  try {
    await changeSession(current => {
      if (current.pending) throw new Error('Selesaikan giliran sebelumnya dulu.');
      const next = createSession(current.prizes.map((prize, index) => ({ id: prize.id, label: form.get(`prize-name-${index}`), quantity: Number(form.get(`prize-stock-${index}`)) })));
      return { ...next, history: current.history };
    });
    drawWheel(); renderPrizes(); renderControls();
    $('#settings-message').textContent = 'Tersimpan. Nama hadiah dan sisa stok sudah diperbarui.';
    clearError();
  } catch (error) { $('#settings-message').textContent = `Belum tersimpan. ${error.message}`; }
  finally { $('#save-button').disabled = Boolean(session.pending) || !storageHealthy; }
});

$('#export-button').addEventListener('click', () => {
  const escapeCell = value => `"${String(value).replaceAll('"', '""').replace(/^[=+@-]/, "'$&")}"`;
  const rows = [['Giliran', 'Hadiah', 'Waktu'], ...session.history.map(result => [result.number, result.label, result.timestamp])];
  const blob = new Blob(['\uFEFF' + rows.map(row => row.map(escapeCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `saras-hadiah-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$('#reset-button').addEventListener('click', () => openDialog('reset-dialog'));
$('#confirm-reset-button').addEventListener('click', async () => {
  $('#confirm-reset-button').disabled = true;
  try {
    const reset = () => persist(createSession(EXAMPLE_PRIZES));
    if (navigator.locks) await navigator.locks.request(STORAGE_KEY, reset); else reset();
    rotation = 0; wheel.style.transform = 'rotate(0deg)';
    drawWheel(); renderPrizes(); renderControls(); renderStaff(); clearError();
    $('#reset-dialog').close();
    $('#settings-message').textContent = 'Demo dimulai ulang. Hadiah contoh sudah dikembalikan.';
  } catch (error) { showError(`Data belum bisa direset. Periksa izin penyimpanan browser. ${error.message}`); }
  finally { $('#confirm-reset-button').disabled = false; }
});

window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  if (spinning) return;
  try {
    session = loadSession(); storageHealthy = true;
    drawWheel(); renderPrizes(); renderControls();
    if ($('#staff-dialog').open) renderStaff();
    if ($('#result-dialog').open) {
      if (session.pending) presentResult(); else $('#result-dialog').close();
    }
  } catch (error) { storageHealthy = false; showError(`Data di browser perlu diperiksa panitia. ${error.message}`); renderControls(); }
});

try {
  session = loadSession();
  persist(session);
} catch (error) {
  session = createSession(EXAMPLE_PRIZES);
  showError(`Data undian tidak dapat dibaca atau disimpan. Buka Panel panitia dan pilih Mulai ulang demo untuk memulihkan data. ${error.message}`);
}
drawWheel(); renderPrizes(); renderControls();
let lastWheelWidth = wheel.clientWidth;
new ResizeObserver(() => {
  const width = wheel.clientWidth;
  if (width !== lastWheelWidth) { lastWheelWidth = width; drawWheel(); }
}).observe(wheel);
if (session.pending) {
  const index = session.prizes.findIndex(prize => prize.id === session.pending.prizeId);
  rotation = targetRotation(index, session.prizes.length, 0, 0);
  wheel.style.transform = `rotate(${rotation}deg)`;
  presentResult();
}
