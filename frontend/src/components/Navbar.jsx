import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const linkStyle = (path) => ({
    color: location.pathname === path ? BRIGHT_GREEN : "#fff",
    fontWeight: location.pathname === path ? "700" : "500",
    textDecoration: "none",
    fontSize: "15px",
    transition: "color 0.15s",
    padding: "12px 0",
    display: "block",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  });

  return (
    <>
      {/* Main navbar */}
      <nav
        style={{
          background: DARK_GREEN,
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "60px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "20px" }}>🌿</span>
          <span
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: "18px",
              letterSpacing: "-0.3px",
            }}
          >
            Nova <span style={{ color: BRIGHT_GREEN }}>Mart</span>
          </span>
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
          className="desktop-nav"
        >
          <Link to="/" style={{ ...linkStyle("/"), padding: 0, borderBottom: "none" }}>Home</Link>
          <Link to="/admin" style={{ ...linkStyle("/admin"), padding: 0, borderBottom: "none" }}>Admin</Link>
          <Link
            to="/cart"
            style={{
              ...linkStyle("/cart"),
              padding: 0,
              borderBottom: "none",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🛒</span>
            Cart
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-14px",
                  background: BRIGHT_GREEN,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: "700",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile right side — cart count + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Cart icon always visible on mobile */}
          <Link
            to="/cart"
            style={{
              position: "relative",
              color: location.pathname === "/cart" ? BRIGHT_GREEN : "#fff",
              textDecoration: "none",
              fontSize: "22px",
            }}
            className="mobile-cart"
          >
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-8px",
                  background: BRIGHT_GREEN,
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "700",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
            className="hamburger"
          >
            <span style={{ display: "block", width: "24px", height: "2px", background: menuOpen ? BRIGHT_GREEN : "#fff", borderRadius: "2px", transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ display: "block", width: "24px", height: "2px", background: menuOpen ? "transparent" : "#fff", borderRadius: "2px", transition: "all 0.2s" }} />
            <span style={{ display: "block", width: "24px", height: "2px", background: menuOpen ? BRIGHT_GREEN : "#fff", borderRadius: "2px", transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          style={{
            background: DARK_GREEN,
            padding: "0 20px",
            position: "sticky",
            top: "60px",
            zIndex: 999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <Link to="/" style={linkStyle("/")}>🏠 Home</Link>
          <Link to="/admin" style={linkStyle("/admin")}>⚙️ Admin</Link>
          <Link
            to="/cart"
            style={{ ...linkStyle("/cart"), borderBottom: "none", paddingBottom: "16px" }}
          >
            🛒 Cart {cartCount > 0 && (
              <span style={{ background: BRIGHT_GREEN, color: "#fff", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px", marginLeft: "8px" }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-cart { display: none !important; }
        .hamburger { display: none !important; }

        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .mobile-cart { display: flex !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export default Navbar;