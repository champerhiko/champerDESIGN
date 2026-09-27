# Photo Editor

Kişisel kullanım için web tabanlı bir fotoğraf düzenleme uygulaması.

İlk aşama rakip analizi: Canva, VSCO, Lightroom gibi uygulamaların herkese açık sayfalarından UI yapısı, özellik listesi, fiyatlandırma ve filtre/preset bilgileri **ticari olmayan, kişisel referans amacıyla** toplanır. Sitelerin `robots.txt` ve kullanım koşullarına uyun, istekleri seyrek tutun.

## Klasör yapısı

```
photo-editor/
├── scraper/    # Scraping scriptleri (scrape.js)
├── web-app/    # Next.js fotoğraf düzenleme uygulaması (TypeScript, App Router, Tailwind)
├── data/       # Scraper çıktıları (JSON)
├── saved-pages/ # Tarayıcıdan elle kaydedilmiş .html sayfalar (--file= için)
├── package.json
└── README.md
```

## Web uygulaması (web-app)

```bash
cd web-app
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # build'i çalıştırır
```

Kökten de çalıştırılabilir: `npm run dev` / `npm run build` / `npm run start` (web-app'e yönlendirir; önce `web-app` içinde `npm install` gerekir).

**Vercel deploy:** Projeyi Vercel'e bağlarken *Root Directory* olarak `web-app` seç; framework otomatik Next.js olarak algılanır, ek ayar gerekmez.

## Scraper kullanımı

```bash
npm install
```

Script iki modda çalışır (varsayılan: `static`):

| Mod | Yöntem | Ne zaman |
|-----|--------|----------|
| `--mode=static` | `fetch` + Cheerio, sunucudan gelen HTML | Basit tanıtım/fiyat sayfaları; hızlı ve hafif |
| `--mode=dynamic` | Puppeteer (headless Chrome), JS çalıştıktan sonraki HTML | İçeriği JS ile yüklenen uygulama arayüzleri (Canva, Lightroom web vb.) |

Dynamic mod sayfa yüklendikten sonra ~2.5 sn bekler (lazy-load içerik için) ve "Kabul Et", "Accept all" gibi cookie/consent butonlarını tıklamayı dener; bulamazsa devam eder.

```bash
# Statik tanıtım sayfası
npm run scrape -- https://www.vsco.co vsco

# Aynı sayfa, JS render ile
npm run scrape -- https://www.vsco.co vsco --mode=dynamic

# JS ağırlıklı sayfa
npm run scrape -- https://www.canva.com/pricing/ canva --mode=dynamic
```

### Görünür tarayıcı (`--headful`)

Bot doğrulaması isteyen sitelerde (ör. Canva) dynamic mod `--headful` ile çalıştırılabilir: tarayıcı ekranda açılır, doğrulamayı sen tamamlarsın, terminalde Enter'a basınca script consent arama → HTML alma → JSON yazma adımlarıyla devam eder.

```bash
npm run scrape -- https://www.canva.com/pricing/ canva-pricing --mode=dynamic --headful
```

### Kayıtlı HTML dosyası (`--file=`)

Headless/headful erişimin tamamen engellendiği sitelerde (ör. VSCO, Adobe) sayfayı kendi tarayıcında "Farklı Kaydet" ile `saved-pages/` altına `.html` olarak kaydet, sonra dosyadan işle. Site adı verilmezse dosya adı kullanılır; `url` alanı sayfadaki canonical link'ten (yoksa dosya yolundan) alınır.

```bash
npm run scrape -- --file=./saved-pages/vsco.html vsco
```

Çıktı `data/<siteAdı>-<zaman>.json` dosyasına yazılır. Alanlar: `siteName`, `url`, `scrapedAt`, `title`, `description`, `headings`, `navLinks`, `priceMentions`, `bodyText` (otomatik) ve `features`, `pricing`, `uiNotes`, `presetParams` (elle doldurulacak notlar).
