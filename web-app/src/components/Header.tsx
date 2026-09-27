import type { ReactNode } from "react";

export default function Header({ onHome, children }: { onHome?: () => void; children?: ReactNode }) {
  const logo = (
    <>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-accent-ink shadow-[0_0_20px_-4px_#ffbd59]">
        C
      </div>
      <span className="text-lg font-semibold tracking-tight">Champer Design</span>
    </>
  );
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface-1 px-4">
      {onHome ? (
        <button
          type="button"
          onClick={onHome}
          aria-label="Ana sayfaya dön"
          className="flex items-center gap-3 rounded-lg px-1 py-1 transition-opacity hover:opacity-80"
        >
          {logo}
        </button>
      ) : (
        <div className="flex items-center gap-3 px-1">{logo}</div>
      )}
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </header>
  );
}
