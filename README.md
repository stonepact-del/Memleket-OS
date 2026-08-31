# MemleketOS

MemleketOS, Türkiye'de tek bir kişinin eğitimden çalışma hayatına uzanan yaşamını anlatan, Türkçe ve yerel-öncelikli bir web/PWA simülasyonudur.

## Çalıştırma

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
```

Oyun React/Vite arayüzü kullanır; saf TypeScript simülasyonu React, DOM ve depolama API'lerinden bağımsızdır. Kayıtlar sürümlü `SaveRepository` arayüzünün web uygulamasında Dexie/IndexedDB uygulamasıyla tutulur. Servis çalışanı yalnız uygulama kabuğunu önbellekler; kayıtlar önbellekten bağımsızdır.

## Gizlilik ve platform

Hesap, sunucu, analitik, reklam, izleme, gerçek konum veya oyun verisi yüklemesi yoktur. Kurulabilir PWA çevrimdışı çalışır. Gelecekte Capacitor adaptörü, simülasyonu değiştirmeden aynı repository ve platform sınırlarına eklenebilir.
