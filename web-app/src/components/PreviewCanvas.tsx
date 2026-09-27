"use client";

import { useEffect, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { CropRect } from "@/lib/transform";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  source: HTMLCanvasElement | null;
  filter: string;
  crop: CropRect | null;
  onCropChange: (r: CropRect) => void;
};

type DragMode = "move" | "nw" | "ne" | "sw" | "se";
const HANDLES: DragMode[] = ["nw", "ne", "sw", "se"];
const MIN = 0.05; // en küçük kırpma boyutu (oran)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function PreviewCanvas({ canvasRef, source, filter, crop, onCropChange }: Props) {
  // Overlay'i canvas'ın ekrandaki kutusuna hizalamak için
  const [box, setBox] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;
    // Orijinal çözünürlükte çiz; ekrana sığdırma CSS ile (max-w/max-h) yapılıyor
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.getContext("2d")?.drawImage(source, 0, 0);
  }, [canvasRef, source]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = () =>
      setBox({ left: canvas.offsetLeft, top: canvas.offsetTop, width: canvas.offsetWidth, height: canvas.offsetHeight });
    const ro = new ResizeObserver(update);
    ro.observe(canvas);
    update();
    return () => ro.disconnect();
  }, [canvasRef, source]);

  function startDrag(e: ReactPointerEvent, mode: DragMode) {
    if (!crop) return;
    e.preventDefault();
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY, r: crop };
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - start.x) / box.width;
      const dy = (ev.clientY - start.y) / box.height;
      const r = start.r;
      if (mode === "move") {
        onCropChange({ ...r, x: clamp(r.x + dx, 0, 1 - r.w), y: clamp(r.y + dy, 0, 1 - r.h) });
        return;
      }
      let { x, y } = r;
      let x2 = r.x + r.w;
      let y2 = r.y + r.h;
      if (mode.includes("w")) x = clamp(r.x + dx, 0, x2 - MIN);
      if (mode.includes("e")) x2 = clamp(x2 + dx, x + MIN, 1);
      if (mode.includes("n")) y = clamp(r.y + dy, 0, y2 - MIN);
      if (mode.includes("s")) y2 = clamp(y2 + dy, y + MIN, 1);
      onCropChange({ x, y, w: x2 - x, h: y2 - y });
    };
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  }

  return (
    <section className="relative flex min-h-64 flex-1 items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-2">
      <canvas
        ref={canvasRef}
        aria-label="Fotoğraf önizleme"
        style={{ filter }}
        className={source ? "max-h-full max-w-full" : "hidden"}
      />
      {!source && <p className="text-sm text-neutral-500">Önizleme burada görünecek</p>}
      {source && crop && (
        <div className="pointer-events-none absolute" style={box}>
          <div
            data-testid="crop-box"
            onPointerDown={(e) => startDrag(e, "move")}
            className="pointer-events-auto absolute cursor-move touch-none border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.w * 100}%`,
              height: `${crop.h * 100}%`,
            }}
          >
            {HANDLES.map((h) => (
              <span
                key={h}
                data-handle={h}
                onPointerDown={(e) => startDrag(e, h)}
                className={`absolute h-4 w-4 touch-none rounded-sm border-2 border-violet-500 bg-white ${
                  h[0] === "n" ? "-top-2" : "-bottom-2"
                } ${h[1] === "w" ? "-left-2" : "-right-2"} ${h === "nw" || h === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize"}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
