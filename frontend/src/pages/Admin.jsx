import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "https://novamart-backend.vercel.app";
const STATUS = {
  pending:   { bg:"#fff7e0", color:"#b45309", label:"⏳ Pending" },
  confirmed: { bg:"#e0f0ff", color:"#1d4ed8", label:"📞 Confirmed" },
  delivered: { bg:"#e8f9ee", color:"#15803d", label:"✅ Delivered" },
  cancelled: { bg:"#fee2e2", color:"#991b1b", label:"❌ Cancelled" },
};
const EMPTY = { name:"", price:"", category:"", description:"", stock:"", image:"", discount:"" };

export default function Admin() {
  const [tab, setTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pSearch, setPSearch] = useState("");

  useEffect(() => {
    if (tab === "orders") fetchOrders();
    if (tab === "products") fetchProducts();
  }, [tab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try { const r = await axios.get(`${API}/api/orders`); setOrders(r.data); } catch(e) { console.error(e); }
    finally { setOrdersLoading(false); }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try { const r = await axios.get(`${API}/api/products`); setProducts(r.data); } catch(e) { console.error(e); }
    finally { setProductsLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try { await axios.patch(`${API}/api/orders/${id}/status`, { status }); setOrders(p => p.map(o => o._id===id?{...o,status}:o)); }
    catch { alert("Failed to update status"); }
  };

  const startEdit = p => {
    setEditId(p._id);
    setForm({ name:p.name||"", price:p.price||"", category:p.category||"", description:p.description||"", stock:p.stock??"", image:p.image||"", discount:p.discount||"" });
    setTab("form");
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { alert("Name and price are required."); return; }
    setSaving(true);
    try {
      const payload = { ...form, price:Number(form.price), stock:Number(form.stock)||0, discount:Number(form.discount)||0 };
      if (editId) {
        const r = await axios.put(`${API}/api/products/${editId}`, payload);
        setProducts(p => p.map(x => x._id===editId?r.data:x));
      } else {
        const r = await axios.post(`${API}/api/products`, payload);
        setProducts(p => [r.data,...p]);
      }
      setForm(EMPTY); setEditId(null); setSaved(true);
      setTimeout(() => { setSaved(false); setTab("products"); }, 1500);
    } catch { alert("Failed to save product."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try { await axios.delete(`${API}/api/products/${id}`); setProducts(p => p.filter(x => x._id!==id)); if (editId===id) { setEditId(null); setForm(EMPTY); } }
    catch { alert("Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const fp = products.filter(p => (p.name||"").toLowerCase().includes(pSearch.toLowerCase()) || (p.category||"").toLowerCase().includes(pSearch.toLowerCase()));

  const tabBtn = (key, label) => (
    <button className={`admin-tab${tab===key?" on":""}`} onClick={() => setTab(key)}>{label}</button>
  );

  return (
    <>
      <Navbar />
      <div className="admin-page">
        <h1 className="admin-h1">🌿 Admin Dashboard</h1>
        <p className="admin-sub">Manage products, orders and promotions</p>

        <div className="admin-tabs">
          {tabBtn("products", `📦 Products${products.length>0?` (${products.length})`:""}`)}
          {tabBtn("form", editId ? "✏️ Edit" : "➕ Add")}
          {tabBtn("orders", `📋 Orders${orders.length>0?` (${orders.length})`:""}`)}
        </div>

        {/* Products list */}
        {tab === "products" && (
          <div>
            <div className="admin-search">
              <span className="admin-search-icon">🔍</span>
              <input type="text" placeholder="Search products..." value={pSearch} onChange={e=>setPSearch(e.target.value)} className="admin-search-input" />
            </div>
            {productsLoading ? <p style={{color:"#888",textAlign:"center",padding:"2rem"}}>Loading...</p> :
             fp.length === 0 ? <p style={{color:"#aaa",textAlign:"center",padding:"2rem"}}>No products found.</p> :
             fp.map(p => (
              <div key={p._id} className="admin-product-row">
                <img src={p.image||"https://placehold.co/52x52?text=Item"} alt={p.name} className="admin-product-img" onError={e=>{e.target.src="https://placehold.co/52x52?text=Item";}} />
                <div className="admin-product-info">
                  <div className="admin-product-name">{p.name}</div>
                  <div className="admin-product-meta">{p.category} · ETB {Number(p.price).toLocaleString()} · Stock: {p.stock??0}</div>
                  <div className="admin-product-badges">
                    {p.discount>0 && <span className="admin-badge disc">-{p.discount}%</span>}
                    {p.stock===0 && <span className="admin-badge out">Out of stock</span>}
                  </div>
                </div>
                <div className="admin-product-actions">
                  <button className="admin-edit-btn" onClick={()=>startEdit(p)}>✏️ Edit</button>
                  <button className="admin-del-btn" onClick={()=>handleDelete(p._id,p.name)} disabled={deletingId===p._id}>
                    {deletingId===p._id?"...":"🗑"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit form */}
        {tab === "form" && (
          <div>
            <div className="admin-form-header">
              <h2 className="admin-form-title">{editId?"✏️ Edit Product":"➕ Add Product"}</h2>
              {editId && <button className="admin-cancel-btn" onClick={()=>{setEditId(null);setForm(EMPTY);setTab("products");}}>✕ Cancel</button>}
            </div>
            {[["Product Name","name","e.g. Fresh Milk 1L","text"],["Price (ETB)","price","e.g. 120","number"],["Category","category","e.g. Dairy","text"],["Description","description","Short description...","text"],["Stock Quantity","stock","e.g. 50","number"],["Image URL","image","https://...","text"]].map(([l,k,ph,t])=>(
              <div key={k} className="admin-field">
                <label>{l}</label>
                <input type={t} placeholder={ph} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} />
              </div>
            ))}
            <div className="admin-discount-field">
              <label className="admin-discount-label">🔥 Discount % (optional — 0 for no discount)</label>
              <input type="number" placeholder="e.g. 20 means 20% off" value={form.discount} min="0" max="90" onChange={e=>setForm(p=>({...p,discount:e.target.value}))} className="admin-discount-input" />
              {form.discount>0 && form.price && (
                <div className="admin-discount-preview">
                  Customers see: <s>ETB {Number(form.price).toLocaleString()}</s> → <strong>ETB {Math.round(form.price-form.price*form.discount/100).toLocaleString()}</strong>
                </div>
              )}
            </div>
            <button className={`admin-save-btn${saved?" saved":""}`} onClick={handleSave} disabled={saving}>
              {saved?"✓ Saved!":saving?"Saving...":editId?"Update Product":"Add Product"}
            </button>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div>
            <div className="admin-orders-header">
              <span className="admin-orders-count">{orders.length} order{orders.length!==1?"s":""}</span>
              <button className="admin-refresh-btn" onClick={fetchOrders}>🔄 Refresh</button>
            </div>
            {ordersLoading ? <p style={{color:"#888",textAlign:"center",padding:"2rem"}}>Loading...</p> :
             orders.length===0 ? (
              <div style={{textAlign:"center",padding:"3rem 0",color:"#aaa"}}>
                <div style={{fontSize:40,marginBottom:10}}>📭</div>
                <p>No orders yet.</p>
              </div>
            ) : orders.map(order => {
              const st = STATUS[order.status]||STATUS.pending;
              const exp = expandedOrder===order._id;
              return (
                <div key={order._id} className="admin-order-card">
                  <div className="admin-order-header" onClick={()=>setExpandedOrder(exp?null:order._id)}>
                    <div className="admin-order-info">
                      <div className="admin-order-name">{order.customer.name}</div>
                      <div className="admin-order-contact">📞 {order.customer.phone} · 🏠 Block {order.customer.block}, House {order.customer.houseNumber}</div>
                      <div className="admin-order-date">{new Date(order.createdAt).toLocaleString()}</div>
                      <span className="admin-status-badge" style={{background:st.bg,color:st.color}}>{st.label}</span>
                    </div>
                    <div className="admin-order-right">
                      <div className="admin-order-total">ETB {Number(order.totalPrice).toLocaleString()}</div>
                      <div className="admin-order-items-count">{order.items.reduce((s,i)=>s+(i.qty||1),0)} items {exp?"▲":"▼"}</div>
                    </div>
                  </div>
                  {exp && (
                    <div className="admin-order-body">
                      <div className="admin-order-items-label">Items Ordered</div>
                      {order.items.map((item,i)=>(
                        <div key={i} className="admin-order-item">
                          <div className="admin-order-item-left">
                            <img src={item.image||"https://placehold.co/36x36?text=Item"} alt={item.name} className="admin-order-item-img" onError={e=>{e.target.src="https://placehold.co/36x36?text=Item";}} />
                            <span className="admin-order-item-name">{item.name} <span style={{color:"#aaa"}}>x{item.qty||1}</span></span>
                          </div>
                          <span className="admin-order-item-price">ETB {(Number(item.price)*(item.qty||1)).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="admin-status-label">Update Status</div>
                      <div className="admin-status-btns">
                        {Object.entries(STATUS).map(([k,v])=>(
                          <button key={k} className={`admin-status-btn${order.status===k?" on":""}`} onClick={()=>updateStatus(order._id,k)}>{v.label}</button>
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
      <div className="nm-footer">🌿 Nova Milk &amp; Mart — Fresh Milk. Quality Products. Better Life.</div>
    </>
  );
}