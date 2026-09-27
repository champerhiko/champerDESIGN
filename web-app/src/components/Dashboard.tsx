"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { deleteProject, listProjects, type Project } from "@/lib/projects";

type Props = {
  onOpen: (id: string) => void;
  onNew: (file: File | null) => void;
};

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

export default function Dashboard({ onOpen, onNew }: Props) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listProjects().then(setProjects, () => setProjects([]));
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", close);
    };
  }, [menu]);

  async function remove(id: string) {
    setMenu(null);
    await deleteProject(id);
    setProjects((ps) => ps?.filter((p) => p.id !== id) ?? null);
  }

  const uploadButton = (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink shadow-lg shadow-accent/10 transition-all hover:bg-accent-hover active:scale-95"
    >
      Fotoğraf yükle
    </button>
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background text-foreground">
      <Header />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file?.type.startsWith("image/")) onNew(file);
        }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <section className="animate-fade-up mb-10 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface-2 via-surface-1 to-[#2a1f10] p-6 shadow-xl sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bugün ne tasarlıyoruz?</h1>
          <p className="mt-2 max-w-md text-sm text-neutral-400">
            Bir fotoğraf yükle, ayarla, filtre uygula. Projelerin bu tarayıcıda otomatik kaydedilir.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {uploadButton}
            <button
              type="button"
              onClick={() => onNew(null)}
              className="rounded-lg border border-line bg-surface-3 px-4 py-2 text-sm font-medium transition-all hover:border-accent/60 hover:bg-surface-2 active:scale-95"
            >
              + Yeni proje
            </button>
          </div>
        </section>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">Projelerin</h2>

        {projects === null ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="animate-fade-up flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-line px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-3xl">🖼️</div>
            <div>
              <p className="font-medium">Henüz bir projen yok</p>
              <p className="mt-1 text-sm text-neutral-400">İlk fotoğrafını yükle, düzenlemeye başla.</p>
            </div>
            {uploadButton}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {projects.map((p, i) => (
              <div
                key={p.id}
                style={{ animationDelay: `${i * 30}ms` }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ id: p.id, x: e.clientX, y: e.clientY });
                }}
                className="animate-fade-up group relative overflow-hidden rounded-xl border border-line bg-surface-2 shadow-md transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-black/40"
              >
                <button type="button" onClick={() => onOpen(p.id)} className="block w-full text-left">
                  <div className="aspect-[4/3] overflow-hidden bg-surface-1">
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URL, optimizasyon gereksiz */}
                    <img
                      src={p.thumbnail}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 pr-10">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{dateFmt.format(p.updatedAt)}</p>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label="Proje menüsü"
                  onClick={(e) => {
                    e.stopPropagation();
                    const r = e.currentTarget.getBoundingClientRect();
                    setMenu({ id: p.id, x: r.right - 140, y: r.bottom + 4 });
                  }}
                  className="absolute right-2 bottom-3 flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-surface-3 hover:text-foreground"
                >
                  ⋯
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {menu && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          style={{ left: Math.max(8, Math.min(menu.x, window.innerWidth - 148)), top: menu.y }}
          className="animate-fade-up fixed z-50 w-36 overflow-hidden rounded-lg border border-line bg-surface-3 p-1 shadow-2xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => onOpen(menu.id)}
            className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2"
          >
            Aç
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => remove(menu.id)}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
          >
            Sil
          </button>
        </div>
      )}
    </div>
  );
}
