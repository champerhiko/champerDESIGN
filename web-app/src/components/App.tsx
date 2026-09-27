"use client";

import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Editor from "@/components/Editor";
import ChamperAI from "@/components/ChamperAI";
import Home from "@/components/Home";
import GlobalNav, { type NavPage } from "@/components/GlobalNav";

// Ana Sayfa, dashboard, editör ve ChamperAI arasında sayfa içi geçiş (ayrı route yok)
type View =
  | { name: "home" }
  | { name: "dashboard" }
  | { name: "ai" }
  | { name: "editor"; projectId: string | null; file: File | null; nonce: number };

const ACTIVE: Record<View["name"], NavPage> = { home: "home", dashboard: "projects", editor: "create", ai: "ai" };

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });

  const openEditor = (projectId: string | null, file: File | null) =>
    setView({ name: "editor", projectId, file, nonce: Date.now() });
  const toDashboard = () => setView({ name: "dashboard" });

  function navigate(page: NavPage) {
    if (page === "home") setView({ name: "home" });
    else if (page === "create") openEditor(null, null);
    else if (page === "projects") toDashboard();
    else setView({ name: "ai" });
  }

  return (
    <div className="flex h-dvh flex-col bg-background lg:flex-row">
      <GlobalNav active={ACTIVE[view.name]} onNavigate={navigate} />
      <div className="order-1 min-h-0 min-w-0 flex-1 lg:order-2">
        {view.name === "editor" ? (
          <Editor
            // Oluştur'a tekrar basınca da temiz bir editör açılsın
            key={view.projectId ?? `new-${view.nonce}`}
            projectId={view.projectId}
            initialFile={view.file}
            onBack={toDashboard}
          />
        ) : view.name === "home" ? (
          <Home onNavigate={navigate} onOpen={(id) => openEditor(id, null)} />
        ) : view.name === "ai" ? (
          <ChamperAI />
        ) : (
          <Dashboard onOpen={(id) => openEditor(id, null)} onNew={(file) => openEditor(null, file)} />
        )}
      </div>
    </div>
  );
}
