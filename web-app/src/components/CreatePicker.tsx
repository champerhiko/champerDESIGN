"use client";

import { useState, type ReactNode } from "react";
import Header from "@/components/Header";

type Platform = "instagram" | "x" | "tiktok" | "youtube";

export type Format = { name: string; ratio: string; w: number; h: number; platform?: Platform };

type Category = "social" | "doc" | "custom";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "social", label: "Sosyal Medya" },
  { id: "doc", label: "Belge" },
  { id: "custom", label: "Özel Boyut" },
];

// Platform çipleri ve kart rozetleri: platformun kendi rengi + ikonu
const PLATFORMS: { id: Platform; label: string; bg: string; icon: ReactNode }[] = [
  {
    id: "instagram",
    label: "Instagram",
    bg: "bg-[linear-gradient(45deg,#feda75,#fa7e1e_25%,#d62976_50%,#962fbf_75%,#4f5bd5)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-1/2 w-1/2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "x",
    label: "X",
    bg: "bg-black ring-1 ring-white/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2">
        <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L2 3h6.3l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    label: "TikTok",
    bg: "bg-black ring-1 ring-white/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2 [filter:drop-shadow(-1.5px_-1px_0_#25f4ee)_drop-shadow(1.5px_1px_0_#fe2c55)]">
        <path d="M16.6 3c.4 2.3 1.9 3.8 4.2 4v3.1a7.6 7.6 0 0 1-4.1-1.3v6.3A6 6 0 1 1 10.6 9v3.2a2.9 2.9 0 1 0 2.9 2.9V3z" />
      </svg>
    ),
  },
  {
    id: "youtube",
    label: "YouTube",
    bg: "bg-[#ff0000]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2">
        <path d="M8 5.5v13l11-6.5z" />
      </svg>
    ),
  },
];

const SOCIAL: Format[] = [
  { platform: "instagram", name: "Gönderi", ratio: "1:1", w: 1080, h: 1080 },
  { platform: "instagram", name: "Dikey Gönderi", ratio: "4:5", w: 1080, h: 1350 },
  { platform: "instagram", name: "Story/Reels", ratio: "9:16", w: 1080, h: 1920 },
  { platform: "instagram", name: "Profil Fotoğrafı", ratio: "1:1", w: 320, h: 320 },
  { platform: "x", name: "Gönderi Görseli", ratio: "16:9", w: 1600, h: 900 },
  { platform: "x", name: "Kapak/Header", ratio: "3:1", w: 1500, h: 500 },
  { platform: "x", name: "Profil Fotoğrafı", ratio: "1:1", w: 400, h: 400 },
  { platform: "tiktok", name: "Video Kapağı", ratio: "9:16", w: 1080, h: 1920 },
  { platform: "tiktok", name: "Profil Fotoğrafı", ratio: "1:1", w: 200, h: 200 },
  { platform: "youtube", name: "Küçük Resim/Thumbnail", ratio: "16:9", w: 1280, h: 720 },
  { platform: "youtube", name: "Kanal Banner'ı", ratio: "16:9", w: 2560, h: 1440 },
  { platform: "youtube", name: "Profil Fotoğrafı", ratio: "1:1", w: 800, h: 800 },
];

// 300 DPI
const DOCS: Format[] = [
  { name: "A4 Dikey", ratio: "A4", w: 2480, h: 3508 },
  { name: "A4 Yatay", ratio: "A4", w: 3508, h: 2480 },
  { name: "A3 Dikey", ratio: "A3", w: 3508, h: 4961 },
  { name: "A3 Yatay", ratio: "A3", w: 4961, h: 3508 },
];

const ALL = [...SOCIAL, ...DOCS];

// Özel boyut birimleri: 300 DPI baz alınarak piksele çevrilir
const UNITS = { px: { label: "Piksel", f: 1 }, in: { label: "İnç", f: 300 }, cm: { label: "Cm", f: 118.11 }, mm: { label: "Mm", f: 11.811 } };
type Unit = keyof typeof UNITS;
const MAX_PX = 10000;

const platformOf = (f: Format) => PLATFORMS.find((p) => p.id === f.platform);

function PlatformIcon({ p, size }: { p: (typeof PLATFORMS)[number]; size: string }) {
  return <span className={`flex shrink-0 items-center justify-center rounded-full text-white ${p.bg} ${size}`}>{p.icon}</span>;
}

// Canva'daki "Tasarım oluştur" benzeri: kategori + boyut seçimi, sonra fotoğraf yükleme
export default function CreatePicker({ onPick }: { onPick: (f: Format) => void }) {
  const [category, setCategory] = useState<Category>("social");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [query, setQuery] = useState("");
  const [w, setW] = useState("1200");
  const [h, setH] = useState("800");
  const [unit, setUnit] = useState<Unit>("px");

  const q = query.trim().toLocaleLowerCase("tr");
  const matches = (f: Format) => `${platformOf(f)?.label ?? ""} ${f.name}`.toLocaleLowerCase("tr").includes(q);
  const cards = q
    ? ALL.filter(matches)
    : category === "custom"
      ? null
      : category === "doc"
        ? DOCS
        : SOCIAL.filter((f) => !platform || f.platform === platform);

  const cw = Math.round(Number(w) * UNITS[unit].f);
  const ch = Math.round(Number(h) * UNITS[unit].f);
  const customValid = cw >= 1 && ch >= 1 && cw <= MAX_PX && ch <= MAX_PX;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tasarım oluştur</h1>
        <label htmlFor="format-search" className="sr-only">
          Ne oluşturmak istiyorsun?
        </label>
        <input
          id="format-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ne oluşturmak istiyorsun?"
          className="mt-5 w-full rounded-xl border border-line bg-surface-1 px-4 py-3 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
        />

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <nav className="flex shrink-0 gap-2 overflow-x-auto md:w-48 md:flex-col">
            {CATEGORIES.map((c) => {
              const on = !q && c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    setQuery("");
                  }}
                  className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    on ? "bg-accent text-accent-ink" : "text-neutral-300 hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </nav>

          <section className="min-w-0 flex-1">
            {!q && category === "social" && (
              <div className="mb-5 flex gap-4 overflow-x-auto pb-1">
                {[{ id: null, label: "Hepsi" } as const, ...PLATFORMS].map((p) => {
                  const on = platform === p.id;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      aria-pressed={on}
                      className={`group flex w-16 shrink-0 flex-col items-center gap-1.5 text-xs font-medium transition-colors ${
                        on ? "text-foreground" : "text-neutral-400 hover:text-foreground"
                      }`}
                    >
                      <span className={`rounded-full p-0.5 ring-2 transition-all ${on ? "ring-accent" : "ring-transparent group-hover:ring-line"}`}>
                        {"bg" in p ? (
                          <PlatformIcon p={p} size="h-12 w-12" />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 text-accent">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
                              <rect x="3" y="3" width="7" height="7" rx="1.5" />
                              <rect x="14" y="3" width="7" height="7" rx="1.5" />
                              <rect x="3" y="14" width="7" height="7" rx="1.5" />
                              <rect x="14" y="14" width="7" height="7" rx="1.5" />
                            </svg>
                          </span>
                        )}
                      </span>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}

            {cards === null ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customValid) onPick({ name: "Özel Boyut", ratio: `${cw}×${ch}`, w: cw, h: ch });
                }}
                className="animate-fade-up max-w-md rounded-2xl border border-line bg-surface-1 p-5"
              >
                <p className="font-medium">Özel boyut</p>
                <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-3">
                  {[
                    { id: "cw", label: "Genişlik", value: w, set: setW },
                    { id: "ch", label: "Yükseklik", value: h, set: setH },
                  ].map((f) => (
                    <label key={f.id} className="flex min-w-0 flex-col gap-1 text-xs text-neutral-400">
                      {f.label}
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        className="min-w-0 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-neutral-500"
                      />
                    </label>
                  ))}
                  <label className="flex flex-col gap-1 text-xs text-neutral-400">
                    Birim
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as Unit)}
                      className="rounded-lg border border-line bg-surface-2 px-2 py-2 text-sm text-foreground outline-none focus:border-neutral-500"
                    >
                      {(Object.keys(UNITS) as Unit[]).map((u) => (
                        <option key={u} value={u}>
                          {UNITS[u].label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  {customValid
                    ? unit === "px"
                      ? `${cw}×${ch} px`
                      : `${cw}×${ch} px (300 DPI)`
                    : `Her kenar 1–${MAX_PX} px arasında olmalı.`}
                </p>
                <button
                  type="submit"
                  disabled={!customValid}
                  className="mt-4 w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-all hover:bg-accent-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Oluştur
                </button>
              </form>
            ) : cards.length === 0 ? (
              <p className="text-sm text-neutral-400">&ldquo;{query.trim()}&rdquo; ile eşleşen bir boyut bulunamadı.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {cards.map((f) => {
                  const p = platformOf(f);
                  return (
                    <button
                      key={`${f.platform ?? "doc"}-${f.name}`}
                      type="button"
                      onClick={() => onPick(f)}
                      className="group animate-fade-up flex flex-col gap-3 rounded-xl border border-line bg-surface-1 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 active:scale-95"
                    >
                      <div className="relative flex aspect-square items-center justify-center rounded-lg bg-surface-2">
                        {p && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 py-0.5 pr-2 pl-0.5 text-[10px] font-semibold text-white">
                            <PlatformIcon p={p} size="h-4 w-4" />
                            {p.label}
                          </span>
                        )}
                        <div
                          className="flex items-center justify-center rounded-md border-2 border-accent/70 bg-accent/10 text-xs font-semibold text-accent"
                          style={f.w >= f.h ? { width: "70%", aspectRatio: `${f.w} / ${f.h}` } : { height: "70%", aspectRatio: `${f.w} / ${f.h}` }}
                        >
                          {f.ratio}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p ? `${p.label} ${f.name}` : f.name}</p>
                        <p className="text-xs text-neutral-500">
                          {f.w}×{f.h} px
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
