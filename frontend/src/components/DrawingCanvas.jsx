import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
const API = "http://localhost:5000/api";

export default function DrawingCanvas({
  docId, activeTool, color, clearSignal, downloadSignal
}) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null); // for shape preview

  // ── helpers ──────────────────────────────────────────────
  const getCtx = () => canvasRef.current?.getContext("2d");

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawShape = useCallback((ctx, shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    if (shape.tool === "pen") {
      ctx.beginPath();
      ctx.moveTo(shape.x0, shape.y0);
      ctx.lineTo(shape.x1, shape.y1);
      ctx.stroke();

    } else if (shape.tool === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.x0, shape.y0);
      ctx.lineTo(shape.x1, shape.y1);
      ctx.stroke();

    } else if (shape.tool === "rect") {
      ctx.strokeRect(shape.x0, shape.y0, shape.x1 - shape.x0, shape.y1 - shape.y0);

    } else if (shape.tool === "circle") {
      const rx = (shape.x1 - shape.x0) / 2;
      const ry = (shape.y1 - shape.y0) / 2;
      ctx.beginPath();
      ctx.ellipse(
        shape.x0 + rx, shape.y0 + ry,
        Math.abs(rx), Math.abs(ry),
        0, 0, 2 * Math.PI
      );
      ctx.stroke();
    }
  }, []);

  // ── resize canvas to fill container ──────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const imageData = getCtx()?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (imageData) getCtx()?.putImageData(imageData, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  // ── load saved canvas from MongoDB on mount ───────────────
  useEffect(() => {
    fetch(`${API}/canvas/${docId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.canvas?.imageData) return;
        const img = new Image();
        img.onload = () => getCtx()?.drawImage(img, 0, 0);
        img.src = data.canvas.imageData;
      })
      .catch(() => {});
  }, [docId]);

  // ── socket: join room + receive remote shapes/clear ───────
  useEffect(() => {

    socket.on("receive-shape", (shape) => {
      drawShape(getCtx(), shape);
    });

    socket.on("canvas-cleared", () => {
      const canvas = canvasRef.current;
      getCtx()?.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("receive-shape");
      socket.off("canvas-cleared");
    };
  }, [docId, drawShape]);

  // ── clear signal from toolbar ─────────────────────────────
  useEffect(() => {
    if (clearSignal === 0) return;
    const canvas = canvasRef.current;
    getCtx()?.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear-canvas", { docId });

    // save cleared state
    fetch(`${API}/canvas/${docId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: "" }),
    });
  }, [clearSignal, docId]);

  // ── download signal from toolbar ──────────────────────────
  useEffect(() => {
    if (downloadSignal === 0) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `drawing-${docId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [downloadSignal, docId]);

  // ── save canvas to MongoDB (debounced 2s) ─────────────────
  const saveTimer = useRef(null);
  const saveCanvas = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const imageData = canvasRef.current.toDataURL("image/png");
      fetch(`${API}/canvas/${docId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      });
    }, 2000);
  }, [docId]);

  // ── mouse events ──────────────────────────────────────────
  const onMouseDown = (e) => {
    isDrawing.current = true;
    const pos = getPos(e);
    startPos.current = pos;

    if (activeTool !== "pen") {
      // snapshot canvas for shape preview
      const canvas = canvasRef.current;
      snapshotRef.current = getCtx().getImageData(0, 0, canvas.width, canvas.height);
    } else {
      // pen: start path
      const ctx = getCtx();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const onMouseMove = (e) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    const ctx = getCtx();

    if (activeTool === "pen") {
      const shape = {
        tool: "pen",
        x0: startPos.current.x, y0: startPos.current.y,
        x1: pos.x, y1: pos.y,
        color,
      };
      drawShape(ctx, shape);
      socket.emit("send-shape", { docId, shape });
      startPos.current = pos;

    } else {
      // restore snapshot for live shape preview
      ctx.putImageData(snapshotRef.current, 0, 0);
      drawShape(ctx, {
        tool: activeTool,
        x0: startPos.current.x, y0: startPos.current.y,
        x1: pos.x, y1: pos.y,
        color,
      });
    }
  };

  const onMouseUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const pos = getPos(e);

    if (activeTool !== "pen") {
      const shape = {
        tool: activeTool,
        x0: startPos.current.x, y0: startPos.current.y,
        x1: pos.x, y1: pos.y,
        color,
      };
      socket.emit("send-shape", { docId, shape });
    }
    saveCanvas();
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      style={{ background: "transparent" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { isDrawing.current = false; }}
    />
  );
}