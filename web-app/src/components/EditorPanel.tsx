"use client";

import { PRESETS, type Adjustments, type PresetName } from "@/lib/filters";

const TOOL_CLASS =
  "rounded-md bg-neutral-800 py-2 text-sm hover:bg-neutral-700 active:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-40";
const ADJUSTMENTS: { key: keyof Adjustments; label: string }[] = [
  { key: "brightness", label: "Parlaklık" },
  { key: "contrast", label: "Kontrast" },
  { key: "saturate", label: "Doygunluk" },
];

type Props = {
  imageUrl: string | null;
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
  onDownload: () => void;
};

export default function EditorPanel({
  imageUrl,
  adjustments,
  onAdjustmentsChange,
  preset,
  onPresetChange,
  cropping,
  onRotate,
  onFlipH,
  onFlipV,
  onCropStart,
  onCropApply,
  onCropCancel,
  onReset,
  onDownload,
}: Props) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 overflow-y-auto border-t border-neutral-800 bg-neutral-900 p-4 lg:w-72 lg:border-t-0 lg:border-l">
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Araçlar</h2>
        {cropping ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onCropApply} className="rounded-md bg-violet-600 py-2 text-sm hover:bg-violet-500">
              Uygula
            </button>
            <button type="button" onClick={onCropCancel} className={TOOL_CLASS}>
              İptal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Kırp", onClick: onCropStart },
              { label: "Döndür", onClick: onRotate },
              { label: "Yatay Çevir", onClick: onFlipH },
              { label: "Dikey Çevir", onClick: onFlipV },
            ].map((tool) => (
              <button key={tool.label} type="button" onClick={tool.onClick} disabled={!imageUrl} className={TOOL_CLASS}>
                {tool.label}
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Ayarlar</h2>
          <button type="button" onClick={onReset} className="text-xs text-violet-400 hover:text-violet-300">
            Sıfırla
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {ADJUSTMENTS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                {label}
                <span className="tabular-nums text-neutral-400">{adjustments[key]}</span>
              </span>
              <input
                type="range"
                min={0}
                max={200}
                value={adjustments[key]}
                onChange={(e) => onAdjustmentsChange({ ...adjustments, [key]: Number(e.target.value) })}
                className="accent-violet-500"
              />
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Filtreler</h2>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => onPresetChange(p.name)}
              className={`flex flex-col items-center gap-1 rounded-md p-1 text-xs hover:bg-neutral-800 ${p.name === preset ? "ring-2 ring-violet-500" : ""}`}
            >
              <span
                className="aspect-square w-full rounded bg-neutral-700 bg-cover bg-center"
                style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined, filter: p.filter || undefined }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onDownload}
        disabled={!imageUrl}
        className="mt-auto rounded-md bg-violet-600 py-2 text-sm font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        İndir (PNG)
      </button>
    </aside>
  );
}
