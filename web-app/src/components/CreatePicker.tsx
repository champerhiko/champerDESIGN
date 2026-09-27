"use client";

import { useState } from "react";
import Header from "@/components/Header";

export type Format = { name: string; ratio: string; w: number; h: number };

type Category = "social" | "doc" | "custom";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "social", label: "Sosyal Medya" },
  { id: "doc", label: "Belge" },
  { id: "custom", label: "Özel Boyut" },
];

const FORMATS: Record<Exclude<Category, "custom">, Format[]> = {
  social: [
    { name: "Instagram Gönderisi", ratio: "1:1", w: 1080, h: 1080 },
    { name: "Instagram Story", ratio: "9:16", w: 1080, h: 1920 },
    { name: "Profil Fotoğrafı", ratio: "1:1", w: 400, h: 400 },
    { name: "Kapak/Banner Fotoğrafı", ratio: "16:9", w: 1920, h: 1080 },
  ],
  doc: [
    { name: "A4 Dikey", ratio: "A4", w: 2480, h: 3508 },
    { name: "A4 Yatay", ratio: "A4", w: 3508, h: 2480 },
  ],
};

const ALL = [...FORMATS.social, ...FORMATS.doc];

// Canva'daki "Tasarım oluştur" benzeri: kategori + boyut seçimi, sonra fotoğraf yükleme
export default function CreatePicker({ onPick }: { onPick: (f: Format) => void }) {
  const [category, setCategory] = useState<Category>("social");
  const [query, setQuery] = useState("");
  const [w, setW] = useState("1200");
  const [h, setH] = useState("800");

  const q = query.trim().toLocaleLowerCase("tr");
  const cards = q ? ALL.filter((f) => f.name.toLocaleLowerCase("tr").includes(q)) : category === "custom" ? null : FORMATS[category];
  const cw = Number(w);
  const ch = Number(h);
  const customValid = Number.isInteger(cw) && Number.isInteger(ch) && cw > 0 && ch > 0 && cw <= 10000 && ch <= 10000;

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
            {cards === null ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customValid) onPick({ name: "Özel Boyut", ratio: `${cw}×${ch}`, w: cw, h: ch });
                }}
                className="animate-fade-up max-w-sm rounded-2xl border border-line bg-surface-1 p-5"
              >
                <p className="font-medium">Özel boyut</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { id: "cw", label: "Genişlik (px)", value: w, set: setW },
                    { id: "ch", label: "Yükseklik (px)", value: h, set: setH },
                  ].map((f) => (
                    <label key={f.id} className="flex flex-col gap-1 text-xs text-neutral-400">
                      {f.label}
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-neutral-500"
                      />
                    </label>
                  ))}
                </div>
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
                {cards.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => onPick(f)}
                    className="group animate-fade-up flex flex-col gap-3 rounded-xl border border-line bg-surface-1 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 active:scale-95"
                  >
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-surface-2">
                      <div
                        className="flex items-center justify-center rounded-md border-2 border-accent/70 bg-accent/10 text-xs font-semibold text-accent"
                        style={f.w >= f.h ? { width: "70%", aspectRatio: `${f.w} / ${f.h}` } : { height: "70%", aspectRatio: `${f.w} / ${f.h}` }}
                      >
                        {f.ratio}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{f.name}</p>
                      <p className="text-xs text-neutral-500">
                        {f.w}×{f.h} px
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
