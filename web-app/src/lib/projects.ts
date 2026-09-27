// Projeler tarayıcıda IndexedDB'de saklanır (backend yok).
// Orijinal görsel blob olarak tutulur; döndür/çevir/kırp adımları "ops" listesiyle yeniden oynatılır.

import type { Adjustments, PresetName } from "@/lib/filters";
import type { CropRect } from "@/lib/transform";

export type Op = { type: "rotate" } | { type: "flip"; axis: "h" | "v" } | { type: "crop"; rect: CropRect };

export type Project = {
  id: string;
  name: string;
  updatedAt: number;
  image: Blob;
  thumbnail: string; // küçük JPEG data URL
  adjustments: Adjustments;
  preset: PresetName;
  ops: Op[];
};

const DB_NAME = "champer-design";
const STORE = "projects";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listProjects(): Promise<Project[]> {
  const all = await run<Project[]>("readonly", (s) => s.getAll());
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export const getProject = (id: string) => run<Project | undefined>("readonly", (s) => s.get(id));
export const saveProject = (p: Project) => run("readwrite", (s) => s.put(p));
export const deleteProject = (id: string) => run("readwrite", (s) => s.delete(id));

// Ekrandaki (filtreli) görünümün en fazla 480px'lik JPEG kopyası
export function makeThumbnail(source: HTMLCanvasElement, filter: string): string {
  const scale = Math.min(1, 480 / Math.max(source.width, source.height));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(source.width * scale));
  out.height = Math.max(1, Math.round(source.height * scale));
  const ctx = out.getContext("2d");
  if (ctx) {
    ctx.filter = filter;
    ctx.drawImage(source, 0, 0, out.width, out.height);
  }
  return out.toDataURL("image/jpeg", 0.8);
}
