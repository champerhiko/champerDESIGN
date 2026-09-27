import Header from "@/components/Header";
import Editor from "@/components/Editor";

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white">
      <Header />
      <Editor />
    </div>
  );
}
