import { test, expect } from '@playwright/test';

const key = 'saras-sticker-wheel-v2';
const examples = [
  { id:'saras',label:'SARAS',quantity:1 },
  { id:'claude',label:'In Claude We Trust',quantity:0 },
  { id:'bug-fitur',label:'BUG! Fitur!',quantity:0 },
  { id:'codex',label:'Codex Make no mistake',quantity:0 },
];
const browserErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  const errors = []; browserErrors.set(page,errors);
  page.on('pageerror',error => errors.push(error.message));
  page.on('console',message => { if (message.type() === 'error') errors.push(message.text()); });
});
test.afterEach(async ({ page }) => expect(browserErrors.get(page)).toEqual([]));

async function seed(page, prizes = examples) {
  await page.addInitScript(({ key,prizes }) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key,JSON.stringify({version:1,prizes,history:[],pending:null}));
      sessionStorage.setItem('seeded','true');
    }
  }, { key,prizes });
}

test('four-sticker result survives refresh without another deduction', async ({ page }) => {
  await seed(page); await page.goto('/');
  await expect(page.locator('#wheel image')).toHaveCount(4);
  await page.locator('#spin-button').click();
  await expect(page.getByRole('dialog',{name:'Stikermu',exact:true})).toBeVisible();
  await expect(page.locator('#result-image')).toHaveAttribute('alt','Stiker SARAS');
  await expect(page.locator('#result-dialog')).toHaveText(/Stikermu\s*Hadiah sudah diterima/);
  expect(await page.locator('#result-dialog').innerText()).not.toMatch(/SARAS|booth|Giliran/);
  await page.reload();
  await expect(page.locator('#result-dialog')).toBeVisible();
  await expect(page.locator('#confetti')).toBeHidden();
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)),key);
  expect(stored.history).toHaveLength(1); expect(stored.prizes[0].quantity).toBe(0);
  await page.getByRole('button',{name:'Tutup hasil',exact:true}).click();
  await page.locator('#settings-toggle').click();
  await expect(page.getByRole('textbox',{name:'Stiker 1',exact:true})).toBeDisabled();
  await expect(page.locator('#apply-button')).toBeDisabled();
  await page.locator('#close-settings').click();
  await expect(page.locator('#spin-button')).toHaveText('Lihat hadiah');
  await page.locator('#spin-button').click();
  await page.locator('#next-button').click();
  await expect(page.locator('#spin-button')).toHaveText('Hadiah habis');
  await expect(page.locator('#spin-button')).toBeDisabled();
  await expect(page.locator('#wheel text')).toHaveCount(4);
});

test('double click produces one draw, correct pointer, and one cleaned-up burst', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'no-preference' });
  await page.goto('/'); await page.locator('#spin-button').dblclick();
  await expect(page.locator('#spin-button')).toBeDisabled();
  await expect(page.locator('#confetti')).toBeHidden();
  await expect(page.locator('#result-dialog')).toBeVisible({timeout:10000});
  await expect(page.locator('#confetti')).toBeVisible();
  const outcome = await page.evaluate(key => {
    const state=JSON.parse(localStorage.getItem(key));
    const matrix=new DOMMatrix(getComputedStyle(document.querySelector('#wheel')).transform);
    const rotation=(Math.atan2(matrix.b,matrix.a)*180/Math.PI+360)%360;
    return {count:state.history.length,prize:state.pending.prizeId,pointed:state.prizes[Math.floor(((360-rotation)%360)/90)].id};
  },key);
  expect(outcome.count).toBe(1); expect(outcome.pointed).toBe(outcome.prize);
  await expect(page.locator('#confetti')).toBeHidden({timeout:5000});
  await page.keyboard.press('Escape'); await page.locator('#spin-button').click();
  await expect(page.locator('#confetti')).toBeHidden();
  await page.locator('#next-button').click();
  await expect(page.locator('#spin-button')).toBeFocused();
});

test('each sticker keeps its own artwork through label and stock edits', async ({ page }) => {
  await page.goto('/');
  for (const [index,id] of ['saras','claude','bug-fitur','codex'].entries()) {
    await page.locator('#settings-toggle').click();
    await page.getByRole('textbox',{name:'Stiker '+(index+1),exact:true}).fill('Stiker pilihan '+index);
    for (let i=0;i<4;i++) await page.getByRole('spinbutton',{name:'Stok stiker '+(i+1),exact:true}).fill(i===index?'1':'0');
    await page.locator('#apply-button').click();
    await expect(page.locator('#settings-message')).toContainText('tersimpan');
    await page.locator('#close-settings').click();
    await page.locator('#spin-button').click();
    await expect(page.locator('#result-image')).toHaveAttribute('src','./assets/stickers/'+id+'.png');
    await expect(page.locator('#result-image')).toHaveAttribute('alt','Stiker Stiker pilihan '+index);
    await page.locator('#result-image').evaluate(image => image.decode());
    await page.locator('#next-button').click();
    await expect(page.locator('#result-dialog')).toBeHidden();
  }
  await page.reload(); await page.locator('#settings-toggle').click();
  await expect(page.locator('#draw-count')).toHaveText('4');
  await expect(page.getByRole('spinbutton',{name:'Stok stiker 4',exact:true})).toHaveValue('0');
});

test('invalid stock and blank names are rejected without losing inventory', async ({ page }) => {
  await page.goto('/'); await page.locator('#settings-toggle').click();
  const stock=page.getByRole('spinbutton',{name:'Stok stiker 1',exact:true});
  await stock.fill('-1'); await page.locator('#apply-button').click();
  expect(await stock.evaluate(input => input.validity.rangeUnderflow)).toBe(true);
  await stock.fill('2');
  await page.getByRole('textbox',{name:'Stiker 1',exact:true}).fill('   ');
  await page.locator('#apply-button').click();
  await expect(page.locator('#settings-message')).toContainText('Belum tersimpan');
  expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)),key)).prizes[0].quantity).toBe(20);
});

test('CSV export, reset cancellation, and confirmed reset', async ({ page }) => {
  await seed(page); await page.goto('/'); await page.locator('#spin-button').click();
  await page.locator('#next-button').click(); await page.locator('#settings-toggle').click();
  const download=page.waitForEvent('download'); await page.locator('#export-button').click();
  expect((await download).suggestedFilename()).toMatch(/^saras-stiker-.*\.csv$/);
  await page.locator('#reset-button').click();
  await page.getByRole('button',{name:'Batal',exact:true}).click();
  await expect(page.locator('#draw-count')).toHaveText('1');
  await page.locator('#reset-button').click(); await page.locator('#confirm-reset-button').click();
  await expect(page.locator('#draw-count')).toHaveText('0');
  await expect(page.getByRole('spinbutton',{name:'Stok stiker 1',exact:true})).toHaveValue('20');
  await expect(page.locator('#export-button')).toBeDisabled();
});

test('blocked storage stops drawing and saving', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem=()=>{throw new Error('Penyimpanan diblokir');}; });
  await page.goto('/');
  await expect(page.locator('#error-message')).toBeVisible();
  await expect(page.locator('#spin-button')).toBeDisabled();
  await page.locator('#settings-toggle').click(); await expect(page.locator('#apply-button')).toBeDisabled();
  await page.locator('#reset-button').click(); await page.locator('#confirm-reset-button').click();
  await expect(page.locator('#error-message')).toContainText('Reset belum tersimpan');
  await expect(page.locator('#spin-button')).toBeDisabled();
});

test('corrupt storage is retained until explicit reset', async ({ page }) => {
  await page.addInitScript(key => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key,'{broken');sessionStorage.setItem('seeded','true'); }
  },key);
  await page.goto('/'); await expect(page.locator('#error-message')).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key),key)).toBe('{broken');
  await page.locator('#settings-toggle').click(); await page.locator('#reset-button').click();
  await page.locator('#confirm-reset-button').click(); await page.locator('#close-settings').click();
  await expect(page.locator('#error-message')).toBeHidden(); await expect(page.locator('#spin-button')).toBeEnabled();
});

test('simultaneous tabs share one pending draw', async ({ page,context }) => {
  await page.goto('/');
  const other=await context.newPage(); await other.emulateMedia({reducedMotion:'reduce'});
  other.on('pageerror',error=>browserErrors.get(page).push(error.message));
  await other.goto('/');
  await Promise.all([page.locator('#spin-button').click(),other.locator('#spin-button').click()]);
  await expect(page.locator('#result-dialog')).toBeVisible();
  await expect(other.locator('#result-dialog')).toBeVisible();
  expect((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)).history).toHaveLength(1);
  await page.locator('#next-button').click();
  await expect(other.locator('#result-dialog')).toBeHidden();
  await other.close();
});

test('B only, keyboard drawer, mobile and enlarged text', async ({ page }) => {
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:900}); await page.goto('/?variant=C&prototype=1');
    await expect(page.locator('#prototype-switcher')).toHaveCount(0);
    await expect(page.locator('#wheel image')).toHaveCount(4);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if (width === 390 || width === 1440) await page.screenshot({path:'artifacts/release-wheel-'+width+'.png',fullPage:true});
    await page.locator('#settings-toggle').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('#settings-panel')).toBeVisible();
    expect(await page.locator('#settings-panel').evaluate(panel=>panel.scrollWidth<=panel.clientWidth)).toBe(true);
    if (width === 390 || width === 1440) await page.screenshot({path:'artifacts/release-settings-'+width+'.png',fullPage:true});
    await page.keyboard.press('Escape'); await expect(page.locator('#settings-toggle')).toBeFocused();
  }
  await page.setViewportSize({width:390,height:900});
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('offline single file includes all stickers and preserves result flow', async ({ page,context }) => {
  const requests=[]; page.on('request',request=>{if(request.url().startsWith('http'))requests.push(request.url());});
  await context.setOffline(true);
  await page.goto(new URL('../dist/index.html',import.meta.url).href);
  await page.locator('#spin-button').click(); await expect(page.locator('#result-dialog')).toBeVisible();
  await page.locator('#result-image').evaluate(image=>image.decode());
  expect(await page.locator('#result-image').getAttribute('src')).toMatch(/^data:image\/png;base64,/);
  await page.locator('#next-button').click();
  await page.locator('#settings-toggle').click(); await expect(page.locator('#draw-count')).toHaveText('1');
  expect(requests).toEqual([]);
});
