import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Pencil, Square, Circle, Minus,
  Trash2, Download, Palette
} from "lucide-react";

const tools = [
  { id: "pen",    label: "Pen",      Icon: Pencil  },
  { id: "rect",   label: "Rectangle",     Icon: Square  },
  { id: "circle", label: "Circle",   Icon: Circle  },
  { id: "line",   label: "Line",     Icon: Minus   },
];

export default function Toolbar({
  activeTool, setActiveTool,
  color, setColor,
  onClear, onDownload,
}) {
  const toolbarRef = useRef(null);
  const btnRefs    = useRef([]);

  // Animate toolbar on mount
  useEffect(() => {
    gsap.fromTo(toolbarRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
    gsap.fromTo(btnRefs.current,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out",
        stagger: 0.05, delay: 0.2 }
    );
  }, []);

  const addRef = (el) => {
    if (el && !btnRefs.current.includes(el)) btnRefs.current.push(el);
  };

  const onEnter = (e) => gsap.to(e.currentTarget, { scale: 1.12, duration: 0.18, ease: "power2.out" });
  const onLeave = (e) => gsap.to(e.currentTarget, { scale: 1,    duration: 0.18, ease: "power2.out" });
  const onTap   = (e) => gsap.fromTo(e.currentTarget,
    { scale: 0.92 }, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.4)" });

  const glass = {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  };

  const activeStyle = {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "1px solid rgba(139,92,246,0.5)",
    boxShadow: "0 0 16px rgba(99,102,241,0.4)",
  };

  return (
    <div ref={toolbarRef}
      className="flex items-center gap-2 px-4 py-2 rounded-2xl"
      style={glass}>

      {/* Tool buttons */}
      {tools.map(({ id, label, Icon }) => (
        <button
          key={id}
          ref={addRef}
          onClick={(e) => { setActiveTool(id); onTap(e); }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          title={label}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={activeTool === id ? activeStyle : {}}
        >
          <Icon
            size={16}
            className={activeTool === id ? "text-white" : "text-white/60"}
          />
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.12)" }} />

      {/* Color picker */}
        <button
  ref={addRef}
  title="Color"
  className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer relative"
  onMouseEnter={onEnter}
  onMouseLeave={onLeave}
  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
>
  <div className="w-5 h-5 rounded-full border-2 border-white/30 shadow-lg"
    style={{ background: color }} />
  <input
    type="color"
    value={color}
    onChange={e => setColor(e.target.value)}
    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
  />
</button>

      {/* Divider */}
      <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.12)" }} />

      {/* Clear */}
      <button
        ref={addRef}
        onClick={(e) => { onClear(); onTap(e); }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        title="Clear canvas"
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
      >
        <Trash2 size={16} className="text-red-400" />
      </button>

      {/* Download */}
      <button
        ref={addRef}
        onClick={(e) => { onDownload(); onTap(e); }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        title="Download drawing"
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}
      >
        <Download size={16} className="text-emerald-400" />
      </button>

    </div>
  );
}