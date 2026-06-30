import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "https://novamart-backend.vercel.app";
const DARK_GREEN = "#1a5c2a";
const BRIGHT_GREEN = "#6abf3a";

const STATUS_COLORS = {
  pending:   { bg: "#fff7e0", color: "#b45309", label: "⏳ Pending" },
  confirmed: { bg: "#e0f0ff", color: "#1d4ed8", label: "📞 Confirmed" },
  delivered: { bg: "#e8f9ee", color: "#15803d", label: "✅ Delivered" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", label: "❌ Cancelled" },
};

const EMPTY_FORM = { name: "", price: "", category: "", description: "", stock: "", image: "", discount: "" };

function Admin() {
  const [activeTab, setActiveTab] = useState("products");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "products") fetchProducts();
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get(`${API}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await axios.get(`${API}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/api/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      description: product.description || "",
      stock: product.stock ?? "",
      image: product.image || "",
      discount: product.discount || "",
    });
    setActiveTab("addProduct");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleProductSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Name and price are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        discount: Number(form.discount) || 0,
      };

      if (editingId) {
        const res = await axios.put(`${API}/api/products/${editingId}`, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
      } else {
        const res = await axios.post(`${API}/api/products`, payload);
        setProducts((prev) => [res.data, ...prev]);
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      alert("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const tabBtn = (key, label) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{
        padding: "10px 20px",
        border: "none",
        borderBottom: activeTab === key ? `3px solid ${DARK_GREEN}` : "3px solid transparent",
        background: "none",
        color: activeTab === key ? DARK_GREEN : "#888",
        fontWeight: activeTab === key ? "700" : "500",
        fontSize: "14px",
        cursor: "pointer",
        transition: "color 0.15s",
        whiteSpace: "nowrap",
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
          Manage products, orders and promotions
        </p>

        <div style={{ borderBottom: "1px solid #e0e0e0", marginBottom: "28px", display: "flex", overflowX: "auto" }}>
          {tabBtn("products", `📦 Products${products.length > 0 ? ` (${products.length})` : ""}`)}
          {tabBtn("addProduct", editingId ? "✏️ Edit Product" : "➕ Add Product")}
          {tabBtn("orders", `📋 Orders${orders.length > 0 ? ` (${orders.length})` : ""}`)}
        </div>

        {activeTab === "products" && (
          <div>
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
              <input
                type="text"
                placeholder="Search products to edit..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: "14px", border: "1.5px solid #cde8ba", borderRadius: "10px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {productsLoading ? (
              <p style={{ color: "#888", textAlign: "center", padding: "3rem 0" }}>Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa" }}>
                <p style={{ fontSize: "16px" }}>No products found.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredProducts.map((p) => (
                  <div key={p._id} style={{ border: "1px solid #d4edba", borderRadius: "12px", padding: "12px", display: "flex", alignItems: "center", gap: "12px", background: "#fff" }}>
                    <img
                      src={p.image || "https://placehold.co/60x60?text=Item"}
                      alt={p.name}
                      style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                      onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Item"; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: DARK_GREEN }}>{p.name}</p>
                        {p.discount > 0 && (
                          <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px" }}>
                            -{p.discount}%
                          </span>
                        )}
                        {p.stock === 0 && (
                          <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px" }}>
                            Out of stock
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>
                        {p.category} · ETB {Number(p.price).toLocaleString()} · Stock: {p.stock ?? 0}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        onClick={() => startEdit(p)}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: `1.5px solid ${DARK_GREEN}`, background: "#fff", color: DARK_GREEN, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id, p.name)}
                        disabled={deletingId === p._id}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #ffb3b3", background: "#fff", color: "#cc3333", fontSize: "12px", fontWeight: "600", cursor: deletingId === p._id ? "not-allowed" : "pointer" }}
                      >
                        {deletingId === p._id ? "..." : "🗑 Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "addProduct" && (
          <div style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: DARK_GREEN, margin: 0, fontSize: "20px" }}>
                {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
              </h2>
              {editingId && (
                <button
                  onClick={cancelEdit}
                  style={{ background: "none", border: "1.5px solid #ddd", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", color: "#666", cursor: "pointer", fontWeight: "500" }}
                >
                  ✕ Cancel edit
                </button>
              )}
            </div>

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

            <div style={{ marginBottom: "18px", background: "#fff7ed", border: "1.5px solid #fcd34d", borderRadius: "10px", padding: "12px 14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#92400e", marginBottom: "6px" }}>
                🔥 Discount % (optional — leave empty or 0 for no promotion)
              </label>
              <input
                type="number"
                placeholder="e.g. 20 means 20% off"
                value={form.discount}
                min="0"
                max="90"
                onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", fontSize: "14px", border: "1.5px solid #fcd34d", borderRadius: "8px", outline: "none", boxSizing: "border-box", background: "#fff" }}
              />
              {form.discount > 0 && form.price && (
                <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#92400e" }}>
                  Customers will see: <strike>ETB {Number(form.price).toLocaleString()}</strike>{" "}
                  <strong>ETB {Math.round(form.price - (form.price * form.discount) / 100).toLocaleString()}</strong> — shown in 🔥 Today's Promotions
                </p>
              )}
            </div>

            <button
              onClick={handleProductSubmit}
              disabled={saving}
              style={{ width: "100%", padding: "13px", background: saved ? BRIGHT_GREEN : saving ? "#aaa" : DARK_GREEN, color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", marginTop: "8px", transition: "background 0.2s" }}
            >
              {saved ? "✓ Saved!" : saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                {orders.length} order{orders.length !== 1 ? "s" : ""} total
              </p>
              <button
                onClick={fetchOrders}
                style={{ background: "none", border: "1.5px solid #cde8ba", borderRadius: "8px", color: DARK_GREEN, padding: "6px 14px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}
              >
                🔄 Refresh
              </button>
            </div>

            {ordersLoading ? (
              <p style={{ color: "#888", textAlign: "center", padding: "3rem 0" }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#aaa" }}>
                <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📭</p>
                <p style={{ fontSize: "16px", color: "#777" }}>No orders yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {orders.map((order) => {
                  const st = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  const isExpanded = expandedOrder === order._id;
                  const date = new Date(order.createdAt).toLocaleString();

                  return (
                    <div key={order._id} style={{ border: "1px solid #d4edba", borderRadius: "14px", background: "#fff", boxShadow: "0 2px 6px rgba(26,92,42,0.06)", overflow: "hidden" }}>
                      <div
                        style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: DARK_GREEN }}>{order.customer.name}</p>
                            <span style={{ background: st.bg, color: st.color, fontSize: "11px", fontWeight: "600", padding: "2px 10px", borderRadius: "999px" }}>
                              {st.label}
                            </span>
                          </div>
                          <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#777" }}>
                            📞 {order.customer.phone} &nbsp;·&nbsp; 🏠 Block {order.customer.block}, House {order.customer.houseNumber}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#aaa" }}>{date}</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "16px", color: DARK_GREEN }}>
                            ETB {Number(order.totalPrice).toLocaleString()}
                          </p>
                          <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>
                            {order.items.reduce((s, i) => s + (i.qty || 1), 0)} items &nbsp;{isExpanded ? "▲" : "▼"}
                          </p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: "1px solid #eef7e8", padding: "14px 18px", background: "#fafef7" }}>
                          <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "600", color: DARK_GREEN, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Items Ordered
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <img src={item.image || "https://placehold.co/40x40?text=Item"} alt={item.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Item"; }} />
                                  <span style={{ color: "#333" }}>{item.name} <span style={{ color: "#aaa" }}>x{item.qty || 1}</span></span>
                                </div>
                                <span style={{ fontWeight: "600", color: DARK_GREEN }}>
                                  ETB {(Number(item.price) * (item.qty || 1)).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "600", color: DARK_GREEN, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Update Status
                          </p>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {Object.entries(STATUS_COLORS).map(([key, val]) => (
                              <button
                                key={key}
                                onClick={() => updateStatus(order._id, key)}
                                style={{ padding: "6px 14px", borderRadius: "999px", border: "1.5px solid", borderColor: order.status === key ? DARK_GREEN : "#ddd", background: order.status === key ? DARK_GREEN : "#fff", color: order.status === key ? "#fff" : "#555", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}
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
      </div>

      <div style={{ background: DARK_GREEN, color: "#c8f0a8", textAlign: "center", padding: "16px", fontSize: "13px", marginTop: "40px" }}>
        🌿 Nova Milk &amp; Mart — Fresh Milk. Quality Products. Better Life.
      </div>
    </>
  );
}

export default Admin;