"use client";

import { useRef, useState, type ReactNode } from "react";

type Item = { id: string; label: string; icon: ReactNode; locked?: boolean; upload?: boolean };

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
  {
    id: "brand",
    label: "Marka",
    locked: true,
    icon: icon(
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="m8 12 2-3 2 2 2-2 2 3-1 3H9z" />
      </>,
    ),
  },
  { id: "uploads", label: "Yüklemeler", upload: true, icon: icon(<path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 9a4 4 0 0 1-1 9M12 12v8M9 15l3-3 3 3" />) },
  { id: "tools", label: "Araçlar", icon: icon(<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />) },
  { id: "projects", label: "Projeler", icon: icon(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />) },
  {
    id: "apps",
    label: "Uygulamalar",
    icon: icon(
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <path d="M17.5 14v7M14 17.5h7" />
      </>,
    ),
  },
];

const BOTTOM: Item[] = [
  {
    id: "settings",
    label: "Bileşenler",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </>,
    ),
  },
  {
    id: "photo",
    label: "Fotoğraf",
    upload: true,
    icon: icon(
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
      </>,
    ),
  },
];

// Canva tarzı editör menüsü (sadece masaüstü). Fotoğraf/Yüklemeler dosya seçtirir, diğerleri şimdilik "Yakında"
// Açık panel Editor'da tutulur: burada bir panel açılınca iç rayın paneli kapanır (ve tersi)
type Props = { className?: string; onFile: (f: File) => void; openId: string | null; onOpenChange: (id: string | null) => void };

export default function EditorRail({ className = "", onFile, openId, onOpenChange }: Props) {
  const [tip, setTip] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const open = [...MAIN, ...BOTTOM].find((i) => i.id === openId) ?? null;

  function click(item: Item) {
    if (item.upload) {
      fileRef.current?.click();
    } else if (item.locked) {
      setTip(item.id);
      setTimeout(() => setTip((t) => (t === item.id ? null : t)), 1500);
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
          {item.locked && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-ink">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                <path d="M3 18 2 7l5.5 4L12 4l4.5 7L22 7l-1 11z" />
              </svg>
            </span>
          )}
        </span>
        {item.label}
        {tip === item.id && (
          <span role="status" className="absolute top-1/2 left-full z-30 ml-2 -translate-y-1/2 rounded-md bg-accent px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-accent-ink shadow-lg">
            Yakında
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className={`shrink-0 ${className}`}>
      <div className="relative z-20 flex w-[76px] shrink-0 flex-col gap-1 border-r border-line bg-background px-1.5 py-3">
      {MAIN.map(button)}
      <hr className="mx-2 my-2 border-line" />
      {BOTTOM.map(button)}
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
