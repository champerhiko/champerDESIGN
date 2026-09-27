"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import EditorRail from "@/components/EditorRail";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import PreviewCanvas from "@/components/PreviewCanvas";
import Sidebar from "@/components/Sidebar";
import { buildFilter, DEFAULT_ADJUSTMENTS, type Adjustments, type PresetName } from "@/lib/filters";
import { crop, flip, imageToCanvas, rotate90, type CropRect } from "@/lib/transform";
import type { Format } from "@/components/CreatePicker";
import { getProject, makeThumbnail, saveProject, type Op } from "@/lib/projects";

const INITIAL_CROP: CropRect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

// Seçilen formatın oranında, görsele sığan en büyük ortalanmış kırpma çerçevesi
function formatCrop(c: HTMLCanvasElement, f: Format): CropRect {
  const target = f.w / f.h;
  const w = Math.min(1, (c.height * target) / c.width);
  const h = Math.min(1, c.width / target / c.height);
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

function applyOp(c: HTMLCanvasElement, op: Op): HTMLCanvasElement {
  if (op.type === "rotate") return rotate90(c);
  if (op.type === "flip") return flip(c, op.axis);
  return crop(c, op.rect);
}

function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      resolve(imageToCanvas(img));
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}

type Props = {
  projectId: string | null;
  initialFile: File | null;
  format?: Format | null;
  onBack: () => void;
};

export default function Editor({ projectId, initialFile, format = null, onBack }: Props) {
  const [id, setId] = useState(projectId);
  const [name, setName] = useState("foto");
  const [image, setImage] = useState<Blob | null>(null);
  const [original, setOriginal] = useState<HTMLCanvasElement | null>(null);
  const [ops, setOps] = useState<Op[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [preset, setPreset] = useState<PresetName>("Orijinal");
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [saved, setSaved] = useState(true);
  const [zoom, setZoom] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Açılışta yüklenen proje hemen yeniden kaydedilip tarihi güncellenmesin diye
  const lastSaved = useRef<string | null>(null);

  const filter = buildFilter(preset, adjustments);
  // Döndür/çevir/kırp adımları orijinal üzerine sırayla uygulanır
  const source = useMemo(() => (original ? ops.reduce(applyOp, original) : null), [original, ops]);
  const filterThumb = useMemo(() => (source ? makeThumbnail(source, "") : null), [source]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (projectId) {
        const p = await getProject(projectId);
        if (!p || cancelled) return;
        const canvas = await blobToCanvas(p.image);
        if (cancelled) return;
        lastSaved.current = JSON.stringify([p.ops, p.adjustments, p.preset]);
        setName(p.name);
        setImage(p.image);
        setOps(p.ops);
        setAdjustments(p.adjustments);
        setPreset(p.preset);
        setOriginal(canvas);
      } else if (initialFile) {
        loadFile(initialFile);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sadece açılışta
  }, []);

  // Otomatik kayıt: değişiklikten 500ms sonra IndexedDB'ye yaz
  useEffect(() => {
    if (!id || !image || !source) return;
    const key = JSON.stringify([ops, adjustments, preset]);
    if (key === lastSaved.current) return;
    setSaved(false);
    const t = setTimeout(() => {
      saveProject({
        id,
        name,
        updatedAt: Date.now(),
        image,
        thumbnail: makeThumbnail(source, filter),
        adjustments,
        preset,
        ops,
      }).then(() => {
        lastSaved.current = key;
        setSaved(true);
      });
    }, 500);
    return () => clearTimeout(t);
  }, [id, name, image, source, ops, adjustments, preset, filter]);

  async function loadFile(file: File) {
    const canvas = await blobToCanvas(file);
    lastSaved.current = null;
    setId(crypto.randomUUID());
    setName(file.name.replace(/\.[^.]+$/, ""));
    setImage(file);
    setOps([]);
    // Formatla açıldıysa o oranda kırpma önerilir; kullanıcı değiştirebilir ya da iptal edebilir
    setCropRect(format ? formatCrop(canvas, format) : null);
    setOriginal(canvas);
  }

  const addOp = (op: Op) => setOps((o) => [...o, op]);

  // CSS filter sadece ekrandaki görünümü değiştirir, canvas pikselleri değişmez.
  // İndirirken orijinal çözünürlükte bir offscreen canvas'a aynı filter string'ini
  // ctx.filter ile uygulayarak yeniden çiziyoruz; böylece pikseller gerçekten değişir.
  function handleDownload() {
    const source = canvasRef.current;
    if (!source) return;
    const out = document.createElement("canvas");
    out.width = source.width;
    out.height = source.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.filter = filter;
    ctx.drawImage(source, 0, 0);
    out.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${name}-champer.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <Header onHome={onBack}>
        {source && (
          <>
            <span className="hidden text-xs text-neutral-500 sm:inline">{saved ? "Kaydedildi" : "Kaydediliyor…"}</span>
            <span className="hidden max-w-48 truncate text-sm text-neutral-300 md:inline">{name}</span>
          </>
        )}
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-surface-3 hover:text-foreground"
        >
          Projeler
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!source}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-all hover:bg-accent-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          İndir
        </button>
      </Header>

      <div className="flex min-h-0 flex-1 flex-col max-lg:overflow-y-auto lg:flex-row">
        <main className="order-1 flex min-h-0 flex-1 flex-col p-3 max-lg:min-h-[340px] max-lg:flex-none sm:p-6 lg:order-2">
          {source ? (
            <PreviewCanvas
              canvasRef={canvasRef}
              source={source}
              filter={filter}
              crop={cropRect}
              onCropChange={setCropRect}
              zoom={zoom / 100}
            />
          ) : (
            <UploadZone onFile={loadFile} />
          )}
          {/* Şimdilik tek sayfa: buton sadece görsel */}
          <div className="mt-3 hidden justify-center lg:flex">
            <div className="flex overflow-hidden rounded-lg border border-line bg-surface-2 text-sm font-medium">
              <button type="button" className="px-4 py-2 transition-colors hover:bg-surface-3 hover:text-accent">
                + Sayfa ekle
              </button>
              <button type="button" aria-label="Sayfa ekleme seçenekleri" className="border-l border-line px-2 transition-colors hover:bg-surface-3 hover:text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        </main>
        <EditorRail className="hidden lg:order-first lg:flex" onFile={loadFile} />
        <Sidebar
          className="order-2 lg:order-1"
          hasImage={!!source}
          filterThumb={filterThumb}
          adjustments={adjustments}
          onAdjustmentsChange={setAdjustments}
          preset={preset}
          onPresetChange={setPreset}
          cropping={cropRect !== null}
          onRotate={() => addOp({ type: "rotate" })}
          onFlipH={() => addOp({ type: "flip", axis: "h" })}
          onFlipV={() => addOp({ type: "flip", axis: "v" })}
          onCropStart={() => source && setCropRect(INITIAL_CROP)}
          onCropApply={() => {
            if (cropRect) addOp({ type: "crop", rect: cropRect });
            setCropRect(null);
          }}
          onCropCancel={() => setCropRect(null)}
          onReset={() => {
            setAdjustments(DEFAULT_ADJUSTMENTS);
            setPreset("Orijinal");
            setOps([]);
            setCropRect(null);
          }}
        />
      </div>
      <EditorFooter zoom={zoom} onZoom={setZoom} />
    </div>
  );
}

const footerIcon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    {d}
  </svg>
);

const FOOTER_BTN = "flex items-center gap-1.5 rounded-md px-2 py-1 text-neutral-400 transition-colors hover:bg-surface-3 hover:text-accent";

// Alt bar (masaüstü): yakınlaştırma ve tam ekran çalışır, diğerleri şimdilik placeholder
function EditorFooter({ zoom, onZoom }: { zoom: number; onZoom: (z: number) => void }) {
  return (
    <footer className="hidden h-11 shrink-0 items-center gap-2 border-t border-line bg-surface-1 px-3 text-xs lg:flex">
      <button type="button" className={FOOTER_BTN}>
        {footerIcon(<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5" />)}
        Notlar
      </button>
      <button type="button" className={FOOTER_BTN}>
        {footerIcon(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></>)}
        Zamanlayıcı
      </button>
      <div className="ml-auto flex items-center gap-2">
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
          aria-label="Yakınlaştırma"
          className="w-32 accent-accent"
        />
        <button type="button" onClick={() => onZoom(100)} title="Sığdır (%100)" className="w-12 rounded-md py-1 text-center tabular-nums text-neutral-300 hover:bg-surface-3 hover:text-accent">
          %{zoom}
        </button>
        <button type="button" className={FOOTER_BTN}>
          {footerIcon(<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M7 20h10" /></>)}
          Sayfalar
        </button>
        <span className="px-1 tabular-nums text-neutral-400">1/1</span>
        <button
          type="button"
          title="Tam ekran"
          aria-label="Tam ekran"
          onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}
          className={FOOTER_BTN}
        >
          {footerIcon(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />)}
        </button>
        <button type="button" title="Yardım" aria-label="Yardım" className={FOOTER_BTN}>
          {footerIcon(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01" /></>)}
        </button>
      </div>
    </footer>
  );
}
