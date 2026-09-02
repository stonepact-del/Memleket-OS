import { expect, test } from '@playwright/test';


const requiredMobileViewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 414, height: 896 },
  { width: 430, height: 932 },
];

async function expectUsefulBox(page: import('@playwright/test').Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  expect(box, `${selector} should have a visible bounding box`).not.toBeNull();
  expect(box!.width, `${selector} should have useful width`).toBeGreaterThan(40);
  expect(box!.height, `${selector} should have useful height`).toBeGreaterThan(40);
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
}

async function expectVisibleIntersection(page: import('@playwright/test').Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  expect(box, `${selector} should have a visible bounding box`).not.toBeNull();
  const viewport = page.viewportSize()!;
  const visibleWidth = Math.min(box!.x + box!.width, viewport.width) - Math.max(box!.x, 0);
  const visibleHeight = Math.min(box!.y + box!.height, viewport.height) - Math.max(box!.y, 0);
  expect(visibleWidth).toBeGreaterThan(40);
  expect(visibleHeight).toBeGreaterThan(40);
}

async function startLifeAtLock(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Yeni Hayat' }).click();
  await page.getByLabel('Karakter adı').fill('Deniz Kaya');
  await page.getByRole('button', { name: 'Hayatı başlat' }).click();
  await expect(page.locator('.lock-screen')).toBeVisible();
}

async function swipeUp(page: import('@playwright/test').Page, distance = 150) {
  const lock = page.locator('.lock-screen');
  const box = await lock.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width / 2;
  const startY = box!.y + box!.height * 0.72;
  await page.mouse.move(x, startY);
  await page.mouse.down();
  await page.mouse.move(x, startY - distance, { steps: 6 });
  await page.mouse.up();
}

for (const viewport of requiredMobileViewports) {
  test(`mobile OS remains visible through lock, home and app at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await startLifeAtLock(page);
    await expectUsefulBox(page, '.lock-screen');
    await swipeUp(page);
    await expect(page.locator('.phone-home')).toBeVisible();
    await expectUsefulBox(page, '.device');
    await expectUsefulBox(page, '.workspace');
    await expectUsefulBox(page, '.app-window');
    await expectUsefulBox(page, '.phone-home');
    await expectVisibleIntersection(page, '.app-grid');
    await expectUsefulBox(page, '.phone-dock');
    await expect(page.locator('.rail')).toBeHidden();
    await page.getByRole('button', { name: 'Okulum' }).first().click();
    await expectUsefulBox(page, '.native-app-body');
    await expectUsefulBox(page, '.system-nav');
    await page.getByRole('button', { name: 'Ana ekrana dön' }).click();
    await expect(page.locator('.phone-home')).toBeVisible();
  });
}

test('phone shell survives browser viewport height changes after unlock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startLifeAtLock(page);
  await swipeUp(page);
  await page.setViewportSize({ width: 390, height: 700 });
  await expectUsefulBox(page, '.device');
  await expectUsefulBox(page, '.workspace');
  await expectUsefulBox(page, '.app-window');
  await expectUsefulBox(page, '.phone-dock');
  await page.getByRole('button', { name: 'Okulum' }).first().click();
  await expectUsefulBox(page, '.native-app-body');
});

test('a short upward lock-screen drag returns to locked state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startLifeAtLock(page);
  await swipeUp(page, 30);
  await expect(page.locator('.lock-screen')).toBeVisible();
  await expect(page.locator('.phone-home')).toHaveCount(0);
  await expect(page.locator('.lock-surface')).toHaveAttribute('data-unlock-ready', 'false');
});

test('accessible unlock affordance supports click and keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startLifeAtLock(page);
  const unlock = page.getByRole('button', { name: 'Telefonun kilidini aç' });
  await unlock.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.phone-home')).toBeVisible();
});

test('swipe unlock remains functional with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await startLifeAtLock(page);
  await swipeUp(page);
  await expect(page.locator('.phone-home')).toBeVisible();
});

async function createLife(page:import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button',{name:'Yeni Hayat'}).click();
  await page.getByLabel('Karakter adı').fill('Deniz Kaya');
  await page.getByRole('button',{name:'Hayatı başlat'}).click();
  await expect(page.getByRole('button',{name:'Telefonun kilidini aç'})).toBeVisible();
  await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();
  await expect(page.locator('.phone-home')).toBeVisible();
}
async function goHome(page:import('@playwright/test').Page){const back=page.getByRole('button',{name:'Ana ekrana dön'});if(await back.isVisible())await back.click();else await page.getByRole('button',{name:'Ana Ekran',exact:true}).click();}

test('new life, phone action, time, notification and reload',async({page})=>{
  await createLife(page);
  await page.getByRole('button',{name:/Okulum/}).first().click();
  await page.getByRole('button',{name:/Matematik çalış/}).click();
  await page.getByRole('button',{name:'2 saat'}).click();
  await page.getByRole('button',{name:'Çalışmaya başla'}).click();
  if(await page.getByRole('button',{name:'Ana ekrana dön'}).isVisible()) await goHome(page); else await page.getByRole('button',{name:'Ana Ekran',exact:true}).click();
  await page.getByRole('button',{name:'Akışı yönet'}).click();
  await expect(page.getByRole('dialog',{name:'Zaman akışı'})).toBeVisible();
  await page.getByRole('button',{name:/4 gün/}).click();
  await page.getByRole('button',{name:'Bildirim merkezini aç'}).click();
  await expect(page.getByText('Sınav sonucu')).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();
  await expect(page.locator('.phone-home')).toBeVisible();
});

test('main menu contains no broken settings route',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Yeni Hayat'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Hayatlarım'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Ayarlar'})).toHaveCount(0);
});

for(const viewport of [{width:320,height:568},{width:360,height:800},{width:390,height:844},{width:393,height:852},{width:414,height:896},{width:430,height:932},{width:768,height:1024},{width:1440,height:900}]){
  test(`phone shell has no horizontal overflow at ${viewport.width}x${viewport.height}`,async({page})=>{
    await page.setViewportSize(viewport);
    await createLife(page);
    const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
    await expect(page.locator('.app-grid')).toBeVisible();
    if(viewport.width<900){await expect(page.locator('.phone-dock')).toBeVisible();expect(await page.locator('.phone-dock').evaluate(el=>getComputedStyle(el).position)).toBe('fixed');const dock=await page.locator('.phone-dock').boundingBox();expect(dock?.y).toBeGreaterThan(0);expect((dock?.y||0)+(dock?.height||0)).toBeLessThanOrEqual(viewport.height);}else await expect(page.locator('.phone-dock')).toBeHidden();
    await expect(page.locator('.timebar')).toHaveCount(0);
  });
}

test('chat reply and read state persist',async({page})=>{
  await createLife(page);await page.getByRole('button',{name:'Sohbet'}).first().click();
  await expect(page.locator('[data-app-identity="chat-native"]')).toBeVisible();
  await expect(page.locator('.bubbles').getByText('Günaydın, okul çıkışı haber ver olur mu?')).toBeVisible();
  await page.getByLabel('Mesaj').fill('Yarınki matematik sınavından korkuyorum');await page.locator('.chat-layout form button').click();
  await expect(page.locator('.bubbles').getByText(/Kaygılanman normal|Hazırlığına güven/)).toBeVisible();
  await page.reload();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();await page.getByRole('button',{name:'Sohbet'}).first().click();
  await expect(page.locator('.bubbles').getByText('Yarınki matematik sınavından korkuyorum')).toBeVisible();
});

test('marketplace inline offer, inspection and purchase persist',async({page})=>{
  await createLife(page);await page.getByRole('button',{name:'SarıPazar'}).first().click();await page.getByRole('button',{name:'Elektronik'}).click();const beforeTitles=await page.getByText('Çalışma masası',{exact:true}).count();await page.getByRole('button',{name:'İlanı aç'}).first().click();
  await expect(page.locator('[data-app-identity="market-native"]')).toBeVisible();const title=await page.locator('.market-detail h1').innerText();await page.getByRole('button',{name:'İncele'}).click();await expect(page.getByText(/Belirgin sorun görülmedi|Yakında bakım|Yapılmadı/)).toBeVisible();
  await page.getByLabel('Teklif (TL)').fill('1000');await page.getByRole('button',{name:'Teklif gönder'}).click();await expect(page.getByRole('button',{name:'Anlaşılan fiyata satın al'})).toBeVisible();
  await page.getByRole('button',{name:/fiyata satın al/}).click();await page.reload();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();await page.getByRole('button',{name:'SarıPazar'}).first().click();await page.getByRole('button',{name:'Elektronik'}).click();await expect(page.getByText(title,{exact:true})).toHaveCount(beforeTitles-1);
});

test('career interview, offer and first employment loop',async({page})=>{
  await createLife(page);await page.locator('.app-grid > button').filter({hasText:'Kariyer'}).click();await page.getByRole('button',{name:/ilanını aç/}).first().click();await page.getByRole('button',{name:'Başvur'}).click();await goHome(page);
  await page.getByRole('button',{name:'Akışı yönet'}).click();await page.getByRole('button',{name:/4 gün/}).click();await page.locator('.app-grid > button').filter({hasText:'Takvim'}).click();await page.getByText(/görüşmesi/).click();await page.getByRole('button',{name:'Hazırlığını örneklerle anlat'}).click();
  await goHome(page);await page.getByRole('button',{name:'Akışı yönet'}).click();await page.getByRole('button',{name:/4 gün/}).click();await page.locator('.app-grid > button').filter({hasText:'Kariyer'}).click();await page.getByRole('button',{name:'Teklifi kabul et'}).click();
  await goHome(page);await page.locator('.app-grid > button').filter({hasText:'Harita'}).click();await expect(page.getByText('Kafe')).toBeVisible();
});

test('feed reactions and comments persist',async({page})=>{
  await createLife(page);await page.locator('.app-grid > button').filter({hasText:'Akış'}).click();await expect(page.locator('[data-app-identity="feed-native"]')).toBeVisible();await expect(page.locator('.feed-post .contact-avatar')).toHaveAttribute('data-avatar-variant',/\d-\d-\d-\d/);await page.getByRole('button',{name:'Beğen'}).first().click();await page.getByRole('button',{name:/yorumu aç/}).first().click();await page.getByRole('textbox',{name:'Yorum'}).fill('Kolay gelsin!');await page.getByRole('button',{name:'Yorumu gönder'}).click();await expect(page.getByText('Kolay gelsin!')).toBeVisible();await page.reload();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();await page.locator('.app-grid > button').filter({hasText:'Akış'}).click();await page.getByRole('button',{name:/yorumu aç/}).first().click();await expect(page.getByText('Kolay gelsin!')).toBeVisible();await expect(page.getByRole('button',{name:'Beğeniyi kaldır'})).toBeVisible();await page.getByRole('button',{name:'Beğeniyi kaldır'}).click();await expect(page.getByRole('button',{name:'Beğen'})).toBeVisible();
});

test('mail reads only the opened message, persists it and follows its truthful app link',async({page})=>{
  await createLife(page);await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');const game=structuredClone(useGame.getState().game!);game.mails.push({id:'mail2',at:game.now,sender:'Takvim',subject:'Yaklaşan plan',body:'Programındaki yaklaşan zamanı kontrol et.',read:false,app:'calendar'});useGame.setState({game});await useGame.getState().save()});await page.locator('.app-grid').getByRole('button',{name:/Posta/}).click();await expect(page.locator('[data-app-identity="mail-native"]')).toBeVisible();await expect(page.getByLabel('2 okunmamış ileti')).toBeVisible();await page.getByRole('button',{name:/Okunmamış: Okul Rehberlik Servisi/}).click();await expect(page.getByRole('heading',{name:'Yeni dönem çalışma planı'})).toBeVisible();await page.getByRole('button',{name:'Gelen kutusuna dön'}).click();await expect(page.getByLabel('1 okunmamış ileti')).toBeVisible();await expect(page.getByRole('button',{name:/Okunmamış: Takvim/})).toBeVisible();await page.getByRole('button',{name:/Okunmamış: Takvim/}).click();await page.getByRole('button',{name:'Takvim uygulamasını aç'}).click();await expect(page.locator('[data-app-identity="calendar-native"]')).toBeVisible();await page.reload();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();await page.locator('.app-grid').getByRole('button',{name:/Posta/}).click();await expect(page.getByLabel('0 okunmamış ileti')).toBeVisible();
});

test('news presents simulated stories editorially and opens a full article',async({page})=>{
  await createLife(page);await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');const game=structuredClone(useGame.getState().game!);game.news=[{id:'story-old',at:'2026-09-01T07:00:00.000Z',category:'Şehir',title:'Mahalle meydanında yeni düzen',body:'Meydan çevresindeki yaya alanları için çalışmalar tamamlandı.'},{id:'story-lead',at:'2026-09-02T07:00:00.000Z',category:'Eğitim',title:'Okul kulüpleri yeni döneme hazır',body:'Öğrencilerin katılabileceği kulüp çalışmaları yeni dönem için programlandı.'}];useGame.setState({game})});await page.getByRole('button',{name:'Gündem'}).first().click();await expect(page.locator('[data-app-identity="news-native"]')).toBeVisible();await expect(page.locator('.lead-story').getByRole('heading',{name:'Okul kulüpleri yeni döneme hazır'})).toBeVisible();await page.locator('.lead-story').click();await expect(page.getByRole('heading',{name:'Okul kulüpleri yeni döneme hazır'})).toBeVisible();await expect(page.getByText('Öğrencilerin katılabileceği kulüp çalışmaları yeni dönem için programlandı.')).toBeVisible();await page.getByRole('button',{name:'Gündeme dön'}).click();await expect(page.locator('.other-stories')).toBeVisible();
});

test('paid travel updates location and ledger',async({page})=>{
  await createLife(page);await page.locator('.app-grid > button').filter({hasText:'Harita'}).click();await page.getByRole('button',{name:'Okul',exact:true}).click();await page.getByRole('button',{name:'Otobüs'}).click();await page.getByRole('button',{name:'Yola çık'}).click();await expect(page.getByText('Şu an:').locator('..')).toContainText('Okul');await goHome(page);await page.getByRole('button',{name:'CepBanka'}).first().click();await expect(page.getByText(/Okul yolculuğu/)).toBeVisible();
});

test('notification center closes and redesigned apps keep native identities',async({page})=>{
  await createLife(page);await page.getByRole('button',{name:'Bildirim merkezini aç'}).click();await expect(page.getByRole('dialog',{name:'Bildirim merkezi'})).toBeVisible();await page.getByRole('button',{name:'Kapat'}).click();await expect(page.getByRole('dialog',{name:'Bildirim merkezi'})).toHaveCount(0);
  await page.getByRole('button',{name:'CepBanka'}).first().click();await expect(page.locator('[data-app-identity="bank-native"]')).toBeVisible();await goHome(page);await page.getByRole('button',{name:'SarıPazar'}).first().click();await expect(page.locator('[data-app-identity="market-native"]')).toBeVisible();
});

test('save feedback, controlled invalid import and wallpaper simulation time',async({page})=>{
  await createLife(page);await expect(page.locator('.device')).toHaveClass(/tod-morning/);await page.locator('.app-grid > button').filter({hasText:'Ayarlar'}).click();await page.getByRole('button',{name:'Sahil'}).click();await expect(page.locator('.device')).toHaveClass(/wallpaper-coast.*tod-morning|tod-morning.*wallpaper-coast/);await page.getByRole('button',{name:'Sade'}).click();await expect(page.locator('.device')).toHaveClass(/wallpaper-simple/);await page.getByRole('button',{name:'Şehir'}).click();await expect(page.locator('.device')).toHaveClass(/wallpaper-city/);const download=page.waitForEvent('download');await page.getByRole('button',{name:'JSON dışa aktar'}).click();await download;await expect(page.getByRole('status')).toContainText('dışa aktarıldı');
  await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":2,"settings":null}')});await expect(page.getByRole('alert')).toContainText(/doğrulanamadı|geçersiz/);
  await page.getByRole('button',{name:'Hatayı kapat'}).click();await goHome(page);await page.getByRole('button',{name:/Okulum/}).first().click();await page.getByRole('button',{name:/Matematik çalış/}).click();await page.getByRole('button',{name:'2 saat'}).click();await page.getByRole('button',{name:'Çalışmaya başla'}).click();await page.getByRole('button',{name:/Matematik çalış/}).click();await page.getByRole('button',{name:'2 saat'}).click();await page.getByRole('button',{name:'Çalışmaya başla'}).click();await goHome(page);await expect(page.locator('.device')).toHaveClass(/tod-day/);await page.locator('.app-grid > button').filter({hasText:'Ayarlar'}).click();await page.getByRole('button',{name:'Sahil'}).click();await expect(page.locator('.device')).toHaveClass(/wallpaper-coast.*tod-day|tod-day.*wallpaper-coast/);
});

test('native notes preserves notebook navigation',async({page})=>{
  await createLife(page);await page.getByRole('button',{name:'Notlar'}).first().click();await expect(page.locator('[data-app-identity="notes-native"]')).toBeVisible();await page.getByRole('button',{name:'Ana ekrana dön'}).click();await expect(page.locator('.phone-home')).toBeVisible();
});

test('mobile chat thread returns naturally to conversation list',async({page})=>{
  await page.setViewportSize({width:390,height:844});await createLife(page);await page.getByRole('button',{name:'Sohbet'}).first().click();await expect(page.locator('.conversation-list')).toBeVisible();await page.locator('.conversation-list>button').first().click();await expect(page.locator('.conversation')).toBeVisible();await page.getByRole('button',{name:'Konuşmalara dön'}).click();await expect(page.locator('.conversation-list')).toBeVisible();
});

test('mobile chat marks only a conversation whose thread was opened',async({page})=>{
  await page.setViewportSize({width:390,height:844});await createLife(page);await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');const current=useGame.getState(),game=structuredClone(current.game!);game.messages.push({id:'unread-second-conversation',npcId:game.npcs[1].id,at:game.now,text:'Akşam görüşür müyüz?',fromPlayer:false,read:false});useGame.setState({game});await useGame.getState().save()});await expect(page.locator('.phone-dock').getByRole('button',{name:'Sohbet'}).locator('.badge')).toHaveText('2');
  await page.locator('.phone-dock').getByRole('button',{name:'Sohbet'}).click();const rows=page.locator('.conversation-list>button');await expect(page.locator('.conversation-list>button>i')).toHaveCount(2);await expect(rows.nth(0).locator('i')).toHaveText('1');await expect(rows.nth(1).locator('i')).toHaveText('1');
  await rows.nth(0).click();await page.getByRole('button',{name:'Konuşmalara dön'}).click();await expect(rows.nth(0).locator('i')).toHaveCount(0);await expect(rows.nth(1).locator('i')).toHaveText('1');
  await page.reload();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();await expect(page.locator('.phone-dock').getByRole('button',{name:'Sohbet'}).locator('.badge')).toHaveText('1');await page.locator('.phone-dock').getByRole('button',{name:'Sohbet'}).click();await expect(rows.nth(0).locator('i')).toHaveCount(0);await expect(rows.nth(1).locator('i')).toHaveText('1');
});

test('bank remains collision-free at the narrow phone width',async({page})=>{
  await page.setViewportSize({width:320,height:568});await createLife(page);await page.getByRole('button',{name:'CepBanka'}).first().click();await expect(page.locator('[data-app-identity="bank-native"]')).toBeVisible();const overflow=await page.locator('.bank-native-layout').evaluate(el=>el.scrollWidth-el.clientWidth);expect(overflow).toBeLessThanOrEqual(0);
});

test('school study sheet advances authoritative time and persists progress',async({page})=>{
  await createLife(page);const before=await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');return {now:useGame.getState().game!.now,value:useGame.getState().game!.education.knowledge.Matematik}});await page.getByRole('button',{name:/Okulum/}).first().click();await expect(page.locator('.school-masthead p')).toContainText('SINIF · ÖĞRENCİ ALANI');await page.getByRole('button',{name:'Matematik çalış'}).click();await expect(page.getByRole('dialog',{name:'Matematik çalışma planı'})).toContainText(/Mevcut enerji/);await page.getByRole('button',{name:'2 saat'}).click();await page.getByRole('button',{name:'Çalışmaya başla'}).click();const after=await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');return {now:useGame.getState().game!.now,value:useGame.getState().game!.education.knowledge.Matematik}});expect(after.now).not.toBe(before.now);expect(after.value).toBeGreaterThan(before.value);await page.reload();await page.getByRole('button',{name:'Telefonun kilidini aç'}).click();const persisted=await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');return useGame.getState().game!.education.knowledge.Matematik});expect(persisted).toBe(after.value);
});

test('calendar month browsing is view-only and events open on simulation dates',async({page})=>{
  await createLife(page);const now=await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');return useGame.getState().game!.now});await page.getByRole('button',{name:'Takvim'}).first().click();await expect(page.locator('[data-app-identity="calendar-native"]')).toBeVisible();await expect(page.locator('.month-grid button[aria-pressed="true"]')).toHaveAccessibleName(new RegExp(`^${Number(now.slice(8,10))} .* etkinlik$`));const month=await page.locator('.month-navigation h2').innerText();await page.getByRole('button',{name:'Sonraki ay'}).click();await expect(page.locator('.month-navigation h2')).not.toHaveText(month);const unchanged=await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');return useGame.getState().game!.now});expect(unchanged).toBe(now);await page.getByRole('button',{name:'Bugüne dön'}).click();await page.getByRole('button',{name:'Ajanda'}).click();await page.getByText('Matematik sınavı').click();await expect(page.getByRole('heading',{name:'Matematik sınavı'})).toBeVisible();await page.getByRole('button',{name:'Okulum’u aç'}).click();await expect(page.locator('[data-app-identity="school-native"]')).toBeVisible();
});

test('career view clears ordinary unread but preserves actionable unread',async({page})=>{
  await createLife(page);await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');const game=structuredClone(useGame.getState().game!);game.applications=[{id:'app-job-0',jobId:'job-0',state:'viewed',updatedAt:game.now,statusUnread:true}];useGame.setState({game});});await expect(page.locator('.app-grid').getByRole('button',{name:/Kariyer/}).locator('.badge')).toHaveText('1');await page.locator('.app-grid').getByRole('button',{name:/Kariyer/}).click();await page.getByRole('button',{name:'Ana ekrana dön'}).click();await expect(page.locator('.app-grid').getByRole('button',{name:/Kariyer/}).locator('.badge')).toHaveCount(0);
  await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');const game=structuredClone(useGame.getState().game!);game.applications=[{id:'app-job-0',jobId:'job-0',state:'offer',updatedAt:game.now,statusUnread:true}];useGame.setState({game});});await expect(page.locator('.app-grid').getByRole('button',{name:/Kariyer/}).locator('.badge')).toHaveText('1');await page.locator('.app-grid').getByRole('button',{name:/Kariyer/}).click();await expect(page.getByText('İş teklifi kararını bekliyor.')).toBeVisible();await page.getByRole('button',{name:'Ana ekrana dön'}).click();await expect(page.locator('.app-grid').getByRole('button',{name:/Kariyer/}).locator('.badge')).toHaveText('1');
});

test('school calendar deep link opens the exact exam and is consumed',async({page})=>{
  await createLife(page);const now=await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');return useGame.getState().game!.now});await page.getByRole('button',{name:/Okulum/}).first().click();await page.getByText('Takvimde aç →').click();await expect(page.getByRole('heading',{name:'Matematik sınavı'})).toBeVisible();await expect(page.locator('.event-date-block')).toContainText('03');expect(await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');return useGame.getState().game!.now})).toBe(now);await page.getByRole('button',{name:'Ana ekrana dön'}).click();await page.locator('.app-grid').getByRole('button',{name:/Takvim/}).click();await expect(page.getByRole('heading',{name:'Matematik sınavı'})).toHaveCount(0);await expect(page.locator('.month-grid button[aria-pressed="true"]')).toHaveAccessibleName(/^1 Eylül/);
});

test('career and calendar deep links retain exact application context',async({page})=>{
  await createLife(page);await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');const game=structuredClone(useGame.getState().game!);const at='2026-10-15T10:00:00.000Z';game.applications=[{id:'app-job-0',jobId:'job-0',state:'interview',updatedAt:game.now,interviewAt:at,statusUnread:true}];game.events.push({id:'interview-app-job-0',at,type:'interview',title:'MaviRota Teknoloji görüşmesi',important:true,requiresInput:true,entityIds:['app-job-0'],details:'Kafe hafta sonu yardımcısı görüşmesi'});useGame.setState({game});});await page.locator('.app-grid').getByRole('button',{name:/Kariyer/}).click();await page.getByRole('button',{name:/Takvimde aç/}).click();await expect(page.getByRole('heading',{name:'MaviRota Teknoloji görüşmesi'})).toBeVisible();await expect(page.locator('.event-date-block')).toContainText('15');await page.getByRole('button',{name:'İlgili başvuruyu Kariyer’de aç'}).click();await expect(page.getByRole('heading',{name:'Kafe hafta sonu yardımcısı'})).toBeVisible();await expect(page.getByRole('button',{name:'Görüşme planlandı'})).toBeDisabled();
});

test('employment workplace link selects the employer in map without travelling',async({page})=>{
  await createLife(page);await page.evaluate(async()=>{const{useGame}=await import('/src/store.ts');const game=structuredClone(useGame.getState().game!);game.employment={jobId:'job-0',performance:50,startedAt:game.now,nextPayAt:'2026-10-01T07:00:00.000Z'};useGame.setState({game});});await page.locator('.app-grid').getByRole('button',{name:/Kariyer/}).click();await page.getByRole('button',{name:'İş yerini Harita’da aç'}).click();await expect(page.getByRole('heading',{name:'MaviRota Teknoloji'})).toBeVisible();await expect(page.locator('.map > p')).toHaveText('Şu an: Ev');await expect(page.getByRole('button',{name:'Yola çık'})).toBeEnabled();
});
