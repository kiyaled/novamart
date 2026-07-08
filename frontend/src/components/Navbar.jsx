import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";
const TELEGRAM_USERNAME = "Natinana111"; // change to your real telegram username

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
    return () => {
      window.removeEventListener("cartUpdated", update);
      window.removeEventListener("storage", update);
    };
  }, [location]);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path;

  // Telegram SVG logo
  const TelegramIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.972 13.59l-2.948-.924c-.64-.203-.654-.64.136-.95l11.527-4.444c.533-.194 1.001.131.875.976z"/>
    </svg>
  );

  return (
    <>
      <nav className="nav">
        {/* Logo + Telegram */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link to="/" className="nav-logo">
            🌿 Nova <span>Minimarket</span>
          </Link>
          {/* Telegram button */}
          <a
            href={`https://t.me/Natinana111`}
            target="_blank"
            rel="noopener noreferrer"
            title="Contact us on Telegram"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#2AABEE",
              flexShrink: 0,
            }}
          >
            <TelegramIcon />
          </a>
        </div>

        {/* Desktop links */}
        {!isMobile && (
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

        {/* Mobile links */}
        {isMobile && (
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
        )}
      </nav>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div className="nav-mobile-menu">
          <Link to="/" className="nav-mobile-link">🏠 Home</Link>
          <Link to="/cart" className="nav-mobile-link">
            🛒 Cart {cartCount > 0 && <span style={{ background: "#6abf3a", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, marginLeft: 6 }}>{cartCount}</span>}
          </Link>
          <a href={`https://t.me/$@Natinana111`} target="_blank" rel="noopener noreferrer" className="nav-mobile-link" style={{ color: "#2AABEE", borderBottom: "none" }}>
            ✈️ Telegram
          </a>
          <Link to="/admin" className="nav-mobile-link" style={{ borderBottom: "none", color: "rgba(255,255,255,.35)", fontSize: 11 }}>⚙️ Admin</Link>
        </div>
      )}
    </>
  );
}