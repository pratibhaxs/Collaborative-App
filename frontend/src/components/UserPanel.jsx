import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function UserPanel({ users, events }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll(".user-item");
    if (items.length === 0) return;
    gsap.fromTo(items,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }
    );
  }, [users]);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
    }}>

      {/* Online users section */}
      <div style={{
        padding: "12px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <p style={{
          color: "white", fontWeight: "700",
          fontSize: "13px", marginBottom: "10px", margin: "0 0 10px 0",
        }}>
          Online ({users.length})
        </p>

        <div
          ref={listRef}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          {users.length === 0 && (
            <p style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "12px", margin: 0,
            }}>
              No users online
            </p>
          )}

          {users.map(user => (
            <div
              key={user.id}
              className="user-item"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {/* Avatar */}
              <div style={{
                width: "28px", height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "11px", fontWeight: "700",
                flexShrink: 0,
              }}>
                {user.name?.[0]?.toUpperCase() || "?"}
              </div>

              {/* Name */}
              <p style={{
                color: "white", fontSize: "12px",
                fontWeight: "600", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", maxWidth: "120px",
              }}>
                {user.name}
              </p>

              {/* Online dot */}
              <div style={{
                width: "7px", height: "7px",
                borderRadius: "50%",
                background: "#4ade80",
                marginLeft: "auto", flexShrink: 0,
                boxShadow: "0 0 5px #4ade80",
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Activity log section */}
      <div style={{
        flex: 1, padding: "12px",
        overflowY: "auto",
        display: "flex", flexDirection: "column", gap: "6px",
      }}>
        <p style={{
          color: "white", fontWeight: "700",
          fontSize: "13px", margin: "0 0 6px 0",
        }}>
          Activity
        </p>

        {events.length === 0 && (
          <p style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "12px", margin: 0,
          }}>
            No activity yet
          </p>
        )}

        {[...events].reverse().map((ev, i) => (
          <div key={i} style={{ marginBottom: "4px" }}>
            <span style={{
              fontSize: "11px",
              color: ev.type === "joined" ? "#4ade80"
                   : ev.type === "left"   ? "#f87171"
                   : "rgba(255,255,255,0.4)",
            }}>
              {ev.type === "joined" ? "⬤ "
               : ev.type === "left" ? "○ "
               : "· "}
              {ev.message}
            </span>
            <p style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.25)",
              margin: "2px 0 0 0",
            }}>
              {ev.time}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}