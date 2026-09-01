import { expect, test } from '@playwright/test';

async function createLife(page:import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button',{name:'Yeni Hayat'}).click();
  await page.getByLabel('Karakter adı').fill('Deniz Kaya');
  await page.getByRole('button',{name:'Hayatı başlat'}).click();
  await expect(page.getByText('Telefonu aç')).toBeVisible();
  await page.getByRole('button',{name:'Telefonu aç'}).click();
  await expect(page.locator('.phone-home')).toBeVisible();
}
async function goHome(page:import('@playwright/test').Page){const back=page.getByRole('button',{name:'Ana ekrana dön'});if(await back.isVisible())await back.click();else await page.getByRole('button',{name:'Ana Ekran',exact:true}).click();}

test('new life, phone action, time, notification and reload',async({page})=>{
  await createLife(page);
  await page.getByRole('button',{name:/Okulum/}).first().click();
  await page.getByRole('button',{name:'2 saat'}).click();
  await page.getByRole('button',{name:'2 saat çalış'}).first().click();
  if(await page.getByRole('button',{name:'Ana ekrana dön'}).isVisible()) await goHome(page); else await page.getByRole('button',{name:'Ana Ekran',exact:true}).click();
  await page.getByRole('button',{name:'Akışı yönet'}).click();
  await expect(page.getByRole('dialog',{name:'Zaman akışı'})).toBeVisible();
  await page.getByRole('button',{name:/4 gün/}).click();
  await page.getByRole('button',{name:'Bildirim merkezini aç'}).click();
  await expect(page.getByText('Sınav sonucu')).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'Telefonu aç'}).click();
  await expect(page.locator('.phone-home')).toBeVisible();
});

test('main menu contains no broken settings route',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Yeni Hayat'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Hayatlarım'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Ayarlar'})).toHaveCount(0);
});

for(const viewport of [{width:320,height:568},{width:360,height:800},{width:390,height:844},{width:430,height:932},{width:768,height:1024},{width:1440,height:900}]){
  test(`phone shell has no horizontal overflow at ${viewport.width}x${viewport.height}`,async({page})=>{
    await page.setViewportSize(viewport);
    await createLife(page);
    const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
    await expect(page.locator('.app-grid')).toBeVisible();
    if(viewport.width<900){await expect(page.locator('.phone-dock')).toBeVisible();expect(await page.locator('.phone-dock').evaluate(el=>getComputedStyle(el).position)).toBe('fixed');}else await expect(page.locator('.phone-dock')).toBeHidden();
    await expect(page.locator('.timebar')).toHaveCount(0);
  });
}

test('chat reply and read state persist',async({page})=>{
  await createLife(page);await page.getByRole('button',{name:'Sohbet'}).first().click();
  await expect(page.getByText('Günaydın, okul çıkışı haber ver olur mu?')).toBeVisible();
  await page.getByLabel('Mesaj').fill('Yarınki matematik sınavından korkuyorum');await page.locator('.chat-layout form button').click();
  await expect(page.getByText(/Kaygılanman normal|Hazırlığına güven/)).toBeVisible();
  await page.reload();await page.getByRole('button',{name:'Telefonu aç'}).click();await page.getByRole('button',{name:'Sohbet'}).first().click();
  await expect(page.getByText('Yarınki matematik sınavından korkuyorum')).toBeVisible();
});

test('marketplace inline offer, inspection and purchase persist',async({page})=>{
  await createLife(page);await page.getByRole('button',{name:'SarıPazar'}).first().click();await page.getByRole('button',{name:'Elektronik'}).click();const beforeTitles=await page.getByText('Çalışma masası',{exact:true}).count();await page.getByRole('button',{name:'İlanı aç'}).first().click();
  const title=await page.locator('.content h1').innerText();await page.getByRole('button',{name:'İncele'}).click();await expect(page.getByText(/Belirgin sorun görülmedi|Yakında bakım|Yapılmadı/)).toBeVisible();
  await page.getByLabel('Teklif (TL)').fill('1000');await page.getByRole('button',{name:'Teklif gönder'}).click();await expect(page.getByRole('button',{name:'Anlaşılan fiyata satın al'})).toBeVisible();
  await page.getByRole('button',{name:/fiyata satın al/}).click();await page.reload();await page.getByRole('button',{name:'Telefonu aç'}).click();await page.getByRole('button',{name:'SarıPazar'}).first().click();await page.getByRole('button',{name:'Elektronik'}).click();await expect(page.getByText(title,{exact:true})).toHaveCount(beforeTitles-1);
});

test('career interview, offer and first employment loop',async({page})=>{
  await createLife(page);await page.locator('.app-grid > button').filter({hasText:'Kariyer'}).click();await page.getByRole('button',{name:'Başvur'}).first().click();await goHome(page);
  await page.getByRole('button',{name:'Akışı yönet'}).click();await page.getByRole('button',{name:/4 gün/}).click();await page.locator('.app-grid > button').filter({hasText:'Takvim'}).click();await page.getByText(/görüşmesi/).click();await page.getByRole('button',{name:'Hazırlığını örneklerle anlat'}).click();
  await goHome(page);await page.getByRole('button',{name:'Akışı yönet'}).click();await page.getByRole('button',{name:/4 gün/}).click();await page.locator('.app-grid > button').filter({hasText:'Kariyer'}).click();await page.getByRole('button',{name:'Teklifi kabul et'}).click();
  await goHome(page);await page.locator('.app-grid > button').filter({hasText:'Harita'}).click();await expect(page.getByText('Kafe')).toBeVisible();
});

test('feed reactions and comments persist',async({page})=>{
  await createLife(page);await page.locator('.app-grid > button').filter({hasText:'Akış'}).click();await page.getByRole('button',{name:'Beğen'}).first().click();await page.getByText(/yorum/).first().click();await page.getByLabel('Yorum').fill('Kolay gelsin!');await page.getByRole('button',{name:'Yaz'}).click();await page.reload();await page.getByRole('button',{name:'Telefonu aç'}).click();await page.locator('.app-grid > button').filter({hasText:'Akış'}).click();await page.getByText(/yorum/).first().click();await expect(page.getByText('Kolay gelsin!')).toBeVisible();await expect(page.getByRole('button',{name:'Beğeniyi kaldır'})).toBeVisible();
});

test('paid travel updates location and ledger',async({page})=>{
  await createLife(page);await page.locator('.app-grid > button').filter({hasText:'Harita'}).click();await page.getByRole('button',{name:'Okul',exact:true}).click();await page.getByRole('button',{name:'Otobüs'}).click();await page.getByRole('button',{name:'Yola çık'}).click();await expect(page.getByText('Şu an:').locator('..')).toContainText('Okul');await goHome(page);await page.getByRole('button',{name:'CepBanka'}).first().click();await expect(page.getByText(/Okul yolculuğu/)).toBeVisible();
});

test('save feedback, controlled invalid import and wallpaper simulation time',async({page})=>{
  await createLife(page);await expect(page.locator('.device')).toHaveClass(/tod-morning/);await page.locator('.app-grid > button').filter({hasText:'Ayarlar'}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'JSON dışa aktar'}).click();await download;await expect(page.getByRole('status')).toContainText('dışa aktarıldı');
  await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":2,"settings":null}')});await expect(page.getByRole('alert')).toContainText(/doğrulanamadı|geçersiz/);
  await goHome(page);await page.getByRole('button',{name:/Okulum/}).first().click();await page.getByRole('button',{name:'2 saat'}).click();await page.getByRole('button',{name:'2 saat çalış'}).first().click();await page.getByRole('button',{name:'2 saat çalış'}).first().click();await goHome(page);await expect(page.locator('.device')).toHaveClass(/tod-day/);
});
