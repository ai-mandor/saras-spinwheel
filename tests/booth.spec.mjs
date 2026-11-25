import { test, expect } from '@playwright/test';

const browserErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
});
test.afterEach(async ({ page }) => expect(browserErrors.get(page)).toEqual([]));

const key = 'saras-showcase-spinwheel-v1';
const session = (prizes, extras = {}) => ({ version: 1, prizes, history: [], pending: null, ...extras });
const examples = [
  { id: 'a', label: 'Hadiah A', quantity: 1 },
  { id: 'b', label: 'Hadiah B', quantity: 0 },
];

async function seed(page, data) {
  await page.addInitScript(({ key, data }) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key, JSON.stringify(data));
      sessionStorage.setItem('seeded', 'true');
    }
  }, { key, data });
}

test('spin, refresh, penyerahan hadiah, dan stok habis', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, session(examples));
  await page.goto('/');
  await page.getByRole('button', { name: 'Putar roda', exact: true }).click();
  await expect(page.getByRole('dialog', { name: /Yeay/ })).toBeVisible();
  await expect(page.locator('#result-prize')).toHaveText('Hadiah A');
  await page.reload();
  await expect(page.locator('#result-prize')).toHaveText('Hadiah A');
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  expect(stored.history).toHaveLength(1);
  expect(stored.prizes[0].quantity).toBe(0);
  await page.getByRole('button', { name: 'Tutup hasil hadiah' }).click();
  await page.getByRole('button', { name: 'Panel panitia' }).click();
  await expect(page.getByRole('textbox', { name: 'Nama hadiah 1', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Simpan perubahan' })).toBeDisabled();
  await page.getByRole('button', { name: 'Tutup panel panitia' }).click();
  await page.getByRole('button', { name: 'Lihat hadiahmu' }).click();
  await page.getByRole('button', { name: 'Hadiah sudah diterima' }).click();
  await expect(page.getByRole('button', { name: 'Hadiah sudah habis' })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('klik ganda saat animasi menghasilkan satu undian dan jarum sesuai hasil', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Putar roda', exact: true }).dblclick();
  await expect(page.getByRole('button', { name: 'Sedang berputar…' })).toBeDisabled();
  await expect(page.getByRole('dialog', { name: /Yeay/ })).toBeVisible({ timeout: 10_000 });
  const outcome = await page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key));
    const transform = new DOMMatrix(getComputedStyle(document.querySelector('#wheel')).transform);
    const rotation = (Math.atan2(transform.b, transform.a) * 180 / Math.PI + 360) % 360;
    const pointed = (360 - rotation) % 360;
    return { count: state.history.length, prize: state.pending.prizeId, pointedPrize: state.prizes[Math.floor(pointed / (360 / state.prizes.length))].id };
  }, key);
  expect(outcome.count).toBe(1);
  expect(outcome.prize).toBe(outcome.pointedPrize);
});

test('panel panitia mengubah hadiah dan menyimpan stok setelah reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Panel panitia' }).click();
  await expect(page.getByText('Belum ada putaran.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unduh CSV' })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Nama hadiah 1', exact: true }).fill('Merchandise booth');
  await page.getByRole('spinbutton', { name: 'Sisa stok hadiah 1', exact: true }).fill('3');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.locator('#settings-message')).toContainText('Tersimpan');
  await page.getByRole('button', { name: 'Tutup panel panitia' }).click();
  await expect(page.locator('#prize-list')).toContainText('Merchandise booth');
  await page.reload();
  await page.getByRole('button', { name: 'Panel panitia' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Sisa stok hadiah 1', exact: true })).toHaveValue('3');
});

test('validasi nama dan stok mencegah konfigurasi tidak valid', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Panel panitia' }).click();
  const stock = page.getByRole('spinbutton', { name: 'Sisa stok hadiah 1', exact: true });
  await stock.fill('-1');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  expect(await stock.evaluate(node => node.validity.rangeUnderflow)).toBe(true);
  await stock.fill('2');
  await page.getByRole('textbox', { name: 'Nama hadiah 1', exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.locator('#settings-message')).toContainText('Belum tersimpan');
});

test('riwayat dapat diunduh dan reset memerlukan konfirmasi', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, session(examples));
  await page.goto('/');
  await page.getByRole('button', { name: 'Putar roda', exact: true }).click();
  await page.getByRole('button', { name: 'Hadiah sudah diterima' }).click();
  await page.getByRole('button', { name: 'Panel panitia' }).click();
  await expect(page.locator('#history-list')).toContainText('Hadiah A');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Unduh CSV' }).click();
  expect((await downloaded).suggestedFilename()).toMatch(/^saras-hadiah-.*\.csv$/);
  await page.getByRole('button', { name: 'Mulai ulang demo' }).click();
  await page.getByRole('button', { name: 'Batal', exact: true }).click();
  await expect(page.locator('#history-count')).toHaveText('(1)');
  await page.getByRole('button', { name: 'Mulai ulang demo' }).click();
  await page.getByRole('button', { name: 'Ya, mulai ulang' }).click();
  await expect(page.locator('#history-count')).toHaveText('(0)');
  await expect(page.getByRole('textbox', { name: 'Nama hadiah 1', exact: true })).toHaveValue('Sticker pack');
});

test('penyimpanan yang gagal menampilkan error dan mencegah undian', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Penyimpanan diblokir'); }; });
  await page.goto('/');
  await expect(page.locator('#error-message')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Putar roda', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Panel panitia' }).click();
  await expect(page.getByRole('button', { name: 'Simpan perubahan' })).toBeDisabled();
});

test('data rusak tidak ditimpa dan bisa dipulihkan lewat reset', async ({ page }) => {
  await page.addInitScript(key => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key, '{broken'); sessionStorage.setItem('seeded', 'true');
    }
  }, key);
  await page.goto('/');
  await expect(page.locator('#error-message')).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('{broken');
  await page.getByRole('button', { name: 'Panel panitia' }).click();
  await page.getByRole('button', { name: 'Mulai ulang demo' }).click();
  await page.getByRole('button', { name: 'Ya, mulai ulang' }).click();
  await page.getByRole('button', { name: 'Tutup panel panitia' }).click();
  await expect(page.locator('#error-message')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Putar roda', exact: true })).toBeEnabled();
});

test('panduan dapat dibuka dengan keyboard, fokus tertahan, Escape menutup', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'SARAS, halaman spinwheel' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Cara bermain' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#guide-dialog')).toBeVisible();
  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement.closest('#guide-dialog')))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#guide-dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Cara bermain' })).toBeFocused();
  await page.getByRole('button', { name: 'Cara bermain' }).click();
  await page.getByRole('button', { name: 'Siap, ayo putar' }).click();
  await expect(page.locator('#guide-dialog')).toBeHidden();
  await page.getByRole('button', { name: 'Cara bermain' }).click();
  await page.getByRole('button', { name: 'Tutup cara bermain' }).click();
  await page.getByRole('link', { name: 'SARAS, halaman spinwheel' }).click();
  await expect(page.getByRole('button', { name: 'Putar roda', exact: true })).toBeEnabled();
});

test('ponsel, tablet, desktop, dan ukuran teks 200% tidak overflow', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Putar roda', exact: true })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const controls = page.getByRole('button');
    for (const button of await controls.all()) {
      if (!await button.isVisible()) continue;
      expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('button', { name: 'Panel panitia' }).click();
    expect(await page.locator('#staff-dialog').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.getByRole('button', { name: 'Tutup panel panitia' }).click();
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('cuplikan tampilan desktop dan mobile', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'artifacts/saras-spinwheel-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('header')).toHaveCount(1);
  await page.screenshot({ path: 'artifacts/saras-spinwheel-mobile.png', fullPage: true, animations: 'disabled' });
});

test('versi satu file dapat diputar tanpa server dan tanpa koneksi internet', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', request => { if (request.url().startsWith('http')) requests.push(request.url()); });
  await context.setOffline(true);
  const file = new URL('../dist/index.html', import.meta.url);
  await page.goto(file.href);
  await page.getByRole('button', { name: 'Putar roda', exact: true }).click();
  await expect(page.locator('#result-dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Hadiah sudah diterima' }).click();
  await page.getByRole('button', { name: 'Panel panitia' }).click();
  await expect(page.locator('#history-count')).toHaveText('(1)');
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Tutup panel panitia' }).click();
  await page.getByRole('link', { name: 'SARAS, halaman spinwheel' }).click();
  await expect(page.getByRole('button', { name: 'Putar roda', exact: true })).toBeEnabled();
});
