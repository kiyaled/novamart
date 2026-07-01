import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      setCartCount(total);
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("cartUpdated", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, [location]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const activeLinkColor = (path) =>
    location.pathname === path ? BRIGHT_GREEN : "#fff";

  return (
    <>
      <nav
        style={{
          background: DARK_GREEN,
          padding: "0 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "56px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "18px" }}>🌿</span>
          <span style={{ color: "#fff", fontWeight: "800", fontSize: "16px" }}>
            Nova <span style={{ color: BRIGHT_GREEN }}>Mart</span>
          </span>
        </Link>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link to="/" style={{ color: activeLinkColor("/"), fontWeight: location.pathname === "/" ? "700" : "500", textDecoration: "none", fontSize: "14px" }}>
              Home
            </Link>
            <Link to="/cart" style={{ color: activeLinkColor("/cart"), fontWeight: location.pathname === "/cart" ? "700" : "500", textDecoration: "none", fontSize: "14px", position: "relative", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "17px" }}>🛒</span>
              Cart
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: "-7px", right: "-12px", background: BRIGHT_GREEN, color: "#fff", fontSize: "10px", fontWeight: "700", width: "17px", height: "17px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            <Link to="/admin" title="Admin" style={{ color: location.pathname === "/admin" ? BRIGHT_GREEN : "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "15px" }}>
              ⚙️
            </Link>
          </div>
        )}

        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/cart" style={{ position: "relative", color: activeLinkColor("/cart"), textDecoration: "none", fontSize: "19px" }}>
              🛒
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: "-5px", right: "-7px", background: BRIGHT_GREEN, color: "#fff", fontSize: "9px", fontWeight: "700", width: "15px", height: "15px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ display: "block", width: "20px", height: "2px", background: menuOpen ? BRIGHT_GREEN : "#fff", borderRadius: "2px", transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
              <span style={{ display: "block", width: "20px", height: "2px", background: menuOpen ? "transparent" : "#fff", borderRadius: "2px", transition: "all 0.2s" }} />
              <span style={{ display: "block", width: "20px", height: "2px", background: menuOpen ? BRIGHT_GREEN : "#fff", borderRadius: "2px", transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
            </button>
          </div>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div style={{ background: DARK_GREEN, padding: "8px 16px 12px", position: "sticky", top: "56px", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          <Link to="/" style={{ display: "block", padding: "10px 0", color: "#fff", textDecoration: "none", fontSize: "14px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            🏠 Home
          </Link>
          <Link to="/cart" style={{ display: "block", padding: "10px 0", color: "#fff", textDecoration: "none", fontSize: "14px" }}>
            🛒 Cart{" "}
            {cartCount > 0 && (
              <span style={{ background: BRIGHT_GREEN, color: "#fff", fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "999px", marginLeft: "6px" }}>
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/admin" style={{ display: "block", padding: "8px 0 0", color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "11px" }}>
            ⚙️ Admin
          </Link>
        </div>
      )}
    </>
  );
}

export default Navbar;