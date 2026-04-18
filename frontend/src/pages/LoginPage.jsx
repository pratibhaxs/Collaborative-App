import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../firebase/auth";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found":    return "No account found with this email.";
      case "auth/wrong-password":    return "Incorrect password.";
      case "auth/invalid-email":     return "Invalid email address.";
      case "auth/too-many-requests": return "Too many attempts. Try again later.";
      default:                       return "Login failed. Please try again.";
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.logo}>C</div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to Collab Editor</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "#a78bfa",
  },
  card: {
    background: "white", borderRadius: "20px",
    padding: "40px", width: "100%", maxWidth: "400px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
  },
  logo: {
    width: "48px", height: "48px", borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontSize: "22px", fontWeight: "800",
  },
  title:    { fontSize: "24px", fontWeight: "800", color: "#1f1f1f", margin: 0 },
  subtitle: { fontSize: "14px", color: "#888", margin: 0 },
  error: {
    width: "100%", background: "#fef2f2", border: "1px solid #fca5a5",
    color: "#dc2626", padding: "10px 14px", borderRadius: "10px", fontSize: "13px",
  },
  form:  { width: "100%", display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#555" },
  input: {
    padding: "10px 14px", borderRadius: "10px",
    border: "1.5px solid #e5e7eb", fontSize: "14px",
    outline: "none", transition: "border 0.2s",
  },
  btn: {
    padding: "12px", borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white", fontWeight: "700", fontSize: "15px",
    border: "none", cursor: "pointer", marginTop: "4px",
  },
  footer: { fontSize: "13px", color: "#888" },
  link:   { color: "#6366f1", fontWeight: "600", textDecoration: "none" },
};