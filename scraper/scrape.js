// Kullanım: npm run scrape -- <url> [siteAdı] [--mode=static|dynamic] [--headful]
//           npm run scrape -- --file=<kayıtlı.html> [siteAdı]
import { readFile, writeFile } from 'node:fs/promises';
import readline from 'node:readline/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const USER_AGENT = 'personal-research-bot/0.1';
const CONSENT_TEXTS = ['kabul et', 'tümünü kabul et', 'accept', 'accept all', 'allow all', 'i agree', 'agree', 'got it', 'ok'];

const args = process.argv.slice(2);
const mode = (args.find((a) => a.startsWith('--mode='))?.split('=')[1]) ?? 'static';
const headful = args.includes('--headful');
const filePath = args.find((a) => a.startsWith('--file='))?.slice('--file='.length);
const positional = args.filter((a) => !a.startsWith('--'));
const [url, siteArg] = filePath ? [null, positional[0]] : positional;
if ((!url && !filePath) || !['static', 'dynamic'].includes(mode)) {
  console.error('Kullanım: npm run scrape -- <url> [siteAdı] [--mode=static|dynamic] [--headful]');
  console.error('          npm run scrape -- --file=<kayıtlı.html> [siteAdı]');
  process.exit(1);
}

async function fetchStatic(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`İstek başarısız: ${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchDynamic(url) {
  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({ headless: !headful });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2500)); // lazy-load içerik için

    if (headful) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      await rl.question("Doğrulamayı tamamladıysan Enter'a bas ");
      rl.close();
    }

    const clicked = await page.evaluate((texts) => {
      const buttons = [...document.querySelectorAll('button, [role="button"], a')];
      const btn = buttons.find((b) => texts.includes(b.innerText?.trim().toLowerCase()));
      if (btn) { btn.click(); return btn.innerText.trim(); }
      return null;
    }, CONSENT_TEXTS).catch(() => null);
    if (clicked) {
      console.log(`Consent butonuna tıklandı: "${clicked}"`);
      await new Promise((r) => setTimeout(r, 1000));
    }

    return await page.content();
  } finally {
    await browser.close();
  }
}

const html = filePath
  ? await readFile(filePath, 'utf8')
  : mode === 'dynamic' ? await fetchDynamic(url) : await fetchStatic(url);
const $ = cheerio.load(html);
$('script, style, noscript, svg, iframe').remove();

const clean = (s) => s.replace(/\s+/g, ' ').trim();
const texts = (sel) => $(sel).map((_, el) => clean($(el).text())).get().filter(Boolean);

const siteName = siteArg
  || (filePath ? path.basename(filePath, path.extname(filePath)) : new URL(url).hostname.replace(/^www\./, ''));
const result = {
  siteName,
  // Dosya modunda kayıtlı sayfanın canonical URL'i, yoksa dosya yolu
  url: url ?? $('link[rel="canonical"]').attr('href') ?? path.resolve(filePath),
  scrapedAt: new Date().toISOString(),
  title: clean($('title').text()),
  description: $('meta[name="description"]').attr('content') ?? '',
  headings: texts('h1, h2, h3'),
  navLinks: texts('nav a'),
  priceMentions: [...new Set(clean($('body').text()).match(/[$€₺£]\s?\d+(?:[.,]\d{2})?/g) ?? [])],
  // Elle doldurulacak analiz alanları
  features: [],
  pricing: [],
  uiNotes: [],
  presetParams: [],
  bodyText: clean($('body').text()),
};

const file = path.join(DATA_DIR, `${siteName.replace(/[^\w.-]/g, '_')}-${Date.now()}.json`);
await writeFile(file, JSON.stringify(result, null, 2), 'utf8');
console.log(`Kaydedildi (${filePath ? 'file' : mode}): ${file}`);
