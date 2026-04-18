import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/auth";
import { listenActiveUsers } from "../firebase/database";

export default function DashboardPage() {
  const { user }                      = useAuth();
  const navigate                      = useNavigate();
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = listenActiveUsers((users) => {
      setActiveUsers(users);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout(user.uid);
    navigate("/login");
  };

  const openDoc = (id) => navigate(`/doc/${id}`);

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div style={styles.logo}>C</div>
        <p style={styles.appName}>Collab Editor</p>
        <div style={{ flex: 1 }} />
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.displayName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p style={styles.userName}>{user?.displayName}</p>
            <p style={styles.userEmail}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.welcome}>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {user?.displayName?.split(" ")[0]} 👋
          </h1>
          <p style={styles.welcomeSub}>
            Pick a document to start collaborating
          </p>
        </div>

        <div style={styles.grid}>

          {/* Open a doc */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Open Document</h2>
            <p style={styles.cardSub}>Click a document to start editing</p>
            <div style={styles.docRow}>
              {["1", "2", "3", "team", "notes"].map(id => (
                <button
                  key={id}
                  onClick={() => openDoc(id)}
                  style={styles.docBtn}
                >
                  doc/{id}
                </button>
              ))}
            </div>
          </div>

          {/* Active users */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              Users Currently Online
              <span style={styles.badge}>{activeUsers.length}</span>
            </h2>
            <p style={styles.cardSub}>Updates in real-time</p>
            <div style={styles.userList}>
              {activeUsers.length === 0 && (
                <p style={{ color: "#aaa", fontSize: "14px" }}>
                  No users online
                </p>
              )}
              {activeUsers.map(u => (
                <div key={u.uid} style={styles.userRow}>
                  <div style={styles.userAvatar}>
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p style={styles.uName}>{u.name}</p>
                    <p style={styles.uEmail}>{u.email}</p>
                  </div>
                  <div style={styles.onlineDot} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

const styles = {
  shell:   { minHeight: "100vh", background: "#a78bfa" },
  header:  {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "16px 32px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  },
  logo: {
    width: "40px", height: "40px", borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontSize: "18px", fontWeight: "800",
  },
  appName:   { color: "white", fontWeight: "800", fontSize: "18px", margin: 0 },
  userInfo:  { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: "700", fontSize: "14px",
  },
  userName:  { color: "white", fontWeight: "600", fontSize: "14px", margin: 0 },
  userEmail: { color: "rgba(255,255,255,0.6)", fontSize: "12px", margin: 0 },
  logoutBtn: {
    padding: "8px 18px", borderRadius: "10px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "white", fontWeight: "600", fontSize: "13px",
    cursor: "pointer",
  },
  main:         { padding: "32px", maxWidth: "1000px", margin: "0 auto" },
  welcome:      { marginBottom: "28px" },
  welcomeTitle: { color: "white", fontSize: "28px", fontWeight: "800", margin: 0 },
  welcomeSub:   { color: "rgba(255,255,255,0.7)", fontSize: "15px", marginTop: "6px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: {
    background: "white", borderRadius: "20px",
    padding: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    fontSize: "17px", fontWeight: "800", color: "#1f1f1f",
    margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px",
  },
  cardSub:  { fontSize: "13px", color: "#999", marginBottom: "16px" },
  badge: {
    background: "#6366f1", color: "white",
    fontSize: "12px", fontWeight: "700",
    padding: "2px 8px", borderRadius: "20px",
  },
  docRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  docBtn: {
    padding: "8px 16px", borderRadius: "10px",
    background: "#f3f0ff", border: "1.5px solid #c4b5fd",
    color: "#6366f1", fontWeight: "600", fontSize: "13px",
    cursor: "pointer",
  },
  userList: { display: "flex", flexDirection: "column", gap: "12px" },
  userRow: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px", borderRadius: "10px", background: "#f9f9f9",
  },
  userAvatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: "700", fontSize: "14px", flexShrink: 0,
  },
  uName:     { fontSize: "14px", fontWeight: "600", color: "#1f1f1f", margin: 0 },
  uEmail:    { fontSize: "12px", color: "#999", margin: 0 },
  onlineDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#4ade80", marginLeft: "auto",
    boxShadow: "0 0 6px #4ade80",
  },
};