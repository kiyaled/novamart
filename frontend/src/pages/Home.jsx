import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function isOutOfStock(stock) {
  return stock !== undefined && stock !== null && Number(stock) === 0;
}

// ── Detect mobile ──
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
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubTag, setActiveSubTag] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [addedId, setAddedId] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    axios
      .get("https://novamart-backend.vercel.app/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveSubTag(null);
  };

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
      if (existingIndex >= 0) {
        cart[existingIndex] = {
          ...cart[existingIndex],
          qty: (Number(cart[existingIndex].qty) || 1) + qty,
        };
      } else {
        cart.push({ ...product, qty });
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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || p.category === activeCategory;
      const matchesSubTag =
        !activeSubTag ||
        p.name.toLowerCase().includes(activeSubTag.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(activeSubTag.toLowerCase()) ||
        (p.subCategory || "").toLowerCase().includes(activeSubTag.toLowerCase());
      return matchesSearch && matchesCategory && matchesSubTag;
    });
  }, [products, search, activeCategory, activeSubTag]);

  const subTags = SUB_TAGS[activeCategory] || [];

  // ── Responsive values ──
  const heropadding = isMobile ? "24px 16px 20px" : "40px 20px 36px";
  const heroTitle = isMobile ? "26px" : "36px";
  const gridCols = isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(250px, 1fr))";
  const gridGap = isMobile ? "10px" : "20px";
  const imgHeight = isMobile ? "120px" : "200px";
  const cardPadding = isMobile ? "10px" : "15px";
  const cardTitleSize = isMobile ? "13px" : "16px";
  const cardDescSize = isMobile ? "11px" : "13px";
  const priceSize = isMobile ? "13px" : "17px";
  const btnPadding = isMobile ? "7px 6px" : "10px 15px";
  const btnFontSize = isMobile ? "11px" : "14px";
  const qtyBtnSize = isMobile ? "30px" : "40px";
  const qtyHeight = isMobile ? "30px" : "38px";
  const qtyFontSize = isMobile ? "16px" : "20px";
  const outerPadding = isMobile ? "12px" : "24px 20px";

  return (
    <>
      <Navbar />

      {/* ── Welcome hero ── */}
      <div style={{
        background: `linear-gradient(135deg, ${DARK_GREEN} 0%, #2d7a3a 60%, ${BRIGHT_GREEN} 100%)`,
        color: "#fff",
        padding: heropadding,
        textAlign: "center",
      }}>
        <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", textTransform: "uppercase", color: "#c8f0a8" }}>
          🌿 {getGreeting()}, Welcome to
        </p>
        <h1 style={{ margin: "0 0 6px", fontSize: heroTitle, fontWeight: "800", letterSpacing: "-0.5px" }}>
          Nova Milk &amp; Mart
        </h1>
        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#d4edba", fontStyle: "italic" }}>
          Fresh Milk · Quality Products · Better Life
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
          {["🥛 Fresh Milk", "🛒 Groceries", "⭐ Quality", "😊 Service"].map((item) => (
            <span key={item} style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "999px",
              padding: isMobile ? "4px 10px" : "5px 14px",
              fontSize: isMobile ? "11px" : "12px",
              fontWeight: "500",
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: outerPadding, maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Search ── */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: isMobile ? "10px 36px" : "12px 44px",
              fontSize: isMobile ? "14px" : "15px",
              border: "1.5px solid #cde8ba",
              borderRadius: "12px",
              outline: "none",
              boxSizing: "border-box",
              backgroundColor: "#fff",
            }}
            onFocus={(e) => (e.target.style.borderColor = DARK_GREEN)}
            onBlur={(e) => (e.target.style.borderColor = "#cde8ba")}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#888" }}>✕</button>
          )}
        </div>

        {/* ── Category tabs ── */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px", overflowX: isMobile ? "auto" : "visible", paddingBottom: "4px" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => handleCategoryChange(cat)}
              style={{
                padding: isMobile ? "5px 10px" : "7px 16px",
                borderRadius: "999px",
                border: "1.5px solid",
                borderColor: activeCategory === cat ? DARK_GREEN : "#cde8ba",
                background: activeCategory === cat ? DARK_GREEN : "#fff",
                color: activeCategory === cat ? "#fff" : DARK_GREEN,
                fontWeight: "500",
                fontSize: isMobile ? "11px" : "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Sub-category tags ── */}
        {subTags.length > 0 && (
          <div style={{ background: "#f0f7ec", border: "1px solid #cde8ba", borderRadius: "12px", padding: "10px 12px", marginBottom: "12px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: "600", color: DARK_GREEN, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Filter by type:
            </p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {subTags.map((tag) => (
                <button key={tag} onClick={() => setActiveSubTag(activeSubTag === tag ? null : tag)}
                  style={{
                    padding: isMobile ? "4px 10px" : "5px 14px",
                    borderRadius: "999px",
                    border: "1.5px solid",
                    borderColor: activeSubTag === tag ? BRIGHT_GREEN : "#b8dda0",
                    background: activeSubTag === tag ? BRIGHT_GREEN : "#fff",
                    color: activeSubTag === tag ? "#fff" : DARK_GREEN,
                    fontWeight: "500",
                    fontSize: isMobile ? "11px" : "12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Results count ── */}
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
          {filtered.length === 0 ? "No products found"
            : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}${activeCategory !== "All" ? ` in ${activeCategory}` : ""}${activeSubTag ? ` › ${activeSubTag}` : ""}${search ? ` for "${search}"` : ""}`}
        </p>

        {/* ── Product grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: gridGap }}>
          {filtered.map((product) => {
            const outOfStock = isOutOfStock(product.stock);
            const qty = getQty(product._id);
            const maxStock = (product.stock !== undefined && product.stock !== null) ? Number(product.stock) : 999;

            return (
              <div
                key={product._id}
                style={{
                  border: "1px solid #d4edba",
                  borderRadius: "12px",
                  overflow: "hidden",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(26,92,42,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  background: "#fff",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Image */}
                <div style={{ position: "relative" }}>
                  <img
                    src={product.image || "https://placehold.co/300x200?text=No+Image"}
                    alt={product.name}
                    style={{ width: "100%", height: imgHeight, objectFit: "cover", display: "block" }}
                    onError={(e) => { e.target.src = "https://placehold.co/300x200?text=No+Image"; }}
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span style={{ position: "absolute", top: "6px", left: "6px", background: "#fef3c7", color: "#92400e", fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "999px" }}>
                      Only {product.stock} left
                    </span>
                  )}
                  {outOfStock && (
                    <span style={{ position: "absolute", top: "6px", left: "6px", background: "#fee2e2", color: "#991b1b", fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "999px" }}>
                      Out of stock
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: cardPadding, flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  {product.category && (
                    <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.07em", color: BRIGHT_GREEN }}>
                      {product.category}
                    </span>
                  )}
                  <h3 style={{ margin: 0, fontSize: cardTitleSize, color: DARK_GREEN, lineHeight: 1.3 }}>{product.name}</h3>

                  {/* Hide description on mobile to save space */}
                  {!isMobile && (
                    <p style={{ margin: 0, color: "#777", fontSize: cardDescSize, lineHeight: "1.5" }}>{product.description}</p>
                  )}

                  <p style={{ margin: 0 }}>
                    <strong style={{ color: DARK_GREEN, fontSize: priceSize }}>ETB {Number(product.price).toLocaleString()}</strong>
                  </p>

                  {/* Quantity selector */}
                  {!outOfStock && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", margin: "4px 0 0", border: "1.5px solid #cde8ba", borderRadius: "8px", overflow: "hidden" }}>
                        <button
                          onClick={() => changeQty(product._id, -1, maxStock)}
                          style={{ width: qtyBtnSize, height: qtyHeight, border: "none", background: qty <= 1 ? "#f5f5f5" : "#f0f7ec", color: qty <= 1 ? "#bbb" : DARK_GREEN, fontSize: qtyFontSize, fontWeight: "700", cursor: qty <= 1 ? "not-allowed" : "pointer", lineHeight: 1, flexShrink: 0 }}
                        >−</button>
                        <span style={{ flex: 1, textAlign: "center", fontWeight: "700", fontSize: isMobile ? "13px" : "16px", color: DARK_GREEN, borderLeft: "1px solid #cde8ba", borderRight: "1px solid #cde8ba", height: qtyHeight, lineHeight: qtyHeight }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => changeQty(product._id, +1, maxStock)}
                          style={{ width: qtyBtnSize, height: qtyHeight, border: "none", background: qty >= maxStock ? "#f5f5f5" : "#f0f7ec", color: qty >= maxStock ? "#bbb" : DARK_GREEN, fontSize: qtyFontSize, fontWeight: "700", cursor: qty >= maxStock ? "not-allowed" : "pointer", lineHeight: 1, flexShrink: 0 }}
                        >+</button>
                      </div>

                      {qty > 1 && (
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: BRIGHT_GREEN, fontWeight: "600" }}>
                          ETB {(Number(product.price) * qty).toLocaleString()}
                        </p>
                      )}
                    </>
                  )}

                  {/* Add to cart button */}
                  <button
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    style={{
                      marginTop: "6px",
                      padding: btnPadding,
                      border: "none",
                      borderRadius: "8px",
                      cursor: outOfStock ? "not-allowed" : "pointer",
                      background: addedId === product._id ? BRIGHT_GREEN : outOfStock ? "#ccc" : DARK_GREEN,
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: btnFontSize,
                      transition: "background 0.2s",
                    }}
                  >
                    {outOfStock
                      ? "Out of stock"
                      : addedId === product._id
                      ? `✓ Added!`
                      : `🛒 Add to Cart`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && products.length > 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#888" }}>
            <p style={{ fontSize: "32px", margin: "0 0 8px" }}>😕</p>
            <p style={{ fontSize: "16px", marginBottom: "1rem" }}>No products match your search.</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); setActiveSubTag(null); }}
              style={{ padding: "9px 20px", borderRadius: "8px", border: `1.5px solid ${DARK_GREEN}`, background: "#fff", cursor: "pointer", fontSize: "14px", color: DARK_GREEN, fontWeight: "500" }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: DARK_GREEN, color: "#c8f0a8", textAlign: "center", padding: "16px", fontSize: "13px", marginTop: "40px" }}>
        🌿 Nova Milk &amp; Mart — Fresh Milk. Quality Products. Better Life.
      </div>
    </>
  );
}

export default Home;