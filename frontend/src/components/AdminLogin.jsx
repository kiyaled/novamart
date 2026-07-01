import { useState, useEffect } from "react";

const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";
const ADMIN_PASSWORD = "134416B";

function AdminLogin({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("novamart_admin_unlocked");
    if (saved === "true") setUnlocked(true);
  }, []);

  const handleSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError("");
      sessionStorage.setItem("novamart_admin_unlocked", "true");
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  if (unlocked) return children;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f7ec", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 32px rgba(26,92,42,0.15)", padding: "36px 32px", maxWidth: "380px", width: "100%", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: `linear-gradient(135deg, ${DARK_GREEN}, ${BRIGHT_GREEN})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: "28px" }}>
          🔒
        </div>
        <h2 style={{ margin: "0 0 6px", color: DARK_GREEN, fontSize: "20px", fontWeight: "800" }}>
          Admin Access
        </h2>
        <p style={{ margin: "0 0 22px", color: "#888", fontSize: "13px" }}>
          Enter the admin password to continue
        </p>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "15px",
            border: `2px solid ${error ? "#e53e3e" : "#cde8ba"}`,
            borderRadius: "10px",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "8px",
            textAlign: "center",
            letterSpacing: "2px",
          }}
        />
        {error && (
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#e53e3e", fontWeight: "500" }}>⚠ {error}</p>
        )}

        <button
          onClick={handleSubmit}
          style={{ width: "100%", padding: "12px", background: DARK_GREEN, color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: error ? "0" : "8px" }}
        >
          Unlock
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;