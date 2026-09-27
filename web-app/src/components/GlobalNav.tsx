"use client";

import type { ReactNode } from "react";

export type NavPage = "create" | "projects" | "ai";

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    {d}
  </svg>
);

const ITEMS: { id: NavPage; label: string; icon: ReactNode }[] = [
  { id: "create", label: "Oluştur", icon: icon(<path d="M12 5v14M5 12h14" />) },
  {
    id: "projects",
    label: "Projelerim",
    icon: icon(
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>,
    ),
  },
  {
    id: "ai",
    label: "ChamperAI",
    icon: icon(<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />),
  },
];

// Canva tarzı dış şerit: masaüstünde en solda sabit, mobilde altta
export default function GlobalNav({ active, onNavigate }: { active: NavPage | null; onNavigate: (p: NavPage) => void }) {
  return (
    <nav className="order-2 flex shrink-0 justify-around gap-1 border-t border-line bg-background px-2 py-1.5 lg:order-1 lg:w-[84px] lg:flex-col lg:justify-start lg:gap-2 lg:border-t-0 lg:border-r lg:px-2 lg:py-4">
      {ITEMS.map((item) => {
        const on = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={on ? "page" : undefined}
            className={`group flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-colors lg:flex-none ${
              on ? "text-accent" : "text-neutral-400 hover:text-foreground"
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all group-active:scale-90 ${
                on
                  ? "bg-accent text-accent-ink shadow-[0_0_16px_-4px_#ffbd59]"
                  : "bg-surface-2 group-hover:bg-surface-3"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
