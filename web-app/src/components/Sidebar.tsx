"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { PRESETS, type Adjustments, type PresetName } from "@/lib/filters";

type Tab = "edit" | "adjust" | "filters";

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    {d}
  </svg>
);

const TABS: { id: Tab; label: string; title: string; icon: ReactNode }[] = [
  {
    id: "edit",
    label: "Düzenle",
    title: "Kırp, döndür, çevir",
    icon: icon(<path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2" />),
  },
  {
    id: "adjust",
    label: "Ayarla",
    title: "Işık ve renk",
    icon: icon(
      <>
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
        <path d="M1 14h6M9 8h6M17 16h6" />
      </>,
    ),
  },
  {
    id: "filters",
    label: "Filtreler",
    title: "Hazır filtreler",
    icon: icon(
      <>
        <circle cx="9" cy="9" r="6" />
        <circle cx="15" cy="15" r="6" />
      </>,
    ),
  },
];

const ADJUSTMENTS: { key: keyof Adjustments; label: string }[] = [
  { key: "brightness", label: "Parlaklık" },
  { key: "contrast", label: "Kontrast" },
  { key: "saturate", label: "Doygunluk" },
];

const TOOL_CLASS =
  "flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-2 py-3 text-xs font-medium transition-all hover:border-accent/50 hover:bg-surface-3 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-surface-2 disabled:active:scale-100";

type Props = {
  className?: string;
  hasImage: boolean;
  filterThumb: string | null;
  adjustments: Adjustments;
  onAdjustmentsChange: (a: Adjustments) => void;
  preset: PresetName;
  onPresetChange: (p: PresetName) => void;
  cropping: boolean;
  onRotate: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onCropStart: () => void;
  onCropApply: () => void;
  onCropCancel: () => void;
  onReset: () => void;
  // Panel açıklığı Editor'da tutulur (sol menü paneliyle aynı anda tek panel açık)
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function Sidebar(props: Props) {
  const { className = "", hasImage, onReset, open, onOpenChange } = props;
  const [tab, setTab] = useState<Tab>("adjust");
  // Sadece masaüstünde kapanabilir; mobilde panel hep açık (tek panel)
  const current = TABS.find((t) => t.id === tab)!;

  function select(id: Tab) {
    if (id === tab) {
      onOpenChange(!open);
    } else {
      setTab(id);
      onOpenChange(true);
    }
  }

  return (
    <aside className={`flex shrink-0 flex-col border-t border-line bg-surface-1 lg:flex-row lg:border-t-0 lg:border-r ${className}`}>
      <nav className="flex shrink-0 justify-around gap-1 border-b border-line p-2 lg:w-20 lg:flex-col lg:justify-start lg:gap-2 lg:border-b-0">
        {TABS.map((t) => {
          // Seçili ama panel kapalıysa vurgu sadece mobilde (orada panel her zaman görünür)
          const state = tab !== t.id ? "off" : open ? "on" : "mobile";
          const hl = (styles: Record<"on" | "mobile", string>) => (state === "off" ? "" : styles[state]);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => select(t.id)}
              aria-pressed={tab === t.id && open}
              aria-expanded={tab === t.id && open}
              className={`group flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium text-neutral-400 transition-colors hover:text-foreground lg:flex-none lg:py-2.5 ${hl({
                on: "text-accent hover:text-accent lg:bg-accent/10",
                mobile: "max-lg:text-accent max-lg:hover:text-accent",
              })}`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all group-hover:bg-surface-3 group-active:scale-90 ${hl({
                  on: "bg-accent text-accent-ink shadow-[0_0_16px_-4px_#ffbd59] group-hover:bg-accent-hover",
                  mobile: "max-lg:bg-accent max-lg:text-accent-ink max-lg:group-hover:bg-accent-hover",
                })}`}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Masaüstünde genişlik geçişiyle kayarak açılır/kapanır */}
      <div
        className={`min-h-0 min-w-0 overflow-hidden lg:border-line lg:transition-[width] lg:duration-300 lg:ease-out ${
          open ? "lg:w-80 lg:border-l" : "lg:w-0"
        }`}
      >
      <div
        className={`max-h-[42vh] overflow-y-auto p-4 lg:h-full lg:max-h-none lg:w-80 lg:transition-transform lg:duration-300 lg:ease-out ${
          open ? "" : "lg:-translate-x-full"
        }`}
      >
        <div key={tab} className="animate-fade-up">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{current.label}</h2>
              <p className="text-xs text-neutral-500">{current.title}</p>
            </div>
            <button
              type="button"
              onClick={onReset}
              disabled={!hasImage}
              className="rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Sıfırla
            </button>
          </div>
          {!hasImage && (
            <p className="mb-4 rounded-lg bg-surface-2 px-3 py-2 text-xs text-neutral-400">
              Araçları kullanmak için önce bir fotoğraf yükle.
            </p>
          )}
          {tab === "edit" && <EditTools {...props} />}
          {tab === "adjust" && <AdjustTools {...props} />}
          {tab === "filters" && <FilterTools {...props} />}
        </div>
      </div>
      </div>
    </aside>
  );
}

function EditTools({ hasImage, cropping, onCropStart, onCropApply, onCropCancel, onRotate, onFlipH, onFlipV }: Props) {
  if (cropping) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-neutral-400">Önizlemedeki çerçeveyi sürükleyerek alanı seç.</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCropApply}
            className="rounded-lg bg-accent py-2 text-sm font-semibold text-accent-ink transition-all hover:bg-accent-hover active:scale-95"
          >
            Uygula
          </button>
          <button
            type="button"
            onClick={onCropCancel}
            className="rounded-lg bg-surface-3 py-2 text-sm transition-all hover:bg-surface-2 active:scale-95"
          >
            İptal
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Kırp", onClick: onCropStart, d: <path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2" /> },
        { label: "Döndür", onClick: onRotate, d: <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" /> },
        { label: "Yatay Çevir", onClick: onFlipH, d: <path d="M12 3v18M8 7l-5 5 5 5M16 7l5 5-5 5" /> },
        { label: "Dikey Çevir", onClick: onFlipV, d: <path d="M3 12h18M7 8l5-5 5 5M7 16l5 5 5-5" /> },
      ].map((tool) => (
        <button key={tool.label} type="button" onClick={tool.onClick} disabled={!hasImage} className={TOOL_CLASS}>
          {icon(tool.d)}
          {tool.label}
        </button>
      ))}
    </div>
  );
}

function AdjustTools({ hasImage, adjustments, onAdjustmentsChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {ADJUSTMENTS.map(({ key, label }) => (
        <label key={key} className="flex flex-col gap-2 text-sm">
          <span className="flex justify-between">
            {label}
            <span className="rounded bg-surface-3 px-1.5 text-xs tabular-nums text-neutral-300">{adjustments[key]}</span>
          </span>
          <input
            type="range"
            min={0}
            max={200}
            value={adjustments[key]}
            disabled={!hasImage}
            onChange={(e) => onAdjustmentsChange({ ...adjustments, [key]: Number(e.target.value) })}
            style={{ "--fill": `${adjustments[key] / 2}%` } as CSSProperties}
            className="slider disabled:cursor-not-allowed disabled:opacity-40"
          />
        </label>
      ))}
    </div>
  );
}

function FilterTools({ hasImage, filterThumb, preset, onPresetChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
      {PRESETS.map((p) => (
        <button
          key={p.name}
          type="button"
          onClick={() => onPresetChange(p.name)}
          disabled={!hasImage}
          className={`flex flex-col items-center gap-1.5 rounded-xl p-1.5 text-xs transition-all hover:bg-surface-3 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
            p.name === preset ? "bg-accent/10 font-semibold text-accent ring-2 ring-accent" : "text-neutral-300"
          }`}
        >
          <span
            className="aspect-square w-full rounded-lg bg-gradient-to-br from-neutral-500 to-neutral-800 bg-cover bg-center shadow-md"
            style={{ backgroundImage: filterThumb ? `url(${filterThumb})` : undefined, filter: p.filter || undefined }}
          />
          {p.name}
        </button>
      ))}
    </div>
  );
}
