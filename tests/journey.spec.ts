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
  await page.getByRole('button',{name:'2 saat çalış'}).first().click();
  if(await page.getByRole('button',{name:'Ana ekrana dön'}).isVisible()) await page.getByRole('button',{name:'Ana ekrana dön'}).click(); else await page.getByRole('button',{name:'Ana Ekran',exact:true}).click();
  await page.getByRole('button',{name:'+4 gün'}).click();
  await page.getByRole('button',{name:'Bildirim merkezini aç'}).click();
  await expect(page.getByText('Sınav sonucu')).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'Telefonu aç'}).click();
  await expect(page.locator('.phone-home')).toBeVisible();
});

for(const viewport of [{width:320,height:568},{width:360,height:800},{width:390,height:844},{width:430,height:932},{width:768,height:1024},{width:1440,height:900}]){
  test(`phone shell has no horizontal overflow at ${viewport.width}x${viewport.height}`,async({page})=>{
    await page.setViewportSize(viewport);
    await createLife(page);
    const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
    await expect(page.locator('.app-grid')).toBeVisible();
    if(viewport.width<900) await expect(page.locator('.phone-dock')).toBeVisible(); else await expect(page.locator('.phone-dock')).toBeHidden();
  });
}
