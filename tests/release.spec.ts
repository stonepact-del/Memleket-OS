import { expect, test, type Page } from '@playwright/test';
import type { AppId } from '../src/core/model';

async function start(page:Page){
  await page.goto('/');await page.getByRole('button',{name:'Yeni Hayat'}).click();await page.getByLabel('Karakter adı').fill('Deniz Kaya');await page.getByRole('button',{name:'Hayatı başlat'}).click();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();
}
const sizes=[[320,568],[360,800],[390,844],[393,852],[414,896],[430,932],[768,1024],[1440,900]];
for(const [width,height] of sizes)test(`release apps and decision controls at ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width,height});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
  for(const app of ['school','career','bank','market','chat','feed','mail','calendar','news','stocks','map','notes','settings','archive'] as AppId[]){
    await page.evaluate(async(app)=>{const {useGame}=await import('/src/store.ts');useGame.getState().open(app)},app);
    await expect(page.locator(`[data-app-identity]`)).toBeVisible();
    const overflow=await page.locator('.app-window').evaluate(el=>el.scrollWidth-el.clientWidth);expect(overflow,`${app} horizontal overflow`).toBeLessThanOrEqual(1);
    await page.screenshot({path:`/tmp/memleket-${width}-${app}.png`});
  }
  await page.evaluate(async()=>{const {useGame}=await import('/src/store.ts');useGame.getState().open('home');useGame.getState().advance(300)});
  const modal=page.getByRole('dialog',{name:'Hayat kararı'});await expect(modal).toBeVisible();
  await expect(modal.getByRole('button',{name:/Yabancı dil/})).toBeEnabled();
  await modal.getByRole('button',{name:/Yabancı dil/}).scrollIntoViewIfNeeded();
  const box=await modal.getByRole('button',{name:/Yabancı dil/}).boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);expect(box!.y+box!.height).toBeLessThanOrEqual(height);
  await page.screenshot({path:`/tmp/memleket-${width}-decision.png`});
  await modal.getByRole('button',{name:/Yabancı dil/}).click();await expect(modal).toHaveCount(0);expect(errors).toEqual([]);
});

test('routine, blocking consequence, money, save and reload journey',async({page})=>{
  await page.setViewportSize({width:390,height:844});await start(page);
  await page.getByRole('button',{name:'Akışı yönet'}).click();await page.getByLabel('Günlük düzenin').selectOption('study');await page.getByRole('button',{name:/12 gün/}).click();await page.getByRole('button',{name:'Akışı yönet'}).click();await page.getByRole('button',{name:/30 gün/}).click();
  await page.getByRole('button',{name:'CepBanka',exact:true}).first().click();await page.getByRole('button',{name:/1.000 TL biriktir/}).click();
  const snapshot=await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');await useGame.getState().save();return structuredClone(useGame.getState().game!)});
  expect(snapshot.life.routine).toBe('study');expect(snapshot.life.savings).toBe(100000);expect(snapshot.events.some(e=>e.id==='exam-1'&&e.processed)).toBe(true);
  await page.reload();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();
  const restored=await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');return useGame.getState().game});expect(restored).toEqual(snapshot);
  await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');useGame.getState().advance(300)});
  const d=page.getByRole('dialog',{name:'Hayat kararı'});await expect(d).toContainText('hangi alana');
  await page.reload();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();await expect(d).toBeVisible();
  await d.getByRole('button',{name:/Sayısal/}).click();await expect(d).toHaveCount(0);
  await page.getByRole('button',{name:/Hayat Arşivi/}).first().click();await expect(page.getByText('Yeni yılda hangi alana ağırlık vereceksin?: Sayısal',{exact:true})).toBeVisible();
});

test('large text and reduced motion keep the last decision option reachable',async({page})=>{
  await page.setViewportSize({width:320,height:568});await page.emulateMedia({reducedMotion:'reduce'});await start(page);
  await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');useGame.getState().setting('largeText',true);useGame.getState().setting('reducedMotion',true);useGame.getState().advance(300)});
  const option=page.getByRole('dialog').getByRole('button',{name:/Yabancı dil/});await option.scrollIntoViewIfNeeded();await option.click();await expect(page.getByRole('dialog')).toHaveCount(0);
});
