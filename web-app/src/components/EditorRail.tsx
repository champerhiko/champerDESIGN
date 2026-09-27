"use client";

import { useRef, type ReactNode } from "react";

type Item = { id: string; label: string; icon: ReactNode; upload?: boolean };

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    {d}
  </svg>
);

const MAIN: Item[] = [
  { id: "templates", label: "Şablonlar", icon: icon(<path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5a2.5 2.5 0 0 0 0 5H20M8 7h8" />) },
  {
    id: "elements",
    label: "Bileşenler",
    icon: icon(
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>,
    ),
  },
  { id: "text", label: "Metin", icon: icon(<path d="M5 6V4h14v2M12 4v16M9 20h6" />) },
  { id: "uploads", label: "Yüklemeler", upload: true, icon: icon(<path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 9a4 4 0 0 1-1 9M12 12v8M9 15l3-3 3 3" />) },
];

// Canva tarzı editör menüsü (sadece masaüstü). Yüklemeler dosya seçtirir, diğerleri şimdilik "Yakında"
// Açık panel Editor'da tutulur: burada bir panel açılınca iç rayın paneli kapanır (ve tersi)
type Props = { className?: string; onFile: (f: File) => void; openId: string | null; onOpenChange: (id: string | null) => void };

export default function EditorRail({ className = "", onFile, openId, onOpenChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const open = MAIN.find((i) => i.id === openId) ?? null;

  function click(item: Item) {
    if (item.upload) {
      fileRef.current?.click();
    } else {
      onOpenChange(openId === item.id ? null : item.id);
    }
  }

  const button = (item: Item) => {
    const on = open?.id === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => click(item)}
        aria-pressed={on}
        className={`group relative flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
          on ? "text-accent" : "text-neutral-400 hover:text-accent"
        }`}
      >
        <span
          className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-all group-active:scale-90 ${
            on ? "bg-accent text-accent-ink shadow-[0_0_16px_-4px_#ffbd59]" : "group-hover:bg-surface-3"
          }`}
        >
          {item.icon}
        </span>
        {item.label}
      </button>
    );
  };

  return (
    <aside className={`shrink-0 ${className}`}>
      <div className="relative z-20 flex w-[76px] shrink-0 flex-col gap-1 border-r border-line bg-background px-1.5 py-3">
      {MAIN.map(button)}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file?.type.startsWith("image/")) onFile(file);
        }}
      />
      </div>

      {/* Akış içinde: iç rayın paneli kapandığı için yerini alır */}
      {open && (
        <div className="animate-fade-up flex w-72 flex-col border-r border-line bg-surface-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{open.label}</h2>
            <button
              type="button"
              onClick={() => onOpenChange(null)}
              aria-label="Paneli kapat"
              className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-surface-3 hover:text-accent"
            >
              {icon(<path d="M6 6l12 12M18 6 6 18" />)}
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-center">
            <span className="text-accent">{open.icon}</span>
            <p className="text-sm font-medium">Yakında</p>
            <p className="px-6 text-xs text-neutral-500">Bu bölüm henüz hazır değil.</p>
          </div>
        </div>
      )}
    </aside>
  );
}
