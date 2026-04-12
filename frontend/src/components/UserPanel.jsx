import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function UserPanel({ users, events }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll(".user-item");
    gsap.fromTo(items,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }
    );
  }, [users]);

  return (
    <div className="flex flex-col h-full" style={{ minWidth: "200px", maxWidth: "220px" }}>

      {/* Online users */}
      <div className="p-3 flex flex-col gap-2">
        <p style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>
          Online ({users.length})
        </p>
        <div ref={listRef} className="flex flex-col gap-2">
          {users.map(user => (
            <div key={user.id} className="user-item flex items-center gap-2">
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#4ade80", flexShrink: 0,
                boxShadow: "0 0 6px #4ade80"
              }} />
              <span style={{
                color: "white", fontSize: "13px",
                fontWeight: "500", fontFamily: "Georgia, serif",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {user.name}
              </span>
            </div>
          ))}
          {users.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>No users online</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "0 12px" }} />

      {/* Activity log */}
      <div className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
        <p style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>
          Activity
        </p>
        {events.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>No activity yet</p>
        )}
        {[...events].reverse().map((ev, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span style={{
              fontSize: "12px",
              color: ev.type === "joined"  ? "#4ade80"
                   : ev.type === "left"    ? "#f87171"
                   : "rgba(255,255,255,0.5)",
              fontFamily: "Georgia, serif",
            }}>
              {ev.type === "joined" ? "⬤ " : ev.type === "left" ? "○ " : "· "}
              {ev.message}
            </span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>
              {ev.time}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}