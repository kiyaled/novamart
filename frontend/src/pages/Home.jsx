import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "https://novamart-backend.vercel.app";
const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";

const CATEGORIES = ["All","Dairy","Bakery","Beverages","Snacks","Fruits & Vegetables","Meat","Frozen","Other"];

const SUB_TAGS = {
  Dairy: ["Fresh Milk","Cheese","Yogurt","Butter","Cream","Eggs"],
  Bakery: ["Bread","Cake","Biscuits","Pastry","Rolls"],
  Beverages: ["Juice","Water","Soda","Tea","Coffee","Energy Drink"],
  Snacks: ["Chips","Nuts","Chocolate","Candy","Popcorn"],
  "Fruits & Vegetables": ["Fruits","Leafy Greens","Root Vegetables","Herbs","Peppers"],
  Meat: ["Beef","Chicken","Fish","Lamb","Sausage"],
  Frozen: ["Frozen Meals","Ice Cream","Frozen Vegetables","Frozen Meat"],
  Other: [],
};

const BG = "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=75";

const CSS = `
*{box-sizing:border-box}
.nm-home{width:100%;overflow-x:hidden;background:#f8fdf4}
.nm-hero{position:relative;min-height:180px;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
.nm-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.nm-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(15,61,28,.88) 0%,rgba(26,92,42,.78) 55%,rgba(45,122,58,.70) 100%)}
.nm-hero-content{position:relative;color:#fff;padding:28px 16px;width:100%}
.nm-hero-sub{margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#d8f5b8}
.nm-hero-h1{margin:0 0 4px;font-size:26px;font-weight:900}
.nm-hero-tag{margin:0 0 12px;font-size:12px;color:#e8f9d4;font-style:italic}
.nm-pills{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
.nm-pill{background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.4);border-radius:999px;padding:3px 10px;font-size:11px;font-weight:600}
.nm-body{max-width:1200px;margin:0 auto;padding:14px 12px}
.nm-search-wrap{position:relative;margin-bottom:12px}
.nm-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none}
.nm-search-input{width:100%;padding:11px 40px;font-size:14px;border:1.5px solid #cde8ba;border-radius:12px;outline:none;background:#fff}
.nm-search-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:13px;color:#888}
.nm-suggest{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1.5px solid #cde8ba;border-radius:12px;box-shadow:0 8px 24px rgba(26,92,42,.15);z-index:50;overflow:hidden}
.nm-suggest-item{display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid #f0f7ec}
.nm-suggest-item:hover{background:#f0f7ec}
.nm-suggest-img{width:32px;height:32px;object-fit:cover;border-radius:6px;flex-shrink:0}
.nm-suggest-name{margin:0;font-size:13px;font-weight:600;color:#1a5c2a}
.nm-suggest-cat{margin:0;font-size:11px;color:#888}
.nm-promos{margin-bottom:14px}
.nm-promo-title{display:flex;align-items:center;gap:6px;margin-bottom:8px}
.nm-promo-h{margin:0;font-size:15px;color:#dc2626;font-weight:800}
.nm-promo-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch}
.nm-promo-card{flex-shrink:0;width:120px;background:#fff;border:1px solid #d4edba;border-radius:10px;overflow:hidden}
.nm-promo-img{width:100%;height:72px;object-fit:cover;display:block}
.nm-promo-info{padding:6px}
.nm-promo-name{margin:0 0 2px;font-size:11px;font-weight:600;color:#1a5c2a;line-height:1.3}
.nm-promo-old{margin:0;font-size:10px;color:#aaa;text-decoration:line-through}
.nm-promo-price{font-size:12px;color:#dc2626;font-weight:700}
.nm-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px;-webkit-overflow-scrolling:touch;flex-wrap:nowrap}
.nm-cat{flex-shrink:0;padding:6px 12px;border-radius:999px;border:1.5px solid #cde8ba;background:#fff;color:#1a5c2a;font-weight:500;font-size:12px;cursor:pointer;white-space:nowrap}
.nm-cat-on{background:#1a5c2a!important;color:#fff!important;border-color:#1a5c2a!important}
.nm-subtags{background:#f0f7ec;border:1px solid #cde8ba;border-radius:10px;padding:10px;margin-bottom:10px}
.nm-subtags-label{margin:0 0 6px;font-size:11px;font-weight:600;color:#1a5c2a;text-transform:uppercase;letter-spacing:.06em}
.nm-subtags-list{display:flex;gap:6px;flex-wrap:wrap}
.nm-subtag{padding:4px 10px;border-radius:999px;border:1.5px solid #b8dda0;background:#fff;color:#1a5c2a;font-size:11px;font-weight:500;cursor:pointer}
.nm-subtag-on{background:#6abf3a!important;color:#fff!important;border-color:#6abf3a!important}
.nm-count{font-size:12px;color:#666;margin-bottom:10px}
.nm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.nm-card{background:#fff;border:1px solid #d4edba;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 2px 6px rgba(26,92,42,.07)}
.nm-card-img{width:100%;height:110px;object-fit:cover;display:block}
.nm-card-body{padding:8px;display:flex;flex-direction:column;gap:4px;flex:1}
.nm-card-cat{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6abf3a}
.nm-card-name{margin:0;font-size:12px;font-weight:700;color:#1a5c2a;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.nm-desc-btn{background:none;border:none;color:#6abf3a;font-size:10px;font-weight:600;cursor:pointer;padding:0;text-decoration:underline;text-align:left}
.nm-desc-text{margin:2px 0 0;color:#777;font-size:10px;line-height:1.4;background:#f9faf7;padding:5px;border-radius:6px}
.nm-price-row{display:flex;flex-direction:column;gap:1px}
.nm-price{font-size:13px;color:#1a5c2a;font-weight:700}
.nm-price-old{font-size:10px;color:#aaa;text-decoration:line-through}
.nm-price-sale{font-size:13px;color:#dc2626;font-weight:700}
.nm-disc-badge{position:absolute;top:4px;right:4px;background:#dc2626;color:#fff;font-size:9px;font-weight:800;padding:2px 5px;border-radius:5px}
.nm-badge-low{position:absolute;top:4px;left:4px;background:#fef3c7;color:#92400e;font-size:9px;font-weight:600;padding:2px 5px;border-radius:999px}
.nm-badge-out{position:absolute;top:4px;left:4px;background:#fee2e2;color:#991b1b;font-size:9px;font-weight:600;padding:2px 5px;border-radius:999px}
.nm-qty{display:flex;align-items:center;border:1.5px solid #cde8ba;border-radius:6px;overflow:hidden;margin-top:2px}
.nm-qty-btn{width:28px;height:28px;border:none;background:#f0f7ec;color:#1a5c2a;font-size:16px;font-weight:700;cursor:pointer;line-height:1;flex-shrink:0}
.nm-qty-btn:disabled{background:#f5f5f5;color:#bbb;cursor:not-allowed}
.nm-qty-val{flex:1;text-align:center;font-weight:700;font-size:13px;color:#1a5c2a;border-left:1px solid #cde8ba;border-right:1px solid #cde8ba;height:28px;line-height:28px}
.nm-subtotal{margin:2px 0 0;font-size:10px;color:#6abf3a;font-weight:600}
.nm-add-btn{margin-top:4px;padding:7px 4px;border:none;border-radius:6px;background:#1a5c2a;color:#fff;font-weight:600;font-size:11px;cursor:pointer;transition:background .2s;width:100%}
.nm-add-btn.added{background:#6abf3a}
.nm-add-btn:disabled{background:#ccc;cursor:not-allowed}
.nm-footer{background:#1a5c2a;color:#c8f0a8;text-align:center;padding:16px;font-size:13px;margin-top:32px}
@media(min-width:601px){
  .nm-hero{min-height:220px}
  .nm-hero-h1{font-size:36px}
  .nm-hero-sub{font-size:13px}
  .nm-hero-tag{font-size:14px}
  .nm-pill{font-size:12px;padding:5px 14px}
  .nm-body{padding:24px 20px}
  .nm-search-input{font-size:15px;padding:12px 44px}
  .nm-grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px}
  .nm-card-img{height:190px}
  .nm-card-body{padding:14px;gap:6px}
  .nm-card-name{font-size:15px}
  .nm-card-cat{font-size:11px}
  .nm-price{font-size:17px}
  .nm-price-sale{font-size:17px}
  .nm-price-old{font-size:13px}
  .nm-qty-btn{width:38px;height:36px;font-size:20px}
  .nm-qty-val{height:36px;line-height:36px;font-size:15px}
  .nm-add-btn{font-size:14px;padding:10px 15px}
  .nm-desc-btn{font-size:12px}
  .nm-desc-text{font-size:12px}
  .nm-cat{font-size:13px;padding:7px 16px}
  .nm-promo-card{width:160px}
  .nm-promo-img{height:100px}
  .nm-promo-name{font-size:13px}
  .nm-promo-h{font-size:18px}
}
`;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function isOutOfStock(stock) {
  return stock !== undefined && stock !== null && Number(stock) === 0;
}

function salePrice(price, discount) {
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showSug, setShowSug] = useState(false);
  const [activeCat, setActiveCat] = useState("All");
  const [activeTag, setActiveTag] = useState(null);
  const [qtys, setQtys] = useState({});
  const [addedId, setAddedId] = useState(null);
  const [descId, setDescId] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/api/products`).then((r) => setProducts(r.data)).catch(console.log);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSug(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const getQty = (id) => qtys[id] || 1;

  const changeQty = (id, d, max) => {
    setQtys((p) => {
      const n = (p[id] || 1) + d;
      if (n < 1) return p;
      if (max != null && n > Number(max)) return p;
      return { ...p, [id]: n };
    });
  };

  const addToCart = (product) => {
    const qty = getQty(product._id);
    try {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const idx = cart.findIndex((i) => i._id === product._id);
      const price = salePrice(product.price, product.discount);
      if (idx >= 0) { cart[idx] = { ...cart[idx], qty: (cart[idx].qty || 1) + qty }; }
      else { cart.push({ ...product, price, qty }); }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (e) { console.error(e); }
    setQtys((p) => ({ ...p, [product._id]: 1 }));
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const promos = useMemo(() => products.filter((p) => p.discount > 0), [products]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q)).slice(0, 6);
  }, [search, products]);

  const filtered = useMemo(() => products.filter((p) => {
    const s = search.toLowerCase();
    const ms = (p.name || "").toLowerCase().includes(s) || (p.description || "").toLowerCase().includes(s) || (p.category || "").toLowerCase().includes(s);
    const mc = activeCat === "All" || p.category === activeCat;
    const mt = !activeTag || (p.name || "").toLowerCase().includes(activeTag.toLowerCase()) || (p.description || "").toLowerCase().includes(activeTag.toLowerCase());
    return ms && mc && mt;
  }), [products, search, activeCat, activeTag]);

  const subTags = SUB_TAGS[activeCat] || [];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Navbar />
      <div className="nm-home">

        <div className="nm-hero">
          <img src={BG} alt="" className="nm-hero-bg" />
          <div className="nm-overlay" />
          <div className="nm-hero-content">
            <p className="nm-hero-sub">🌿 {getGreeting()}, Welcome to</p>
            <h1 className="nm-hero-h1">Nova Milk &amp; Mart</h1>
            <p className="nm-hero-tag">Fresh Milk · Quality Products · Better Life</p>
            <div className="nm-pills">
              {["🥛 Fresh Milk","🛒 Groceries","⭐ Quality","😊 Service"].map((t) => (
                <span key={t} className="nm-pill">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="nm-body">

          <div ref={searchRef} className="nm-search-wrap">
            <span className="nm-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSug(true); }}
              onFocus={() => setShowSug(true)}
              className="nm-search-input"
            />
            {search && <button onClick={() => { setSearch(""); setShowSug(false); }} className="nm-search-clear">✕</button>}
            {showSug && suggestions.length > 0 && (
              <div className="nm-suggest">
                {suggestions.map((p) => (
                  <div key={p._id} className="nm-suggest-item" onClick={() => { setSearch(p.name); setShowSug(false); }}>
                    <img src={p.image || "https://placehold.co/40x40?text=Item"} alt={p.name} className="nm-suggest-img" onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Item"; }} />
                    <div>
                      <p className="nm-suggest-name">{p.name}</p>
                      <p className="nm-suggest-cat">{p.category}</p>
                    </div>
                    <strong style={{ fontSize: "12px", color: DARK_GREEN, marginLeft: "auto" }}>ETB {Number(salePrice(p.price, p.discount)).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {promos.length > 0 && (
            <div className="nm-promos">
              <div className="nm-promo-title"><span>🔥</span><h2 className="nm-promo-h">Today's Promotions</h2></div>
              <div className="nm-promo-scroll">
                {promos.map((p) => (
                  <div key={p._id} className="nm-promo-card">
                    <div style={{ position: "relative" }}>
                      <img src={p.image || "https://placehold.co/160x100?text=Item"} alt={p.name} className="nm-promo-img" onError={(e) => { e.target.src = "https://placehold.co/160x100?text=Item"; }} />
                      <span className="nm-disc-badge">-{p.discount}%</span>
                    </div>
                    <div className="nm-promo-info">
                      <p className="nm-promo-name">{p.name}</p>
                      <p className="nm-promo-old">ETB {Number(p.price).toLocaleString()}</p>
                      <strong className="nm-promo-price">ETB {Number(salePrice(p.price, p.discount)).toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="nm-cats">
            {CATEGORIES.map((cat) => (
              <button key={cat} className={`nm-cat${activeCat === cat ? " nm-cat-on" : ""}`} onClick={() => { setActiveCat(cat); setActiveTag(null); }}>
                {cat}
              </button>
            ))}
          </div>

          {subTags.length > 0 && (
            <div className="nm-subtags">
              <p className="nm-subtags-label">Filter by type:</p>
              <div className="nm-subtags-list">
                {subTags.map((t) => (
                  <button key={t} className={`nm-subtag${activeTag === t ? " nm-subtag-on" : ""}`} onClick={() => setActiveTag(activeTag === t ? null : t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="nm-count">
            {filtered.length === 0 ? "No products found" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}${activeCat !== "All" ? ` in ${activeCat}` : ""}${activeTag ? ` › ${activeTag}` : ""}${search ? ` for "${search}"` : ""}`}
          </p>

          <div className="nm-grid">
            {filtered.map((product) => {
              const oos = isOutOfStock(product.stock);
              const qty = getQty(product._id);
              const max = product.stock != null ? Number(product.stock) : 999;
              const hasDis = product.discount > 0;
              const final = salePrice(product.price, product.discount);
              const descOpen = descId === product._id;
              const isAdded = addedId === product._id;

              return (
                <div key={product._id} className="nm-card">
                  <div style={{ position: "relative" }}>
                    <img
                      src={product.image || "https://placehold.co/300x200?text=No+Image"}
                      alt={product.name}
                      className="nm-card-img"
                      onError={(e) => { e.target.src = "https://placehold.co/300x200?text=No+Image"; }}
                    />
                    {hasDis && <span className="nm-disc-badge">-{product.discount}%</span>}
                    {!hasDis && product.stock > 0 && product.stock <= 5 && <span className="nm-badge-low">{product.stock} left</span>}
                    {oos && <span className="nm-badge-out">Out</span>}
                  </div>
                  <div className="nm-card-body">
                    {product.category && <span className="nm-card-cat">{product.category}</span>}
                    <h3 className="nm-card-name">{product.name}</h3>
                    {product.description && (
                      <>
                        <button className="nm-desc-btn" onClick={() => setDescId(descOpen ? null : product._id)}>
                          {descOpen ? "Hide ▲" : "ℹ️ Details"}
                        </button>
                        {descOpen && <p className="nm-desc-text">{product.description}</p>}
                      </>
                    )}
                    <div className="nm-price-row">
                      {hasDis && <span className="nm-price-old">ETB {Number(product.price).toLocaleString()}</span>}
                      <span className={hasDis ? "nm-price-sale" : "nm-price"}>ETB {Number(final).toLocaleString()}</span>
                    </div>
                    {!oos && (
                      <div className="nm-qty">
                        <button className="nm-qty-btn" onClick={() => changeQty(product._id, -1, max)} disabled={qty <= 1}>−</button>
                        <span className="nm-qty-val">{qty}</span>
                        <button className="nm-qty-btn" onClick={() => changeQty(product._id, +1, max)} disabled={qty >= max}>+</button>
                      </div>
                    )}
                    {!oos && qty > 1 && <p className="nm-subtotal">Total: ETB {(Number(final) * qty).toLocaleString()}</p>}
                    <button
                      className={`nm-add-btn${isAdded ? " added" : ""}`}
                      onClick={() => addToCart(product)}
                      disabled={oos}
                    >
                      {oos ? "Out of stock" : isAdded ? "✓ Added!" : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && products.length > 0 && (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#888" }}>
              <p style={{ fontSize: "28px", margin: "0 0 8px" }}>😕</p>
              <p style={{ fontSize: "15px", marginBottom: "1rem" }}>No products found.</p>
              <button onClick={() => { setSearch(""); setActiveCat("All"); setActiveTag(null); }} style={{ padding: "9px 20px", borderRadius: "8px", border: `1.5px solid ${DARK_GREEN}`, background: "#fff", cursor: "pointer", fontSize: "14px", color: DARK_GREEN, fontWeight: "500" }}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="nm-footer">
          🌿 Nova Milk &amp; Mart — Fresh Milk. Quality Products. Better Life.
        </div>
      </div>
    </>
  );
}