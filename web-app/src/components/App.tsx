"use client";

import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Editor from "@/components/Editor";

// Dashboard ile editör arasında sayfa içi geçiş (ayrı route yok)
type View = { name: "dashboard" } | { name: "editor"; projectId: string | null; file: File | null };

export default function App() {
  const [view, setView] = useState<View>({ name: "dashboard" });

  if (view.name === "editor") {
    return (
      <Editor
        key={view.projectId ?? "new"}
        projectId={view.projectId}
        initialFile={view.file}
        onBack={() => setView({ name: "dashboard" })}
      />
    );
  }
  return (
    <Dashboard
      onOpen={(projectId) => setView({ name: "editor", projectId, file: null })}
      onNew={(file) => setView({ name: "editor", projectId: null, file })}
    />
  );
}
