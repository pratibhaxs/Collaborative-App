import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import TextEditor from "../components/TextEditor";
import DrawingCanvas from "../components/DrawingCanvas";
import Toolbar from "../components/Toolbar";
import UserPanel from "../components/UserPanel";
import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/auth";

const socket = io("http://localhost:5000");

export default function EditorPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [activeTool, setActiveTool]         = useState("pen");
  const [color, setColor]                   = useState("#6366f1");
  const [clearSignal, setClearSignal]       = useState(0);
  const [downloadSignal, setDownloadSignal] = useState(0);
  const [users, setUsers]                   = useState([]);
  const [events, setEvents]                 = useState([]);

  const addEvent = (type, message) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit"
    });
    setEvents(prev => [...prev.slice(-19), { type, message, time }]);
  };

  // join socket room using Firebase user name
  useEffect(() => {
    if (!user) return;
    const name = user.displayName || user.email;

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
  }, [id, user]);

  const handleLogout = async () => {
    await logout(user.uid);
    navigate("/login");
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden relative flex flex-col"
      style={{ background: "#a78bfa" }}
    >

      {/* ── Header ── */}
      <header
        className="relative z-10 flex items-center px-6 h-16 shrink-0"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <p className="text-white text-xl font-bold leading-none">
              Collab Editor
            </p>
            <p className="text-white/60 text-sm font-mono mt-1">doc/{id}</p>
          </div>
        </div>

        {/* Toolbar — centered */}
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

        {/* Right side — user info + live dot + logout */}
        <div className="flex items-center gap-4">
          {/* Logged in user */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {user?.displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-white/80 text-sm font-medium">
              {user?.displayName || user?.email}
            </span>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/50 text-xs">Live</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Main split layout ── */}
      <main className="relative z-10 flex flex-1 overflow-hidden gap-3 p-3">

        {/* Left: Text Editor */}
        <div
          className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-center py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span style={{
              background: "white", color: "#7c3aed",
              fontSize: "22px", fontWeight: "800",
              padding: "4px 14px", borderRadius: "8px",
            }}>
              Text Editor
            </span>
          </div>

          {/* White writing area */}
          <div className="flex-1 overflow-hidden p-3">
            <div
              className="h-full rounded-xl overflow-hidden"
              style={{ background: "white" }}
            >
              <TextEditor docId={id} />
            </div>
          </div>
        </div>

        {/* Middle: Drawing Canvas */}
        <div
          className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-center py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span style={{
              background: "white", color: "#7c3aed",
              fontSize: "22px", fontWeight: "800",
              padding: "4px 14px", borderRadius: "8px",
            }}>
              Drawing Canvas
            </span>
          </div>

          {/* White drawing area */}
          <div className="flex-1 overflow-hidden p-3">
            <div
              className="h-full rounded-xl overflow-hidden relative"
              style={{ background: "white" }}
            >
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
        <div
          className="flex flex-col rounded-2xl overflow-hidden shrink-0"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            width: "220px",
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-center py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span style={{
              background: "white", color: "#7c3aed",
              fontSize: "16px", fontWeight: "800",
              padding: "4px 14px", borderRadius: "8px",
            }}>
              Users
            </span>
          </div>

          <UserPanel users={users} events={events} />
        </div>

      </main>
    </div>
  );
}