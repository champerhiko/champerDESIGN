"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/projects";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

type Props = {
  projects: Project[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

// Proje kartları + sağ tık / ⋯ menüsü (Ana Sayfa ve Projelerim ortak kullanır)
export default function ProjectGrid({ projects, onOpen, onDelete }: Props) {
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);

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

  return (
    <>
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
            onClick={() => {
              setMenu(null);
              onDelete(menu.id);
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
          >
            Sil
          </button>
        </div>
      )}
    </>
  );
}
