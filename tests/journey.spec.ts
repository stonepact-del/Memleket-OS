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

test('new life, phone action, time, notification and reload',async({page})=>{
  await createLife(page);
  await page.getByRole('button',{name:/Okulum/}).first().click();
  await page.getByRole('button',{name:'2 saat'}).click();
  await page.getByRole('button',{name:'2 saat çalış'}).first().click();
  if(await page.getByRole('button',{name:'Ana ekrana dön'}).isVisible()) await page.getByRole('button',{name:'Ana ekrana dön'}).click(); else await page.getByRole('button',{name:'Ana Ekran',exact:true}).click();
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
