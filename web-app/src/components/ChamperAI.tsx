"use client";

import { useState } from "react";
import Header from "@/components/Header";

// Şimdilik sadece arayüz iskeleti; gerçek üretim (Gemini) sonra eklenecek
export default function ChamperAI() {
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState(false);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
        <div className="animate-fade-up w-full max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-[0_0_40px_-10px_#ffbd59]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">ChamperAI ile ne oluşturalım?</h1>
          <p className="mt-2 text-sm text-neutral-400">Aklındakini yaz, gerisini ChamperAI halletsin.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setNotice(true);
            }}
            className="mt-8 rounded-2xl border border-line bg-surface-1 p-3 text-left shadow-xl transition-colors focus-within:border-accent/60"
          >
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setNotice(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              rows={3}
              placeholder="Örn: Gün batımında sahilde yürüyen bir köpek, sinematik ışık"
              className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-neutral-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-all hover:bg-accent-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              >
                Gönder
              </button>
            </div>
          </form>

          {notice && (
            <p role="status" className="animate-fade-up mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
              Bu özellik yakında aktif olacak.
            </p>
          )}
          <p className="mt-6 text-xs text-neutral-500">ChamperAI yakında burada: yazıdan görsel ve metin üretimi.</p>
        </div>
      </main>
    </div>
  );
}
