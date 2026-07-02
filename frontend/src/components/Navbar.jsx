import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const location = useLocation();

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((s, i) => s + (i.qty || 1), 0));
    };
    update();
    window.addEventListener("cartUpdated", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("cartUpdated", update); window.removeEventListener("storage", update); };
  }, [location]);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-logo">
          🌿 Nova <span>Mart</span>
        </Link>

        {isMobile ? (
          <div className="nav-right">
            <Link to="/cart" className="nav-cart-wrap">
              <span className="nav-cart-icon">🛒</span>
              {cartCount > 0 && <span className="nav-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
            </Link>
            <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="nav-bar" style={{ transform: menuOpen ? "rotate(45deg) translate(4px,4px)" : "none", background: menuOpen ? "#6abf3a" : "#fff" }} />
              <span className="nav-bar" style={{ opacity: menuOpen ? 0 : 1 }} />
              <span className="nav-bar" style={{ transform: menuOpen ? "rotate(-45deg) translate(4px,-4px)" : "none", background: menuOpen ? "#6abf3a" : "#fff" }} />
            </button>
          </div>
        ) : (
          <div className="nav-desktop">
            <Link to="/" className={`nav-link${isActive("/") ? " active" : ""}`}>Home</Link>
            <Link to="/cart" className={`nav-link nav-cart-wrap${isActive("/cart") ? " active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span className="nav-cart-icon" style={{ fontSize: 17 }}>🛒</span>
              Cart
              {cartCount > 0 && <span className="nav-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
            </Link>
            <Link to="/admin" title="Admin" className="nav-gear">⚙️</Link>
          </div>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div className="nav-mobile-menu">
          <Link to="/" className="nav-mobile-link">🏠 Home</Link>
          <Link to="/cart" className="nav-mobile-link">
            🛒 Cart {cartCount > 0 && <span style={{ background: "#6abf3a", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, marginLeft: 6 }}>{cartCount}</span>}
          </Link>
          <Link to="/admin" className="nav-mobile-link" style={{ borderBottom: "none" }}>⚙️ Admin</Link>
        </div>
      )}
    </>
  );
}