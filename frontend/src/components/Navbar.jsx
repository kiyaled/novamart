import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  // Recalculate cart count every time the page changes
  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      // cart stores grouped items with a qty field
      const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      setCartCount(total);
    };

    updateCount();

    // Also listen for storage changes (when Home.jsx updates cart)
    window.addEventListener("storage", updateCount);
    window.addEventListener("cartUpdated", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, [location]);

  const linkStyle = (path) => ({
    color: location.pathname === path ? BRIGHT_GREEN : "#fff",
    fontWeight: location.pathname === path ? "700" : "500",
    textDecoration: "none",
    fontSize: "15px",
    transition: "color 0.15s",
  });

  return (
    <nav
      style={{
        background: DARK_GREEN,
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "60px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "22px" }}>🌿</span>
        <span style={{ color: "#fff", fontWeight: "800", fontSize: "20px", letterSpacing: "-0.3px" }}>
          Nova <span style={{ color: BRIGHT_GREEN }}>Mart</span>
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>

        {/* Cart link with badge */}
        <Link
          to="/cart"
          style={{ ...linkStyle("/cart"), position: "relative", display: "flex", alignItems: "center", gap: "6px" }}
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
                lineHeight: 1,
              }}
            >
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;