import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
const API = "http://localhost:5000/api";

export default function TextEditor({ docId }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("loading");  // loading | saved | saving
  const isRemoteChange = useRef(false);
  const saveTimer = useRef(null);

  // load document when docId changes
  useEffect(() => {
    setStatus("loading");

    fetch(`${API}/documents/${docId}`)
      .then((res) => res.json())
      .then((data) => {
        setText(data.document.content);
        setStatus("saved");
      })
      .catch(() => setStatus("error"));
  }, [docId]);

  // socket — join room and listen for changes
  useEffect(() => {
    socket.emit("join-room", docId);

    socket.on("receive-changes", (content) => {
      isRemoteChange.current = true;
      setText(content);
    });

    return () => {
      socket.emit("leave-room", docId);
      socket.off("receive-changes");
    };
  }, [docId]);

  // auto-save every 3 seconds after typing stops
  const triggerAutoSave = (content) => {
    setStatus("saving");
    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        await fetch(`${API}/documents/${docId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 3000);  // saves 3 seconds after user stops typing
  };

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    if (!isRemoteChange.current) {
      socket.emit("send-changes", { docId, content: newText });
      triggerAutoSave(newText);
    }

    isRemoteChange.current = false;
  };

  const handleClear = () => {
    setText("");
    socket.emit("send-changes", { docId, content: "" });
    triggerAutoSave("");
  };

  const charCount = text.length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const statusLabel = {
    loading : "loading…",
    saving  : "saving…",
    saved   : "saved",
    error   : "save failed",
  };

  return (
     <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <textarea
        style={{ ...styles.textarea, flex: 1, minHeight: 0 }}
        value={text}
        onChange={handleChange}
        placeholder={`Writing document #${docId}…`}
        spellCheck
      />
      <div style={styles.footer}>
        {/* existing footer */}
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f4f0",
    padding: "2rem 1rem",
    fontFamily: "'Lora', Georgia, serif",
  },
  card: {
    width: "100%",
    maxWidth: 640,
    background: "#fff",
    borderRadius: 12,
    border: "0.5px solid #d5d3cc",
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderBottom: "0.5px solid #e4e3de",
    background: "#f9f8f5",
  },
  dots: { display: "flex", gap: 6 },
  dot: {
    width: 10, height: 10,
    borderRadius: "50%",
    background: "#cccbc5",
    display: "inline-block",
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#999",
    letterSpacing: "0.08em",
  },
  meta: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#aaa",
  },
  textarea: {
    width: "100%",
    minHeight: 320,
    padding: "28px 32px",
    border: "none",
    outline: "none",
    resize: "none",
    background: "transparent",
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 16,
    lineHeight: 1.85,
    color: "#1a1a18",
    letterSpacing: "0.01em",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderTop: "0.5px solid #e4e3de",
    background: "#f9f8f5",
  },
  btn: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    padding: "5px 12px",
    borderRadius: 6,
    border: "0.5px solid #ccc",
    background: "transparent",
    color: "#666",
    cursor: "pointer",
    letterSpacing: "0.05em",
  },
};
