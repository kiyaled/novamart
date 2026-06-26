import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";
const LIGHT_BG = "#f0f7ec";

const STEP_CART = "cart";
const STEP_FORM = "form";
const STEP_SUCCESS = "success";

// ── Payment accounts ──
const PAYMENT_ACCOUNTS = [
  {
    bank: "TeleBirr",
    number: "+251 937 066 660",
    name: "Nova Milk & Mart",
    emoji: "📱",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    bank: "CBE",
    number: "1000599391251",
    name: "Nova Milk & Mart",
    emoji: "🏦",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    bank: "Abyssinia Bank",
    number: "261230437",
    name: "Nova Milk & Mart",
    emoji: "🏛️",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fcd34d",
  },
  {
    bank: "Dashen Bank",
    number: "5008886050021",
    name: "Nova Milk & Mart",
    emoji: "🏧",
    color: "#0f766e",
    bg: "#f0fdfa",
    border: "#99f6e4",
  },
];

function PaymentCard({ account, totalPrice }) {
  const [copied, setCopied] = useState(false);

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        background: account.bg,
        border: `2px solid ${account.border}`,
        borderRadius: "14px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "12px",
          background: account.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          flexShrink: 0,
        }}
      >
        {account.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontWeight: "800", fontSize: "14px", color: account.color }}>
          {account.bank}
        </p>
        <p style={{ margin: "0 0 1px", fontWeight: "700", fontSize: "16px", color: "#1a1a1a", letterSpacing: "0.04em", fontFamily: "monospace" }}>
          {account.number}
        </p>
        <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>{account.name}</p>
      </div>

      {/* Copy button */}
      <button
        onClick={() => copy(account.number)}
        style={{
          background: copied ? BRIGHT_GREEN : "#fff",
          border: `1.5px solid ${copied ? BRIGHT_GREEN : account.border}`,
          borderRadius: "8px",
          color: copied ? "#fff" : account.color,
          fontSize: "12px",
          fontWeight: "700",
          padding: "6px 12px",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {copied ? "✓ Copied!" : "📋 Copy"}
      </button>
    </div>
  );
}

function PaymentSection({ totalPrice }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "2px solid #c6e6a0",
        borderRadius: "18px",
        padding: "22px",
        marginTop: "20px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <span style={{ fontSize: "22px" }}>💳</span>
        <h3 style={{ margin: 0, color: DARK_GREEN, fontSize: "18px", fontWeight: "800" }}>
          Pay Now
        </h3>
      </div>
      <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
        Please transfer <strong style={{ color: DARK_GREEN, fontSize: "15px" }}>ETB {totalPrice.toLocaleString()}</strong> to one of the accounts below, then we'll call to confirm your order.
      </p>

      {/* Account cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {PAYMENT_ACCOUNTS.map((acc) => (
          <PaymentCard key={acc.bank} account={acc} totalPrice={totalPrice} />
        ))}
      </div>

      {/* Note */}
      <div
        style={{
          background: "#fffbeb",
          border: "1.5px solid #fcd34d",
          borderRadius: "12px",
          padding: "12px 16px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: "13px", color: "#92400e", lineHeight: "1.6" }}>
          After sending, <strong>take a screenshot</strong> of your transfer. We'll verify when we call you to confirm delivery.
        </p>
      </div>
    </div>
  );
}

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(STEP_CART);
  const [submitting, setSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  const [form, setForm] = useState({ name: "", phone: "", block: "", houseNumber: "" });
  const [errors, setErrors] = useState({});

  const loadCart = () => {
    try {
      const raw = localStorage.getItem("cart");
      const cart = raw ? JSON.parse(raw) : [];
      const fixed = cart.map((item) => ({
        ...item,
        qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
      }));
      setCartItems(fixed);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    document.addEventListener("visibilitychange", loadCart);
    return () => {
      window.removeEventListener("cartUpdated", loadCart);
      document.removeEventListener("visibilitychange", loadCart);
    };
  }, []);

  const saveCart = (updated) => {
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const changeQty = (id, delta) => {
    const updated = cartItems
      .map((item) => item._id === id ? { ...item, qty: (item.qty || 1) + delta } : item)
      .filter((item) => item.qty > 0);
    saveCart(updated);
  };

  const removeItem = (id) => saveCart(cartItems.filter((i) => i._id !== id));

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const totalItems = cartItems.reduce((s, i) => s + (i.qty || 1), 0);
  const totalPrice = cartItems.reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9+\s\-]{7,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.block.trim()) e.block = "Block is required";
    if (!form.houseNumber.trim()) e.houseNumber = "House number is required";
    return e;
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/orders", {
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          block: form.block.trim(),
          houseNumber: form.houseNumber.trim(),
        },
        items: cartItems,
        totalPrice,
      });
      setOrderSummary({ ...form, totalPrice, totalItems });
      clearCart();
      setStep(STEP_SUCCESS);
    } catch {
      alert("Failed to place order. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "13px 16px",
    fontSize: "15px",
    border: `2px solid ${hasError ? "#e53e3e" : "#c6e6a0"}`,
    borderRadius: "12px",
    outline: "none",
    boxSizing: "border-box",
    background: hasError ? "#fff5f5" : "#ffffff",
    color: "#1a1a1a",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: DARK_GREEN,
    marginBottom: "7px",
  };

  const Footer = () => (
    <div style={{ background: DARK_GREEN, color: "#c8f0a8", textAlign: "center", padding: "16px", fontSize: "13px" }}>
      🌿 Nova Milk &amp; Mart — Fresh Milk. Quality Products. Better Life.
    </div>
  );

  // ─────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────
  if (step === STEP_SUCCESS && orderSummary) {
    return (
      <>
        <Navbar />
        <div style={{ background: LIGHT_BG, minHeight: "80vh", padding: "32px 16px" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>

            {/* Success card */}
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 40px rgba(26,92,42,0.13)", padding: "36px 32px", textAlign: "center", marginBottom: "0" }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: `linear-gradient(135deg, ${DARK_GREEN}, ${BRIGHT_GREEN})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 28px rgba(106,191,58,0.4)", fontSize: "44px", color: "#fff" }}>
                ✓
              </div>
              <h1 style={{ color: DARK_GREEN, fontSize: "28px", fontWeight: "800", margin: "0 0 8px" }}>
                Order Accepted! 🎉
              </h1>
              <p style={{ color: "#555", fontSize: "15px", lineHeight: "1.7", margin: "0 0 24px" }}>
                Thank you, <strong style={{ color: DARK_GREEN }}>{orderSummary.name}</strong>!<br />
                We'll call <strong style={{ color: DARK_GREEN }}>{orderSummary.phone}</strong> to confirm delivery.
              </p>

              {/* Delivery summary */}
              <div style={{ background: LIGHT_BG, border: "2px solid #c6e6a0", borderRadius: "14px", padding: "18px", textAlign: "left", marginBottom: "8px" }}>
                <p style={{ margin: "0 0 12px", fontWeight: "800", color: DARK_GREEN, fontSize: "14px" }}>📋 Delivery Info</p>
                {[
                  ["👤 Name", orderSummary.name],
                  ["📞 Phone", orderSummary.phone],
                  ["🏘️ Block", `Block ${orderSummary.block}`],
                  ["🏠 House", `House No. ${orderSummary.houseNumber}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #d4edba" }}>
                    <span style={{ fontSize: "13px", color: "#666" }}>{label}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", marginTop: "4px" }}>
                  <span style={{ fontWeight: "800", fontSize: "16px", color: DARK_GREEN }}>💰 Total</span>
                  <span style={{ fontWeight: "900", fontSize: "22px", color: DARK_GREEN }}>ETB {orderSummary.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment section */}
            <PaymentSection totalPrice={orderSummary.totalPrice} />

            {/* Continue button */}
            <div style={{ textAlign: "center", marginTop: "28px" }}>
              <Link
                to="/"
                onClick={() => setStep(STEP_CART)}
                style={{ display: "inline-block", background: `linear-gradient(135deg, ${DARK_GREEN}, #2d7a3a)`, color: "#fff", padding: "14px 40px", borderRadius: "12px", textDecoration: "none", fontWeight: "700", fontSize: "16px", boxShadow: "0 4px 16px rgba(26,92,42,0.3)" }}
              >
                🛒 Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ─────────────────────────────────────
  // DELIVERY FORM
  // ─────────────────────────────────────
  if (step === STEP_FORM) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "80vh", background: LIGHT_BG, padding: "32px 16px" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <button onClick={() => setStep(STEP_CART)} style={{ background: "none", border: "none", color: DARK_GREEN, fontSize: "14px", cursor: "pointer", padding: 0, marginBottom: "20px", fontWeight: "600" }}>
              ← Back to cart
            </button>

            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(26,92,42,0.10)", padding: "36px 32px" }}>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: `linear-gradient(135deg, ${DARK_GREEN}, ${BRIGHT_GREEN})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "26px" }}>📦</div>
                <h1 style={{ margin: "0 0 6px", color: DARK_GREEN, fontSize: "24px", fontWeight: "800" }}>Delivery Details</h1>
                <p style={{ margin: 0, color: "#777", fontSize: "14px" }}>Fill in your info so we can call you and deliver</p>
              </div>

              {/* Mini summary */}
              <div style={{ background: LIGHT_BG, border: "2px solid #c6e6a0", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", color: DARK_GREEN, fontSize: "14px" }}>🛒 {totalItems} item{totalItems !== 1 ? "s" : ""}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#666" }}>
                    {cartItems.slice(0, 2).map((i) => `${i.name} ×${i.qty}`).join(", ")}
                    {cartItems.length > 2 ? ` +${cartItems.length - 2} more` : ""}
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: "800", fontSize: "20px", color: DARK_GREEN }}>ETB {totalPrice.toLocaleString()}</p>
              </div>

              {/* Fields */}
              {[
                { label: "👤 Full Name", key: "name", placeholder: "e.g. Abebe Girma", type: "text" },
                { label: "📞 Phone Number", key: "phone", placeholder: "e.g. 0911 234 567", type: "tel" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key} style={{ marginBottom: "18px" }}>
                  <label style={labelStyle}>{label} <span style={{ color: "#e53e3e" }}>*</span></label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => handleFormChange(key, e.target.value)}
                    style={inputStyle(errors[key])}
                    onFocus={(e) => { e.target.style.borderColor = DARK_GREEN; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,42,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = errors[key] ? "#e53e3e" : "#c6e6a0"; e.target.style.boxShadow = "none"; }}
                  />
                  {errors[key] && <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#e53e3e", fontWeight: "500" }}>⚠ {errors[key]}</p>}
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                {[
                  { label: "🏘️ Block", key: "block", placeholder: "e.g. B2" },
                  { label: "🏠 House No.", key: "houseNumber", placeholder: "e.g. 14" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label} <span style={{ color: "#e53e3e" }}>*</span></label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => handleFormChange(key, e.target.value)}
                      style={inputStyle(errors[key])}
                      onFocus={(e) => { e.target.style.borderColor = DARK_GREEN; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,42,0.12)"; }}
                      onBlur={(e) => { e.target.style.borderColor = errors[key] ? "#e53e3e" : "#c6e6a0"; e.target.style.boxShadow = "none"; }}
                    />
                    {errors[key] && <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#e53e3e", fontWeight: "500" }}>⚠ {errors[key]}</p>}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ width: "100%", padding: "15px", background: submitting ? "#aaa" : `linear-gradient(135deg, ${DARK_GREEN}, #2d7a3a)`, color: "#fff", border: "none", borderRadius: "12px", fontSize: "17px", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 4px 16px rgba(26,92,42,0.3)", transition: "all 0.2s" }}
              >
                {submitting ? "⏳ Placing your order..." : "✅ Place Order"}
              </button>
              <p style={{ fontSize: "12px", color: "#999", textAlign: "center", marginTop: "12px", lineHeight: "1.6" }}>
                🔒 Your info is only used for delivery. We'll call to confirm. Free delivery 🌿
              </p>
            </div>

            {/* Show payment accounts on form page too */}
            <PaymentSection totalPrice={totalPrice} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ─────────────────────────────────────
  // CART PAGE
  // ─────────────────────────────────────
  return (
    <>
      <Navbar />
      <div style={{ background: LIGHT_BG, minHeight: "80vh", padding: "28px 16px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h1 style={{ margin: 0, color: DARK_GREEN, fontSize: "26px", fontWeight: "800" }}>
              🛒 Shopping Cart
              {cartItems.length > 0 && (
                <span style={{ fontSize: "15px", fontWeight: "400", color: "#666", marginLeft: "10px" }}>
                  ({totalItems} item{totalItems !== 1 ? "s" : ""})
                </span>
              )}
            </h1>
            {cartItems.length > 0 && (
              <button onClick={clearCart} style={{ background: "#fff", border: "1.5px solid #ffb3b3", borderRadius: "10px", color: "#cc3333", padding: "7px 16px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>
                🗑 Clear all
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: "20px", textAlign: "center", padding: "5rem 2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "60px", margin: "0 0 16px" }}>🛒</p>
              <p style={{ fontSize: "20px", fontWeight: "700", color: DARK_GREEN, margin: "0 0 8px" }}>Your cart is empty</p>
              <p style={{ fontSize: "14px", color: "#888", margin: "0 0 28px" }}>Add some products from the home page!</p>
              <Link to="/" style={{ background: DARK_GREEN, color: "#fff", padding: "12px 28px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", fontSize: "15px" }}>Browse Products</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Cart items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {cartItems.map((item) => (
                  <div key={item._id} style={{ background: "#fff", border: "1.5px solid #d4edba", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 8px rgba(26,92,42,0.07)" }}>
                    <img
                      src={item.image || "https://placehold.co/80x80?text=Item"}
                      alt={item.name}
                      style={{ width: "76px", height: "76px", objectFit: "cover", borderRadius: "12px", flexShrink: 0, border: "1.5px solid #e8f5e0" }}
                      onError={(e) => { e.target.src = "https://placehold.co/80x80?text=Item"; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {item.category && <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: BRIGHT_GREEN }}>{item.category}</span>}
                      <p style={{ margin: "2px 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>{item.name}</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "#777" }}>ETB {Number(item.price).toLocaleString()} each</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", background: LIGHT_BG, border: "2px solid #c6e6a0", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                      <button onClick={() => changeQty(item._id, -1)} style={{ width: "36px", height: "36px", border: "none", background: "transparent", color: DARK_GREEN, fontSize: "20px", fontWeight: "800", cursor: "pointer", lineHeight: 1 }}>−</button>
                      <span style={{ width: "38px", textAlign: "center", fontWeight: "800", fontSize: "16px", color: DARK_GREEN, borderLeft: "1.5px solid #c6e6a0", borderRight: "1.5px solid #c6e6a0", height: "36px", lineHeight: "36px" }}>{item.qty || 1}</span>
                      <button onClick={() => changeQty(item._id, +1)} style={{ width: "36px", height: "36px", border: "none", background: "transparent", color: DARK_GREEN, fontSize: "20px", fontWeight: "800", cursor: "pointer", lineHeight: 1 }}>+</button>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0, minWidth: "100px" }}>
                      <p style={{ margin: "0 0 6px", fontWeight: "800", fontSize: "16px", color: DARK_GREEN }}>ETB {(Number(item.price) * (item.qty || 1)).toLocaleString()}</p>
                      <button onClick={() => removeItem(item._id)} style={{ background: "none", border: "none", color: "#e53e3e", fontSize: "12px", cursor: "pointer", padding: 0, fontWeight: "600" }}>✕ Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div style={{ background: "#fff", border: "2px solid #c6e6a0", borderRadius: "18px", padding: "24px", boxShadow: "0 4px 16px rgba(26,92,42,0.08)" }}>
                <h3 style={{ margin: "0 0 18px", color: DARK_GREEN, fontSize: "18px", fontWeight: "800" }}>📋 Order Summary</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px", color: "#555" }}>
                  <span>Items ({totalItems})</span>
                  <span style={{ fontWeight: "600", color: "#1a1a1a" }}>ETB {totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px", color: "#555" }}>
                  <span>Delivery</span>
                  <span style={{ color: BRIGHT_GREEN, fontWeight: "700" }}>🎁 Free</span>
                </div>
                <div style={{ borderTop: "2px solid #e8f5e0", marginTop: "14px", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ fontWeight: "800", fontSize: "18px", color: DARK_GREEN }}>Total</span>
                  <span style={{ fontWeight: "900", fontSize: "26px", color: DARK_GREEN }}>ETB {totalPrice.toLocaleString()}</span>
                </div>
                <button onClick={() => setStep(STEP_FORM)} style={{ width: "100%", padding: "15px", background: `linear-gradient(135deg, ${DARK_GREEN}, #2d7a3a)`, color: "#fff", border: "none", borderRadius: "12px", fontSize: "17px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(26,92,42,0.3)" }}>
                  Enter Delivery Details →
                </button>
                <Link to="/" style={{ display: "block", textAlign: "center", marginTop: "14px", fontSize: "14px", color: DARK_GREEN, textDecoration: "none", fontWeight: "600" }}>← Continue Shopping</Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Cart;