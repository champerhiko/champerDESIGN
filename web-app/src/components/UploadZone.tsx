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
      className={`flex shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-neutral-900 px-6 py-6 text-center transition-colors hover:border-violet-500 ${dragging ? "border-violet-500 bg-violet-950/30" : "border-neutral-700"}`}
    >
      <span className="text-sm font-medium">Fotoğrafı buraya sürükle-bırak</span>
      <span className="text-xs text-neutral-400">veya</span>
      <span className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500">Dosya seç</span>
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
