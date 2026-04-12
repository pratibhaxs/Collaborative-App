import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import TextEditor from "../components/TextEditor";
import DrawingCanvas from "../components/DrawingCanvas";
import Toolbar from "../components/Toolbar";
import UserPanel from "../components/UserPanel";

const socket = io("http://localhost:5000");

export default function EditorPage() {
  const { id } = useParams();
  const [activeTool, setActiveTool]         = useState("pen");
  const [color, setColor]                   = useState("#6366f1");
  const [clearSignal, setClearSignal]       = useState(0);
  const [downloadSignal, setDownloadSignal] = useState(0);
  const [users, setUsers]                   = useState([]);
  const [events, setEvents]                 = useState([]);

  const addEvent = (type, message) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setEvents(prev => [...prev.slice(-19), { type, message, time }]);
  };

  useEffect(() => {
    const name = prompt("Enter your name:") || "Anonymous";

    socket.emit("join-room", { docId: id, userName: name });

    socket.on("room-users",  (userList) => setUsers(userList));
    socket.on("user-joined", ({ name })  => addEvent("joined", `${name} joined`));
    socket.on("user-left",   ({ name })  => addEvent("left",   `${name} left`));

    addEvent("info", `You joined as ${name}`);

    return () => {
      socket.emit("leave-room", { docId: id });
      socket.off("room-users");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [id]);

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col"
      style={{ background: "#a78bfa" }}>

      {/* Header */}
      <header className="relative z-10 flex items-center px-6 h-16 shrink-0"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
  
          </div>

        </div>

        {/* Toolbar centered */}
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

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/50 text-xs">Live</span>
        </div>

      </header>

      {/* Main split layout */}
      <main className="relative z-10 flex flex-1 overflow-hidden gap-3 p-3">

        {/* Left: Text Editor panel */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>

          {/* Panel header */}
          <div className="flex items-center justify-center py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{
              background: "white", color: "#7c3aed",
              fontSize: "22px", fontWeight: "800",
              padding: "4px 14px", borderRadius: "8px"
            }}>
              Text Editor
            </span>
          </div>

          {/* White writing area */}
          <div className="flex-1 overflow-hidden p-3">
            <div className="h-full rounded-xl overflow-hidden" style={{ background: "white" }}>
              <TextEditor docId={id} />
            </div>
          </div>

        </div>

        {/* Middle: Drawing Canvas panel */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>

          {/* Panel header */}
          <div className="flex items-center justify-center py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{
              background: "white", color: "#7c3aed",
              fontSize: "22px", fontWeight: "800",
              padding: "4px 14px", borderRadius: "8px"
            }}>
              Drawing Canvas
            </span>
          </div>

          {/* White drawing area */}
          <div className="flex-1 overflow-hidden p-3">
            <div className="h-full rounded-xl overflow-hidden relative" style={{ background: "white" }}>
              <p style={{
                position: "absolute",
                top: "24px",
                left: "24px",
                fontSize: "16px",
                color: "rgba(0,0,0,0.25)",
                pointerEvents: "none",
                userSelect: "none",
                fontFamily: "'Georgia', serif",
                zIndex: 1,
              }}>
                Draw here...
              </p>
              <DrawingCanvas
                docId={id}
                activeTool={activeTool}
                color={color}
                clearSignal={clearSignal}
                downloadSignal={downloadSignal}
              />
            </div>
          </div>

        </div>

        {/* Right: User Panel */}
        <div className="flex flex-col rounded-2xl overflow-hidden shrink-0"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            width: "220px",
          }}>

          {/* Panel header */}
          <div className="flex items-center justify-center py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{
              background: "white", color: "#7c3aed",
              fontSize: "16px", fontWeight: "800",
              padding: "4px 14px", borderRadius: "8px"
            }}>
              Users
            </span>
          </div>

          {/* User list + activity */}
          <UserPanel users={users} events={events} />

        </div>

      </main>
    </div>
  );
}