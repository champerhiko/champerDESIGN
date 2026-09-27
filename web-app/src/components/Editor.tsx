"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import PreviewCanvas from "@/components/PreviewCanvas";
import Sidebar from "@/components/Sidebar";
import { buildFilter, DEFAULT_ADJUSTMENTS, type Adjustments, type PresetName } from "@/lib/filters";
import { crop, flip, imageToCanvas, rotate90, type CropRect } from "@/lib/transform";
import { getProject, makeThumbnail, saveProject, type Op } from "@/lib/projects";

const INITIAL_CROP: CropRect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

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
  onBack: () => void;
};

export default function Editor({ projectId, initialFile, onBack }: Props) {
  const [id, setId] = useState(projectId);
  const [name, setName] = useState("foto");
  const [image, setImage] = useState<Blob | null>(null);
  const [original, setOriginal] = useState<HTMLCanvasElement | null>(null);
  const [ops, setOps] = useState<Op[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [preset, setPreset] = useState<PresetName>("Orijinal");
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [saved, setSaved] = useState(true);
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
    setCropRect(null);
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
            />
          ) : (
            <UploadZone onFile={loadFile} />
          )}
        </main>
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
    </div>
  );
}
