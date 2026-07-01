import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Home.css";

const API = "https://novamart-backend.vercel.app";
const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";

const CATEGORIES = [
  "All", "Dairy", "Bakery", "Beverages", "Snacks",
  "Fruits & Vegetables", "Meat", "Frozen", "Other",
];

const SUB_TAGS = {
  Dairy: ["Fresh Milk", "Cheese", "Yogurt", "Butter", "Cream", "Eggs"],
  Bakery: ["Bread", "Cake", "Biscuits", "Pastry", "Rolls"],
  Beverages: ["Juice", "Water", "Soda", "Tea", "Coffee", "Energy Drink"],
  Snacks: ["Chips", "Nuts", "Chocolate", "Candy", "Popcorn"],
  "Fruits & Vegetables": ["Fruits", "Leafy Greens", "Root Vegetables", "Herbs", "Peppers"],
  Meat: ["Beef", "Chicken", "Fish", "Lamb", "Sausage"],
  Frozen: ["Frozen Meals", "Ice Cream", "Frozen Vegetables", "Frozen Meat"],
  Other: [],
};

const SUPERMARKET_BG = "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=75";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function isOutOfStock(stock) {
  return stock !== undefined && stock !== null && Number(stock) === 0;
}

function salePrice(price, discount) {
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubTag, setActiveSubTag] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [addedId, setAddedId] = useState(null);
  const [descOpenId, setDescOpenId] = useState(null);
  const isMobile = useIsMobile();
  const searchBoxRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/api/products`).then((res) => setProducts(res.data)).catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCategoryChange = (cat) => { setActiveCategory(cat); setActiveSubTag(null); };
  const getQty = (id) => quantities[id] || 1;

  const changeQty = (id, delta, maxStock) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = current + delta;
      if (next < 1) return prev;
      if (maxStock !== undefined && maxStock !== null && next > Number(maxStock)) return prev;
      return { ...prev, [id]: next };
    });
  };

  const addToCart = (product) => {
    const qty = getQty(product._id);
    try {
      const raw = localStorage.getItem("cart");
      let cart = raw ? JSON.parse(raw) : [];
      const existingIndex = cart.findIndex((item) => item._id === product._id);
      const priceToUse = salePrice(product.price, product.discount);
      if (existingIndex >= 0) {
        cart[existingIndex] = { ...cart[existingIndex], qty: (Number(cart[existingIndex].qty) || 1) + qty };
      } else {
        cart.push({ ...product, price: priceToUse, qty });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (e) {
      console.error("Cart error:", e);
    }
    setQuantities((prev) => ({ ...prev, [product._id]: 1 }));
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const promoProducts = useMemo(() => products.filter((p) => p.discount && Number(p.discount) > 0), [products]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q)).slice(0, 6);
  }, [search, products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSubTag =
        !activeSubTag ||
        p.name.toLowerCase().includes(activeSubTag.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(activeSubTag.toLowerCase()) ||
        (p.subCategory || "").toLowerCase().includes(activeSubTag.toLowerCase());
      return matchesSearch && matchesCategory && matchesSubTag;
    });
  }, [products, search, activeCategory, activeSubTag]);

  const subTags = SUB_TAGS[activeCategory] || [];

  const heroPadding = isMobile ? "22px 14px 18px" : "44px 20px 40px";
  const heroTitle = isMobile ? "21px" : "36px";
  const gridCols = isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(220px, 1fr))";
  const gridGap = isMobile ? "10px" : "18px";
  const imgHeight = isMobile ? "100px" : "190px";
  const cardPadding = isMobile ? "8px" : "14px";
  const cardTitleSize = isMobile ? "12px" : "16px";
  const priceSize = isMobile ? "12px" : "17px";
  const btnPadding = isMobile ? "7px 4px" : "10px 15px";
  const btnFontSize = isMobile ? "11px" : "14px";
  const qtyBtnSize = isMobile ? "26px" : "40px";
  const qtyHeight = isMobile ? "26px" : "38px";
  const qtyFontSize = isMobile ? "14px" : "20px";
  const outerPadding = isMobile ? "12px" : "24px 20px";

  const ProductCard = ({ product, compact }) => {
    const outOfStock = isOutOfStock(product.stock);
    const qty = getQty(product._id);
    const maxStock = (product.stock !== undefined && product.stock !== null) ? Number(product.stock) : 999;
    const hasDiscount = product.discount && Number(product.discount) > 0;
    const finalPrice = salePrice(product.price, product.discount);
    const descOpen = descOpenId === product._id;

    return (
      <div style={{ border: "1px solid #d4edba", borderRadius: isMobile ? "10px" : "12px", overflow: "hidden", textAlign: "center", boxShadow: "0 2px 8px rgba(26,92,42,0.08)", display: "flex", flexDirection: "column", background: "#fff", width: compact ? (isMobile ? "130px" : "160px") : "auto", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <img
            src={product.image || "https://placehold.co/300x200?text=No+Image"}
            alt={product.name}
            style={{ width: "100%", height: compact ? (isMobile ? "75px" : "100px") : imgHeight, objectFit: "cover", display: "block" }}
            onError={(e) => { e.target.src = "https://placehold.co/300x200?text=No+Image"; }}
          />
          {hasDiscount && (
            <span style={{ position: "absolute", top: "4px", right: "4px", background: "#dc2626", color: "#fff", fontSize: isMobile ? "9px" : "11px", fontWeight: "800", padding: "2px 6px", borderRadius: "6px" }}>
              -{product.discount}%
            </span>
          )}
          {!hasDiscount && product.stock <= 5 && product.stock > 0 && (
            <span style={{ position: "absolute", top: "4px", left: "4px", background: "#fef3c7", color: "#92400e", fontSize: "9px", fontWeight: "600", padding: "2px 6px", borderRadius: "999px" }}>
              {product.stock} left
            </span>
          )}
          {outOfStock && (
            <span style={{ position: "absolute", top: "4px", left: "4px", background: "#fee2e2", color: "#991b1b", fontSize: "9px", fontWeight: "600", padding: "2px 6px", borderRadius: "999px" }}>
              Out of stock
            </span>
          )}
        </div>

        <div style={{ padding: compact ? "6px" : cardPadding, flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {!compact && product.category && (
            <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: BRIGHT_GREEN }}>
              {product.category}
            </span>
          )}
          <h3 style={{ margin: 0, fontSize: compact ? (isMobile ? "10px" : "13px") : cardTitleSize, color: DARK_GREEN, lineHeight: 1.25, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {product.name}
          </h3>

          {!compact && product.description && (
            <>
              <button
                onClick={() => setDescOpenId(descOpen ? null : product._id)}
                style={{ background: "none", border: "none", color: BRIGHT_GREEN, fontSize: isMobile ? "10px" : "11px", fontWeight: "600", cursor: "pointer", padding: 0, textAlign: "center", textDecoration: "underline" }}
              >
                {descOpen ? "Hide details ▲" : "ℹ️ Details"}
              </button>
              {descOpen && (
                <p style={{ margin: "2px 0 0", color: "#777", fontSize: isMobile ? "10px" : "12px", lineHeight: "1.4", background: "#f9faf7", padding: "6px", borderRadius: "6px" }}>
                  {product.description}
                </p>
              )}
            </>
          )}

          <div>
            {hasDiscount && (
              <p style={{ margin: 0, fontSize: isMobile ? "9px" : "12px", color: "#aaa", textDecoration: "line-through" }}>
                ETB {Number(product.price).toLocaleString()}
              </p>
            )}
            <strong style={{ color: hasDiscount ? "#dc2626" : DARK_GREEN, fontSize: compact ? (isMobile ? "10px" : "13px") : priceSize }}>
              ETB {Number(finalPrice).toLocaleString()}
            </strong>
          </div>

          {!outOfStock && (
            <div style={{ display: "flex", alignItems: "center", margin: "2px 0 0", border: "1.5px solid #cde8ba", borderRadius: "6px", overflow: "hidden" }}>
              <button onClick={() => changeQty(product._id, -1, maxStock)} style={{ width: qtyBtnSize, height: qtyHeight, border: "none", background: qty <= 1 ? "#f5f5f5" : "#f0f7ec", color: qty <= 1 ? "#bbb" : DARK_GREEN, fontSize: qtyFontSize, fontWeight: "700", cursor: qty <= 1 ? "not-allowed" : "pointer", lineHeight: 1, flexShrink: 0 }}>−</button>
              <span style={{ flex: 1, textAlign: "center", fontWeight: "700", fontSize: isMobile ? "12px" : "16px", color: DARK_GREEN, borderLeft: "1px solid #cde8ba", borderRight: "1px solid #cde8ba", height: qtyHeight, lineHeight: qtyHeight }}>
                {qty}
              </span>
              <button onClick={() => changeQty(product._id, +1, maxStock)} style={{ width: qtyBtnSize, height: qtyHeight, border: "none", background: qty >= maxStock ? "#f5f5f5" : "#f0f7ec", color: qty >= maxStock ? "#bbb" : DARK_GREEN, fontSize: qtyFontSize, fontWeight: "700", cursor: qty >= maxStock ? "not-allowed" : "pointer", lineHeight: 1, flexShrink: 0 }}>+</button>
            </div>
          )}

          <button
            onClick={() => addToCart(product)}
            disabled={outOfStock}
            style={{ marginTop: "4px", padding: btnPadding, border: "none", borderRadius: "6px", cursor: outOfStock ? "not-allowed" : "pointer", background: addedId === product._id ? BRIGHT_GREEN : outOfStock ? "#ccc" : DARK_GREEN, color: "#fff", fontWeight: "600", fontSize: btnFontSize, transition: "background 0.2s" }}
          >
            {outOfStock ? "Out of stock" : addedId === product._id ? "✓ Added" : "🛒 Add to Cart"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <div style={{ position: "relative", padding: heroPadding, textAlign: "center", overflow: "hidden", minHeight: isMobile ? "150px" : "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={SUPERMARKET_BG} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,61,28,0.82) 0%, rgba(26,92,42,0.72) 55%, rgba(45,122,58,0.65) 100%)" }} />
        <div style={{ position: "relative", color: "#fff", width: "100%" }}>
          <p style={{ margin: "0 0 4px", fontSize: isMobile ? "10px" : "13px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#d8f5b8", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
            🌿 {getGreeting()}, Welcome to
          </p>
          <h1 style={{ margin: "0 0 4px", fontSize: heroTitle, fontWeight: "900", letterSpacing: "-0.5px", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            Nova Milk &amp; Mart
          </h1>
          <p style={{ margin: "0 0 12px", fontSize: isMobile ? "11px" : "14px", color: "#e8f9d4", fontStyle: "italic", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
            Fresh Milk · Quality Products · Better Life
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
            {["🥛 Fresh Milk", "🛒 Groceries", "⭐ Quality", "😊 Service"].map((item) => (
              <span key={item} style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "999px", padding: isMobile ? "3px 8px" : "5px 14px", fontSize: isMobile ? "9px" : "12px", fontWeight: "600" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: outerPadding, maxWidth: "1200px", margin: "0 auto" }}>

        <div ref={searchBoxRef} style={{ position: "relative", marginBottom: "12px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
          <input
            type="text"
            placeholder="Search products instantly..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            style={{ width: "100%", padding: isMobile ? "10px 36px" : "12px 44px", fontSize: isMobile ? "14px" : "15px", border: "1.5px solid #cde8ba", borderRadius: "12px", outline: "none", boxSizing: "border-box", backgroundColor: "#fff" }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setShowSuggestions(false); }} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#888" }}>✕</button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #cde8ba", borderRadius: "12px", boxShadow: "0 8px 24px rgba(26,92,42,0.15)", zIndex: 50, overflow: "hidden" }}>
              {suggestions.map((p) => (
                <div key={p._id} onClick={() => { setSearch(p.name); setShowSuggestions(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f0f7ec" }}>
                  <img src={p.image || "https://placehold.co/40x40?text=Item"} alt={p.name} style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "6px" }} onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Item"; }} />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: DARK_GREEN }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{p.category}</p>
                  </div>
                  <strong style={{ fontSize: "12px", color: DARK_GREEN }}>ETB {Number(salePrice(p.price, p.discount)).toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {promoProducts.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: isMobile ? "16px" : "20px" }}>🔥</span>
              <h2 style={{ margin: 0, fontSize: isMobile ? "14px" : "18px", color: "#dc2626", fontWeight: "800" }}>Today's Promotions</h2>
            </div>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" }}>
              {promoProducts.map((p) => <ProductCard key={p._id} product={p} compact />)}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap", marginBottom: "10px", overflowX: "auto", paddingBottom: "4px" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => handleCategoryChange(cat)} style={{ padding: isMobile ? "5px 10px" : "7px 16px", borderRadius: "999px", border: "1.5px solid", borderColor: activeCategory === cat ? DARK_GREEN : "#cde8ba", background: activeCategory === cat ? DARK_GREEN : "#fff", color: activeCategory === cat ? "#fff" : DARK_GREEN, fontWeight: "500", fontSize: isMobile ? "11px" : "13px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {cat}
            </button>
          ))}
        </div>

        {subTags.length > 0 && (
          <div style={{ background: "#f0f7ec", border: "1px solid #cde8ba", borderRadius: "12px", padding: "10px 12px", marginBottom: "12px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: "600", color: DARK_GREEN, textTransform: "uppercase", letterSpacing: "0.07em" }}>Filter by type:</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {subTags.map((tag) => (
                <button key={tag} onClick={() => setActiveSubTag(activeSubTag === tag ? null : tag)} style={{ padding: isMobile ? "4px 10px" : "5px 14px", borderRadius: "999px", border: "1.5px solid", borderColor: activeSubTag === tag ? BRIGHT_GREEN : "#b8dda0", background: activeSubTag === tag ? BRIGHT_GREEN : "#fff", color: activeSubTag === tag ? "#fff" : DARK_GREEN, fontWeight: "500", fontSize: isMobile ? "11px" : "12px", cursor: "pointer" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
          {filtered.length === 0 ? "No products found" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}${activeCategory !== "All" ? ` in ${activeCategory}` : ""}${activeSubTag ? ` › ${activeSubTag}` : ""}${search ? ` for "${search}"` : ""}`}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: gridGap }}>
          {filtered.map((product) => <ProductCard key={product._id} product={product} compact={false} />)}
        </div>

        {filtered.length === 0 && products.length > 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#888" }}>
            <p style={{ fontSize: "32px", margin: "0 0 8px" }}>😕</p>
            <p style={{ fontSize: "16px", marginBottom: "1rem" }}>No products match your search.</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); setActiveSubTag(null); }} style={{ padding: "9px 20px", borderRadius: "8px", border: `1.5px solid ${DARK_GREEN}`, background: "#fff", cursor: "pointer", fontSize: "14px", color: DARK_GREEN, fontWeight: "500" }}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div style={{ background: DARK_GREEN, color: "#c8f0a8", textAlign: "center", padding: "16px", fontSize: "13px", marginTop: "40px" }}>
        🌿 Nova Milk &amp; Mart — Fresh Milk. Quality Products. Better Life.
      </div>
    </>
  );
}

export default Home;