"use client";

import { useState } from "react";

export default function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file?.type.startsWith("image/")) onFile(file);
  }

  return (
    <label
      htmlFor="photo-upload"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files);
      }}
      className={`animate-fade-up group flex min-h-64 flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all hover:border-accent/70 hover:bg-surface-1 ${dragging ? "scale-[1.01] border-accent bg-accent/5" : "border-line bg-surface-1/50"}`}
    >
      <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10 text-accent transition-transform group-hover:-translate-y-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </svg>
      </div>
      <span className="text-lg font-semibold">Düzenlemeye bir fotoğrafla başla</span>
      <span className="text-sm text-neutral-400">Fotoğrafı buraya sürükle-bırak ya da bilgisayarından seç</span>
      <span className="mt-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-lg shadow-accent/10 transition-all group-hover:bg-accent-hover group-active:scale-95">
        Dosya seç
      </span>
      <span className="text-xs text-neutral-500">JPG, PNG, WEBP</span>
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
