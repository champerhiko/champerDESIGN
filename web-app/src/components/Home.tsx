"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProjectGrid from "@/components/ProjectGrid";
import { NAV_ITEMS, type NavPage } from "@/components/GlobalNav";
import { deleteProject, listProjects, type Project } from "@/lib/projects";

const RECENT_LIMIT = 12;
// Ana Sayfa kısayolları: dış şeritteki öğeler (Ana Sayfa hariç)
const SHORTCUTS = NAV_ITEMS.filter((i) => i.id !== "home");

type Props = {
  onNavigate: (p: NavPage) => void;
  onOpen: (id: string) => void;
};

export default function Home({ onNavigate, onOpen }: Props) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listProjects().then(setProjects, () => setProjects([]));
  }, []);

  async function remove(id: string) {
    await deleteProject(id);
    setProjects((ps) => ps?.filter((p) => p.id !== id) ?? null);
  }

  // Arama varken tüm projelerde ara; yoksa en son düzenlenen 12 proje (listProjects zaten yeniden eskiye sıralı)
  const q = query.trim().toLocaleLowerCase("tr");
  const shown = projects
    ? q
      ? projects.filter((p) => p.name.toLocaleLowerCase("tr").includes(q))
      : projects.slice(0, RECENT_LIMIT)
    : null;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <section className="animate-fade-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4c1d95] via-[#7c3aed] to-[#ffbd59] px-6 py-12 text-center shadow-xl sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#ffffff26,transparent_45%)]" />
          <h1 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Champer Design&apos;a Hoş Geldin
          </h1>
          <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/85 sm:text-base">
            Fotoğraflarını düzenle, filtrelerle oyna ve projelerine kaldığın yerden devam et.
          </p>
        </section>

        <div className="mt-6">
          <label htmlFor="project-search" className="sr-only">
            Projelerinde ara
          </label>
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Projelerinde ara…"
            className="w-full rounded-xl border border-line bg-surface-1 px-4 py-3 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          />
        </div>

        <div className="mt-6 flex gap-4 sm:gap-6">
          {SHORTCUTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onNavigate(s.id)}
              className="group flex w-20 flex-col items-center gap-2 text-xs font-medium text-neutral-300 transition-colors hover:text-foreground"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface-2 text-accent transition-all group-hover:-translate-y-0.5 group-hover:border-accent/50 group-hover:bg-surface-3 group-active:scale-95 [&_svg]:h-6 [&_svg]:w-6">
                {s.icon}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        <h2 className="mt-10 mb-4 text-lg font-semibold tracking-tight">{q ? "Arama sonuçları" : "Son Çalışmalar"}</h2>

        {shown === null ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="animate-fade-up flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-line px-6 py-14 text-center">
            {q ? (
              <p className="text-sm text-neutral-400">&ldquo;{query.trim()}&rdquo; ile eşleşen proje bulunamadı.</p>
            ) : (
              <>
                <p className="font-medium">Henüz bir çalışman yok</p>
                <p className="text-sm text-neutral-400">İlk tasarımına başlamak için Oluştur&apos;a tıkla.</p>
                <button
                  type="button"
                  onClick={() => onNavigate("create")}
                  className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-all hover:bg-accent-hover active:scale-95"
                >
                  Oluştur
                </button>
              </>
            )}
          </div>
        ) : (
          <ProjectGrid projects={shown} onOpen={onOpen} onDelete={remove} />
        )}
      </main>
    </div>
  );
}
