"use client";

import { useEffect, useRef, useState } from "react";
import UploadZone from "@/components/UploadZone";
import PreviewCanvas from "@/components/PreviewCanvas";
import EditorPanel from "@/components/EditorPanel";
import { buildFilter, DEFAULT_ADJUSTMENTS, type Adjustments, type PresetName } from "@/lib/filters";
import { crop, flip, imageToCanvas, rotate90, type CropRect } from "@/lib/transform";

const INITIAL_CROP: CropRect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

export default function Editor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("foto");
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [preset, setPreset] = useState<PresetName>("Orijinal");
  // Döndür/çevir/kırp sonrası güncel görsel; filtreler bunun üzerine CSS/ctx.filter ile uygulanır
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filter = buildFilter(preset, adjustments);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    if (imageUrl) loadOriginal(imageUrl);
  }, [imageUrl]);

  function loadOriginal(url: string) {
    const img = new Image();
    img.onload = () => setSource(imageToCanvas(img));
    img.src = url;
    setCropRect(null);
  }

  function transform(fn: (c: HTMLCanvasElement) => HTMLCanvasElement) {
    if (source) setSource(fn(source));
  }

  function handleFile(file: File) {
    setImageUrl(URL.createObjectURL(file));
    setFileName(file.name.replace(/\.[^.]+$/, ""));
  }

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
      a.download = `${fileName}-champer.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <UploadZone onFile={handleFile} />
        <PreviewCanvas
          canvasRef={canvasRef}
          source={source}
          filter={filter}
          crop={cropRect}
          onCropChange={setCropRect}
        />
      </main>
      <EditorPanel
        imageUrl={imageUrl}
        adjustments={adjustments}
        onAdjustmentsChange={setAdjustments}
        preset={preset}
        onPresetChange={setPreset}
        cropping={cropRect !== null}
        onRotate={() => transform(rotate90)}
        onFlipH={() => transform((c) => flip(c, "h"))}
        onFlipV={() => transform((c) => flip(c, "v"))}
        onCropStart={() => source && setCropRect(INITIAL_CROP)}
        onCropApply={() => {
          if (cropRect) transform((c) => crop(c, cropRect));
          setCropRect(null);
        }}
        onCropCancel={() => setCropRect(null)}
        onReset={() => {
          setAdjustments(DEFAULT_ADJUSTMENTS);
          setPreset("Orijinal");
          if (imageUrl) loadOriginal(imageUrl);
        }}
        onDownload={handleDownload}
      />
    </div>
  );
}
