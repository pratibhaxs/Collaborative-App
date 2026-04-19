import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateDocText,
  listenDocText,
  updateCursor,
  removeCursor,
  listenCursors,
  setTypingStatus,
  listenTyping,
} from "../firebase/database";

// assign a random color to each user
const USER_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

const getColor = (uid) => {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

export default function TextEditor({ docId }) {
  const { user }                      = useAuth();
  const [text, setText]               = useState("");
  const [cursors, setCursors]         = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [status, setStatus]           = useState("loading");

  const textareaRef   = useRef(null);
  const isRemote      = useRef(false);
  const typingTimer   = useRef(null);
  const saveTimer     = useRef(null);
  const myColor       = useRef(user ? getColor(user.uid) : "#6366f1");

  // ── Load text from Firebase on mount ─────────────────────
  useEffect(() => {
    if (!docId) return;
    setStatus("loading");

    const unsub = listenDocText(docId, (val) => {
      // only update if change came from another user
      if (isRemote.current) {
        setText(val);
        isRemote.current = false;
      } else if (status === "loading") {
        setText(val);
        setStatus("saved");
      }
    });

    setStatus("saved");
    return () => unsub();
  }, [docId]);

  // ── Listen for other users cursors ────────────────────────
  useEffect(() => {
    if (!docId || !user) return;
    const unsub = listenCursors(docId, (allCursors) => {
      // filter out own cursor
      setCursors(allCursors.filter(c => c.uid !== user.uid));
    });
    return () => {
      unsub();
      removeCursor(docId, user.uid);
    };
  }, [docId, user]);

  // ── Listen for typing indicators ──────────────────────────
  useEffect(() => {
    if (!docId || !user) return;
    const unsub = listenTyping(docId, (typing) => {
      setTypingUsers(typing.filter(t => t.uid !== user.uid));
    });
    return () => {
      unsub();
      setTypingStatus(docId, user.uid, user.displayName, false);
    };
  }, [docId, user]);

  // ── Debounced save to Firebase ────────────────────────────
  const triggerSave = useCallback((value) => {
    setStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateDocText(docId, value);
      setStatus("saved");
    }, 1000); // save 1 second after typing stops
  }, [docId]);

  // ── Handle typing ─────────────────────────────────────────
  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    isRemote.current = false;
    triggerSave(val);

    // typing indicator — show for 2s after last keystroke
    if (user) {
      setTypingStatus(docId, user.uid, user.displayName, true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        setTypingStatus(docId, user.uid, user.displayName, false);
      }, 2000);
    }
  };

  // ── Track cursor position ─────────────────────────────────
  const handleCursorMove = () => {
    if (!textareaRef.current || !user) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    updateCursor(docId, user.uid, {
      uid:   user.uid,
      name:  user.displayName || user.email,
      color: myColor.current,
      start: selectionStart,
      end:   selectionEnd,
    });
  };

  // ── Clear All ─────────────────────────────────────────────
  const handleClearAll = async () => {
    setText("");
    await updateDocText(docId, "");
    setStatus("saved");
    textareaRef.current?.focus(); // focus back to textarea
  };

  // ── Get cursor pixel position from character index ────────
  const getCursorCoords = (index) => {
    const textarea = textareaRef.current;
    if (!textarea) return { top: 0, left: 0 };

    const style     = window.getComputedStyle(textarea);
    const lineHeight = parseInt(style.lineHeight) || 20;
    const paddingLeft = parseInt(style.paddingLeft) || 0;
    const paddingTop  = parseInt(style.paddingTop)  || 0;
    const charWidth   = 8; // approximate char width

    const textBefore = text.slice(0, index);
    const lines      = textBefore.split("\n");
    const lineNum    = lines.length - 1;
    const charNum    = lines[lines.length - 1].length;

    return {
      top:  paddingTop  + lineNum * lineHeight,
      left: paddingLeft + charNum * charWidth,
    };
  };

  const charCount = text.length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const statusColor = {
    loading: "#aaa",
    saving:  "#f59e0b",
    saved:   "#10b981",
    error:   "#ef4444",
  };

  const statusLabel = {
    loading: "loading…",
    saving:  "saving…",
    saved:   "saved",
    error:   "error",
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div style={{
          padding: "4px 16px",
          fontSize: "12px",
          color: "#888",
          fontStyle: "italic",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafafa",
        }}>
          {typingUsers.map(u => u.name).join(", ")}
          {typingUsers.length === 1 ? " is" : " are"} typing...
        </div>
      )}

      {/* Editor area with cursor overlay */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          onSelect={handleCursorMove}
          placeholder="Write here..."
          disabled={status === "loading"}
          spellCheck
          style={{
            width: "100%",
            height: "100%",
            padding: "24px",
            border: "none",
            outline: "none",
            resize: "none",
            background: "transparent",
            fontSize: "15px",
            lineHeight: "1.8",
            color: "#1f1f1f",
            fontFamily: "'Georgia', serif",
            caretColor: myColor.current,
            position: "relative",
            zIndex: 1,
          }}
        />

        {/* Cursor overlay — shows other users cursors */}
        <div style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}>
          {cursors.map(cursor => {
            const coords = getCursorCoords(cursor.start);
            return (
              <div
                key={cursor.uid}
                style={{
                  position: "absolute",
                  top:  `${coords.top}px`,
                  left: `${coords.left}px`,
                  transition: "top 0.1s, left 0.1s", // smooth cursor movement
                }}
              >
                {/* Cursor line */}
                <div style={{
                  width: "2px",
                  height: "20px",
                  background: cursor.color,
                  borderRadius: "1px",
                }} />
                {/* Name label */}
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  left: "0px",
                  background: cursor.color,
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                  fontFamily: "sans-serif",
                }}>
                  {cursor.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "8px 16px",
        borderTop: "1px solid #f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fafafa",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Clear All button */}
          <button
            onClick={handleClearAll}
            style={{
              padding: "4px 12px",
              borderRadius: "6px",
              border: "1px solid #fca5a5",
              background: "#fef2f2",
              color: "#dc2626",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Clear All
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: "#bbb", fontFamily: "monospace" }}>
            {charCount} chars · {wordCount} words
          </span>
          <span style={{
            fontSize: "11px",
            fontFamily: "monospace",
            color: statusColor[status],
          }}>
            {statusLabel[status]}
          </span>
        </div>
      </div>

    </div>
  );
}