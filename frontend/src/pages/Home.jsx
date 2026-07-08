import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "https://novamart-backend.vercel.app";
const BG = "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=75";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
}
function oos(stock) { return stock !== undefined && stock !== null && Number(stock) === 0; }
function sale(price, disc) { return (!disc || disc <= 0) ? price : Math.round(price - price * disc / 100); }

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showSug, setShowSug] = useState(false);
  const [cat, setCat] = useState("All");
  const [tag, setTag] = useState(null);
  const [qtys, setQtys] = useState({});
  const [addedId, setAddedId] = useState(null);
  const [descId, setDescId] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    axios.get(`${API}/api/products`).then(r => setProducts(r.data)).catch(console.log);
    axios.get(`${API}/api/categories`).then(r => setCategories(r.data)).catch(console.log);
  }, []);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShowSug(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const getQty = id => qtys[id] || 1;
  const changeQty = (id, d, max) => setQtys(p => {
    const n = (p[id] || 1) + d;
    if (n < 1 || (max != null && n > Number(max))) return p;
    return { ...p, [id]: n };
  });

  const addToCart = p => {
    const qty = getQty(p._id);
    try {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const idx = cart.findIndex(i => i._id === p._id);
      const price = sale(p.price, p.discount);
      if (idx >= 0) cart[idx] = { ...cart[idx], qty: (cart[idx].qty || 1) + qty };
      else cart.push({ ...p, price, qty });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch(e) { console.error(e); }
    setQtys(p => ({ ...p, [p._id]: 1 }));
    setAddedId(p._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const promos = useMemo(() => products.filter(p => p.discount > 0), [products]);

  const sugs = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter(p =>
      (p.name||"").toLowerCase().includes(q) ||
      (p.category||"").toLowerCase().includes(q)
    ).slice(0, 6);
  }, [search, products]);

  const filtered = useMemo(() => products.filter(p => {
    const s = search.toLowerCase();
    return (
      ((p.name||"").toLowerCase().includes(s) ||
       (p.description||"").toLowerCase().includes(s) ||
       (p.category||"").toLowerCase().includes(s)) &&
      (cat === "All" || p.category === cat) &&
      (!tag ||
       (p.name||"").toLowerCase().includes(tag.toLowerCase()) ||
       (p.description||"").toLowerCase().includes(tag.toLowerCase()))
    );
  }), [products, search, cat, tag]);

  // Build category list: "All" + categories from DB
  const catList = ["All", ...categories.map(c => c.name)];

  // Get subtags for active category from DB
  const activeCatObj = categories.find(c => c.name === cat);
  const subtags = activeCatObj ? activeCatObj.subTags : [];

  return (
    <>
      <Navbar />
      <div>
        {/* Hero */}
        <div className="home-hero">
          <img src={BG} alt="" className="home-hero-bg" />
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <p className="home-hero-sub">🌿 {greeting()}, Welcome to</p>
            <h1 className="home-hero-h1">Nova Minimarket</h1>
            <p className="home-hero-tag">Quality Products · Better Life</p>
            <div className="home-hero-pills">
              {["🥛 Fresh Milk","🛒 Groceries","⭐ Quality","😊 Service"].map(t => (
                <span key={t} className="home-pill">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="home-body">
          {/* Search */}
          <div ref={ref} className="home-search">
            <span className="home-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSug(true); }}
              onFocus={() => setShowSug(true)}
              className="home-search-input"
            />
            {search && <button onClick={() => { setSearch(""); setShowSug(false); }} className="home-search-clear">✕</button>}
            {showSug && sugs.length > 0 && (
              <div className="home-suggest">
                {sugs.map(p => (
                  <div key={p._id} className="home-suggest-row" onClick={() => { setSearch(p.name); setShowSug(false); }}>
                    <img src={p.image || "https://placehold.co/40x40?text=Item"} alt={p.name} className="home-suggest-img" onError={e => { e.target.src="https://placehold.co/40x40?text=Item"; }} />
                    <div>
                      <div className="home-suggest-name">{p.name}</div>
                      <div className="home-suggest-cat">{p.category}</div>
                    </div>
                    <span className="home-suggest-price">ETB {Number(sale(p.price,p.discount)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promos */}
          {promos.length > 0 && (
            <div className="home-promos">
              <div className="home-promos-title">🔥 Today's Promotions</div>
              <div className="home-promos-scroll">
                {promos.map(p => (
                  <div key={p._id} className="home-promo-card">
                    <img src={p.image || "https://placehold.co/160x80?text=Item"} alt={p.name} className="home-promo-img" onError={e => { e.target.src="https://placehold.co/160x80?text=Item"; }} />
                    <div className="home-promo-body">
                      <div className="home-promo-name">{p.name}</div>
                      <div className="home-promo-old">ETB {Number(p.price).toLocaleString()}</div>
                      <div className="home-promo-price">ETB {Number(sale(p.price,p.discount)).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category tabs — from database */}
          <div className="home-cats">
            {catList.map(c => (
              <button
                key={c}
                className={`home-cat${cat===c?" on":""}`}
                onClick={() => { setCat(c); setTag(null); }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Subtags — from database */}
          {subtags.length > 0 && (
            <div className="home-subtags">
              <div className="home-subtags-label">Filter by type:</div>
              <div className="home-subtags-list">
                {subtags.map(t => (
                  <button
                    key={t}
                    className={`home-subtag${tag===t?" on":""}`}
                    onClick={() => setTag(tag===t ? null : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="home-count">
            {filtered.length === 0 ? "No products found" :
             `${filtered.length} product${filtered.length!==1?"s":""}${cat!=="All"?` in ${cat}`:""}${tag?` › ${tag}`:""}${search?` for "${search}"`:""}` }
          </p>

          {/* Product grid */}
          <div className="home-grid">
            {filtered.map(product => {
              const isOos = oos(product.stock);
              const qty = getQty(product._id);
              const max = product.stock != null ? Number(product.stock) : 999;
              const hasDis = product.discount > 0;
              const final = sale(product.price, product.discount);
              const descOpen = descId === product._id;
              const added = addedId === product._id;

              return (
                <div key={product._id} className="home-card">
                  <div className="home-card-img-wrap">
                    <img
                      src={product.image || "https://placehold.co/300x200?text=No+Image"}
                      alt={product.name}
                      className="home-card-img"
                      onError={e => { e.target.src="https://placehold.co/300x200?text=No+Image"; }}
                    />
                    {hasDis && <span className="home-card-badge disc">-{product.discount}%</span>}
                    {!hasDis && product.stock > 0 && product.stock <= 5 && <span className="home-card-badge low">{product.stock} left</span>}
                    {isOos && <span className="home-card-badge out">Out</span>}
                  </div>
                  <div className="home-card-body">
                    {product.category && <span className="home-card-cat">{product.category}</span>}
                    <h3 className="home-card-name">{product.name}</h3>
                    {product.description && (
                      <>
                        <button className="home-desc-btn" onClick={() => setDescId(descOpen ? null : product._id)}>
                          {descOpen ? "Hide ▲" : "ℹ️ Details"}
                        </button>
                        {descOpen && <p className="home-desc-text">{product.description}</p>}
                      </>
                    )}
                    <div>
                      {hasDis && <div className="home-price-old">ETB {Number(product.price).toLocaleString()}</div>}
                      <div className={`home-price${hasDis?" sale":""}`}>ETB {Number(final).toLocaleString()}</div>
                    </div>
                    {!isOos && (
                      <div className="home-qty">
                        <button className="home-qty-btn" onClick={() => changeQty(product._id,-1,max)} disabled={qty<=1}>−</button>
                        <span className="home-qty-val">{qty}</span>
                        <button className="home-qty-btn" onClick={() => changeQty(product._id,+1,max)} disabled={qty>=max}>+</button>
                      </div>
                    )}
                    {!isOos && qty > 1 && <div className="home-subtotal">Total: ETB {(Number(final)*qty).toLocaleString()}</div>}
                    <button
                      className={`home-add-btn${added?" added":""}`}
                      onClick={() => addToCart(product)}
                      disabled={isOos}
                    >
                      {isOos ? "Out of stock" : added ? "✓ Added!" : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && products.length > 0 && (
            <div className="home-empty">
              <div className="home-empty-icon">😕</div>
              <p>No products found.</p>
              <button className="home-empty-btn" onClick={() => { setSearch(""); setCat("All"); setTag(null); }}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="nm-footer">🌿 Nova Minimarket · © 2026 All rights reserved.</div>
      </div>
    </>
  );
}