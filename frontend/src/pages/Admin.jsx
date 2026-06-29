import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";

const STATUS_COLORS = {
  pending:   { bg: "#fff7e0", color: "#b45309", label: "⏳ Pending" },
  confirmed: { bg: "#e0f0ff", color: "#1d4ed8", label: "📞 Confirmed" },
  delivered: { bg: "#e8f9ee", color: "#15803d", label: "✅ Delivered" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", label: "❌ Cancelled" },
};

function Admin() {
  const [activeTab, setActiveTab] = useState("orders");

  // ── Orders state ──
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // ── Add product state ──
  const [form, setForm] = useState({ name: "", price: "", category: "", description: "", stock: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get("https://novamart-backend.vercel.app/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`https://novamart-backend.vercel.app/api/orders/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleProductSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Name and price are required.");
      return;
    }
    setSaving(true);
    try {
      await axios.post("https://novamart-backend.vercel.app/api/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
      });
      setForm({ name: "", price: "", category: "", description: "", stock: "", image: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  const tabBtn = (key, label) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{
        padding: "10px 24px",
        border: "none",
        borderBottom: activeTab === key ? `3px solid ${DARK_GREEN}` : "3px solid transparent",
        background: "none",
        color: activeTab === key ? DARK_GREEN : "#888",
        fontWeight: activeTab === key ? "700" : "500",
        fontSize: "15px",
        cursor: "pointer",
        transition: "color 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
        <h1 style={{ color: DARK_GREEN, margin: "0 0 4px", fontSize: "26px", fontWeight: "800" }}>
          🌿 Admin Dashboard
        </h1>
        <p style={{ color: "#888", margin: "0 0 20px", fontSize: "14px" }}>
          Manage orders and products
        </p>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid #e0e0e0", marginBottom: "28px", display: "flex" }}>
          {tabBtn("orders", `📋 Orders${orders.length > 0 ? ` (${orders.length})` : ""}`)}
          {tabBtn("products", "➕ Add Product")}
        </div>

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                {orders.length} order{orders.length !== 1 ? "s" : ""} total
              </p>
              <button
                onClick={fetchOrders}
                style={{ background: "none", border: `1.5px solid #cde8ba`, borderRadius: "8px", color: DARK_GREEN, padding: "6px 14px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}
              >
                🔄 Refresh
              </button>
            </div>

            {ordersLoading ? (
              <p style={{ color: "#888", textAlign: "center", padding: "3rem 0" }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#aaa" }}>
                <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📭</p>
                <p style={{ fontSize: "16px", color: "#777" }}>No orders yet. They'll show up here once customers place them.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {orders.map((order) => {
                  const st = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  const isExpanded = expandedOrder === order._id;
                  const date = new Date(order.createdAt).toLocaleString();

                  return (
                    <div
                      key={order._id}
                      style={{ border: "1px solid #d4edba", borderRadius: "14px", background: "#fff", boxShadow: "0 2px 6px rgba(26,92,42,0.06)", overflow: "hidden" }}
                    >
                      {/* Order header — always visible */}
                      <div
                        style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      >
                        {/* Customer info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: DARK_GREEN }}>
                              {order.customer.name}
                            </p>
                            <span style={{ background: st.bg, color: st.color, fontSize: "11px", fontWeight: "600", padding: "2px 10px", borderRadius: "999px" }}>
                              {st.label}
                            </span>
                          </div>
                          <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#777" }}>
                            📞 {order.customer.phone} &nbsp;·&nbsp; 🏠 Block {order.customer.block}, House {order.customer.houseNumber}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#aaa" }}>{date}</p>
                        </div>

                        {/* Total + expand arrow */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "16px", color: DARK_GREEN }}>
                            ETB {Number(order.totalPrice).toLocaleString()}
                          </p>
                          <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>
                            {order.items.reduce((s, i) => s + (i.qty || 1), 0)} items &nbsp;{isExpanded ? "▲" : "▼"}
                          </p>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid #eef7e8", padding: "14px 18px", background: "#fafef7" }}>

                          {/* Items list */}
                          <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "600", color: DARK_GREEN, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Items Ordered
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <img
                                    src={item.image || "https://placehold.co/40x40?text=Item"}
                                    alt={item.name}
                                    style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }}
                                    onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Item"; }}
                                  />
                                  <span style={{ color: "#333" }}>
                                    {item.name} <span style={{ color: "#aaa" }}>x{item.qty || 1}</span>
                                  </span>
                                </div>
                                <span style={{ fontWeight: "600", color: DARK_GREEN }}>
                                  ETB {(Number(item.price) * (item.qty || 1)).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Status update */}
                          <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "600", color: DARK_GREEN, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Update Status
                          </p>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {Object.entries(STATUS_COLORS).map(([key, val]) => (
                              <button
                                key={key}
                                onClick={() => updateStatus(order._id, key)}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: "999px",
                                  border: "1.5px solid",
                                  borderColor: order.status === key ? DARK_GREEN : "#ddd",
                                  background: order.status === key ? DARK_GREEN : "#fff",
                                  color: order.status === key ? "#fff" : "#555",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                              >
                                {val.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ADD PRODUCT TAB ── */}
        {activeTab === "products" && (
          <div style={{ maxWidth: "560px" }}>
            <h2 style={{ color: DARK_GREEN, margin: "0 0 20px", fontSize: "20px" }}>Add New Product</h2>

            {[
              ["Product Name", "name", "e.g. Fresh Milk 1L", "text"],
              ["Price (ETB)", "price", "e.g. 120", "number"],
              ["Category", "category", "e.g. Dairy", "text"],
              ["Description", "description", "Short description...", "text"],
              ["Stock Quantity", "stock", "e.g. 50", "number"],
              ["Image URL", "image", "https://...", "text"],
            ].map(([label, key, placeholder, type]) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: DARK_GREEN, marginBottom: "6px" }}>
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", fontSize: "15px", border: "1.5px solid #cde8ba", borderRadius: "10px", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = DARK_GREEN)}
                  onBlur={(e) => (e.target.style.borderColor = "#cde8ba")}
                />
              </div>
            ))}

            <button
              onClick={handleProductSubmit}
              disabled={saving}
              style={{ width: "100%", padding: "13px", background: saved ? BRIGHT_GREEN : saving ? "#aaa" : DARK_GREEN, color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", marginTop: "8px", transition: "background 0.2s" }}
            >
              {saved ? "✓ Product Added!" : saving ? "Saving..." : "Add Product"}
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

export default Admin;