import { useParams } from "react-router-dom";
import { useState } from "react";
import TextEditor from "../components/TextEditor";
import DrawingCanvas from "../components/DrawingCanvas";
import Toolbar from "../components/Toolbar";

export default function EditorPage() {
  const { id } = useParams();
  const [activeTool, setActiveTool]     = useState("pen");
  const [color, setColor]               = useState("#6366f1");
  const [clearSignal, setClearSignal]   = useState(0);
  const [downloadSignal, setDownloadSignal] = useState(0);

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center px-6 h-16 shrink-0"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">Collab Editor</p>
            <p className="text-white/40 text-xs font-mono mt-0.5">doc/{id}</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            color={color}
            setColor={setColor}
            onClear={() => setClearSignal(s => s + 1)}
            onDownload={() => setDownloadSignal(s => s + 1)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/50 text-xs">Live</span>
        </div>
      </header>

      {/* Split panels */}
      <main className="relative z-10 flex flex-1 overflow-hidden gap-3 p-3">

        {/* Text panel */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
          <div className="flex items-center gap-2 px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            </div>
            <span className="text-white/30 text-xs font-mono ml-2">text editor</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <TextEditor docId={id} />
          </div>
        </div>

        {/* Canvas panel */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
          <div className="flex items-center gap-2 px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            </div>
            <span className="text-white/30 text-xs font-mono ml-2">drawing canvas</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <DrawingCanvas
              docId={id}
              activeTool={activeTool}
              color={color}
              clearSignal={clearSignal}
              downloadSignal={downloadSignal}
            />
          </div>
        </div>

      </main>
    </div>
  );
}